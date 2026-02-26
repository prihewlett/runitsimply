// Structured diagnostic logger for RunItSimply
// No "use client" — works in client components, API routes, and middleware

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  return process.env.NODE_ENV === "production" ? "warn" : "debug";
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[getMinLevel()];
}

function serializeContext(ctx: Record<string, unknown>): string {
  return Object.entries(ctx)
    .map(([k, v]) => {
      if (v === undefined) return `${k}=undefined`;
      if (v === null) return `${k}=null`;
      if (v instanceof Error) return `${k}=${v.message}`;
      if (typeof v === "object") {
        try {
          return `${k}=${JSON.stringify(v)}`;
        } catch {
          return `${k}=[unserializable]`;
        }
      }
      return `${k}=${String(v)}`;
    })
    .join(" | ");
}

function createModuleLogger(module: string) {
  function log(
    level: LogLevel,
    operation: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    if (!shouldLog(level)) return;

    const prefix = `[RIS:${module}]`;
    const ts = new Date().toISOString();
    const ctxStr = context ? ` | ${serializeContext(context)}` : "";
    const fullMessage = `${prefix} ${ts} ${operation}: ${message}${ctxStr}`;

    switch (level) {
      case "debug":
        console.debug(fullMessage);
        break;
      case "info":
        console.info(fullMessage);
        break;
      case "warn":
        console.warn(fullMessage);
        break;
      case "error":
        console.error(fullMessage);
        break;
    }
  }

  return {
    debug: (op: string, msg: string, ctx?: Record<string, unknown>) =>
      log("debug", op, msg, ctx),
    info: (op: string, msg: string, ctx?: Record<string, unknown>) =>
      log("info", op, msg, ctx),
    warn: (op: string, msg: string, ctx?: Record<string, unknown>) =>
      log("warn", op, msg, ctx),
    error: (op: string, msg: string, ctx?: Record<string, unknown>) =>
      log("error", op, msg, ctx),
  };
}

export { createModuleLogger };
export type { LogLevel };
