/**
 * Reconciliation Scheduler — Runs auto-reconciliation daily at 00:01 BRT (Brasília).
 *
 * Uses a cron-style approach: checks every minute if it's time to run.
 * Schedule: 00:01 BRT = 03:01 UTC (UTC-3).
 *
 * Also supports manual trigger via exported function.
 *
 * The scheduler:
 * 1. Runs reconciliation for all active customers
 * 2. Logs results
 * 3. Notifies owner if there are items requiring attention
 */

import { runReconciliation } from "./service";
import { notifyOwner } from "../../_core/notification";

const CHECK_INTERVAL_MS = 60_000; // Check every 60 seconds
const TARGET_HOUR_UTC = 3; // 00:01 BRT = 03:01 UTC
const TARGET_MINUTE = 1;

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let isRunning = false;
let lastRunAt: Date | null = null;
let lastRunDate: string | null = null; // "YYYY-MM-DD" to prevent double runs
let lastRunResult: {
  total: number;
  updated: number;
  unchanged: number;
  skippedManualOverride: number;
  orphanBls: number;
} | null = null;

// ══════════════════════════════════════════════════════════════
// CRON CHECK — Is it time to run?
// ══════════════════════════════════════════════════════════════

function shouldRunNow(): boolean {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  const todayStr = now.toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Only run at 03:01 UTC (00:01 BRT) and only once per day
  if (utcHour === TARGET_HOUR_UTC && utcMinute === TARGET_MINUTE && lastRunDate !== todayStr) {
    return true;
  }
  return false;
}

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
    lastRunDate = lastRunAt.toISOString().slice(0, 10);
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

  console.log(
    `[Scheduler] Starting reconciliation scheduler (daily at 00:01 BRT / 03:01 UTC)`
  );

  // Check every minute if it's time to run
  intervalHandle = setInterval(() => {
    if (shouldRunNow()) {
      console.log("[Scheduler] Cron trigger: 00:01 BRT — starting reconciliation");
      runScheduledReconciliation().catch(console.error);
    }
  }, CHECK_INTERVAL_MS);
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
  schedule: string;
  nextRunEstimate: string;
} {
  // Calculate next run time
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setUTCHours(TARGET_HOUR_UTC, TARGET_MINUTE, 0, 0);
  if (nextRun <= now) {
    nextRun.setUTCDate(nextRun.getUTCDate() + 1);
  }

  return {
    running: intervalHandle !== null,
    lastRunAt,
    lastRunResult,
    isReconciling: isRunning,
    schedule: "Daily at 00:01 BRT (03:01 UTC)",
    nextRunEstimate: nextRun.toISOString(),
  };
}
