/**
 * Events Module — Internal event bus for decoupled communication
 * and Server-Sent Events (SSE) for real-time admin updates.
 */
import type { Response } from "express";

// ── Event Types ──────────────────────────────────────────────
export type EventType =
  | "bl:created"
  | "bl:updated"
  | "bl:status_changed"
  | "tracking:code_generated"
  | "tracking:code_used"
  | "tracking:history_added"
  | "customer:created"
  | "customer:updated"
  | "vehicle:created"
  | "vehicle:reconciled"
  | "email:processed"
  | "contract:signed"
  | "invite:completed"
  | "system:config_changed";

export interface AppEvent {
  type: EventType;
  payload: Record<string, unknown>;
  timestamp: number;
}

type EventHandler = (event: AppEvent) => void | Promise<void>;

// ── Internal Event Bus ───────────────────────────────────────
class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  on(type: EventType | "*", handler: EventHandler): () => void {
    const existing = this.handlers.get(type) ?? [];
    existing.push(handler);
    this.handlers.set(type, existing);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type) ?? [];
      const index = handlers.indexOf(handler);
      if (index >= 0) handlers.splice(index, 1);
    };
  }

  emit(type: EventType, payload: Record<string, unknown>): void {
    const event: AppEvent = { type, payload, timestamp: Date.now() };

    // Notify specific handlers
    const handlers = this.handlers.get(type) ?? [];
    handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`[EventBus] Handler error for ${type}:`, error);
      }
    });

    // Notify wildcard handlers
    const wildcardHandlers = this.handlers.get("*") ?? [];
    wildcardHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`[EventBus] Wildcard handler error:`, error);
      }
    });

    // Broadcast to SSE clients
    sseManager.broadcast(event);
  }
}

export const eventBus = new EventBus();

// ── SSE Manager ──────────────────────────────────────────────
class SSEManager {
  private clients = new Set<Response>();

  addClient(res: Response): () => void {
    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`);

    this.clients.add(res);

    // Heartbeat every 30s
    const heartbeat = setInterval(() => {
      try {
        res.write(": heartbeat\n\n");
      } catch {
        clearInterval(heartbeat);
        this.clients.delete(res);
      }
    }, 30_000);

    // Return cleanup function
    return () => {
      clearInterval(heartbeat);
      this.clients.delete(res);
    };
  }

  broadcast(event: AppEvent): void {
    const data = JSON.stringify(event);
    const deadClients: Response[] = [];

    this.clients.forEach((client) => {
      try {
        client.write(`data: ${data}\n\n`);
      } catch {
        deadClients.push(client);
      }
    });

    // Clean up dead connections
    deadClients.forEach((client) => this.clients.delete(client));
  }

  get clientCount(): number {
    return this.clients.size;
  }
}

export const sseManager = new SSEManager();
