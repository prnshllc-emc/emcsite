/**
 * Reconciliation Scheduler — Runs auto-reconciliation at fixed intervals.
 *
 * Default: every 6 hours (configurable via RECONCILIATION_INTERVAL_MS env).
 * Also supports manual trigger via exported function.
 *
 * The scheduler:
 * 1. Runs reconciliation for all active customers
 * 2. Logs results
 * 3. Notifies owner if there are items requiring attention
 */

import { runReconciliation } from "./service";
import { notifyOwner } from "../../_core/notification";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let isRunning = false;
let lastRunAt: Date | null = null;
let lastRunResult: {
  total: number;
  updated: number;
  unchanged: number;
  skippedManualOverride: number;
  orphanBls: number;
} | null = null;

// ══════════════════════════════════════════════════════════════
// RUN ONCE
// ══════════════════════════════════════════════════════════════

export async function runScheduledReconciliation(): Promise<typeof lastRunResult> {
  if (isRunning) {
    console.log("[Scheduler] Reconciliation already running, skipping...");
    return lastRunResult;
  }

  isRunning = true;
  const startTime = Date.now();

  try {
    console.log("[Scheduler] Starting scheduled reconciliation...");

    const result = await runReconciliation();

    lastRunAt = new Date();
    lastRunResult = {
      total: result.total,
      updated: result.updated,
      unchanged: result.unchanged,
      skippedManualOverride: result.skippedManualOverride,
      orphanBls: result.orphanBls,
    };

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[Scheduler] Reconciliation complete in ${elapsed}s: ` +
        `${result.total} total, ${result.updated} updated, ` +
        `${result.unchanged} unchanged, ${result.skippedManualOverride} skipped (manual), ` +
        `${result.orphanBls} orphan BLs`
    );

    // Notify owner if there are items requiring attention
    const requiresAttention = result.results.filter((r) => r.requiresAdminReview);
    if (requiresAttention.length > 0 || result.orphanBls > 0) {
      const lines: string[] = [];
      lines.push(`Reconciliação automática concluída em ${elapsed}s.`);
      lines.push(`Total: ${result.total} | Atualizados: ${result.updated} | Sem mudança: ${result.unchanged}`);

      if (requiresAttention.length > 0) {
        lines.push(`\n⚠️ ${requiresAttention.length} cliente(s) precisam de atenção:`);
        for (const r of requiresAttention.slice(0, 10)) {
          lines.push(`  • ${r.customerName}: ${r.summary}`);
        }
        if (requiresAttention.length > 10) {
          lines.push(`  ... e mais ${requiresAttention.length - 10} itens`);
        }
      }

      if (result.orphanBls > 0) {
        lines.push(`\n📦 ${result.orphanBls} BL(s) sem cliente vinculado (pode ser operação recorrente).`);
      }

      await notifyOwner({
        title: `🔄 Reconciliação: ${result.updated} atualizado(s), ${requiresAttention.length} atenção`,
        content: lines.join("\n"),
      }).catch((err) =>
        console.error("[Scheduler] Failed to notify owner:", err)
      );
    }

    return lastRunResult;
  } catch (err) {
    console.error("[Scheduler] Reconciliation failed:", err);

    await notifyOwner({
      title: "❌ Reconciliação automática falhou",
      content: `Erro: ${(err as Error).message}\n\nVerifique os logs do servidor.`,
    }).catch(() => {});

    return lastRunResult;
  } finally {
    isRunning = false;
  }
}

// ══════════════════════════════════════════════════════════════
// START / STOP SCHEDULER
// ══════════════════════════════════════════════════════════════

export function startReconciliationScheduler(): void {
  if (intervalHandle) {
    console.log("[Scheduler] Already running, stopping first...");
    stopReconciliationScheduler();
  }

  const intervalMs = parseInt(
    process.env.RECONCILIATION_INTERVAL_MS ?? String(SIX_HOURS_MS),
    10
  );

  console.log(
    `[Scheduler] Starting reconciliation scheduler (every ${(intervalMs / 3600000).toFixed(1)}h)`
  );

  // Run once on startup (after a short delay to let DB connect)
  setTimeout(() => {
    runScheduledReconciliation().catch(console.error);
  }, 10_000);

  // Then run at interval
  intervalHandle = setInterval(() => {
    runScheduledReconciliation().catch(console.error);
  }, intervalMs);
}

export function stopReconciliationScheduler(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log("[Scheduler] Reconciliation scheduler stopped.");
  }
}

// ══════════════════════════════════════════════════════════════
// STATUS
// ══════════════════════════════════════════════════════════════

export function getSchedulerStatus(): {
  running: boolean;
  lastRunAt: Date | null;
  lastRunResult: typeof lastRunResult;
  isReconciling: boolean;
} {
  return {
    running: intervalHandle !== null,
    lastRunAt,
    lastRunResult,
    isReconciling: isRunning,
  };
}
