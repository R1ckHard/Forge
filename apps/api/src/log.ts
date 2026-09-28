type Level = 'info' | 'warn' | 'error';

function stamp(): string {
  return new Date().toISOString().slice(11, 19);
}

function write(level: Level, message: string, extra?: unknown): void {
  const line = `[${stamp()}] ${level.toUpperCase()} ${message}`;
  if (level === 'error') {
    if (extra !== undefined) console.error(line, extra);
    else console.error(line);
    return;
  }
  if (level === 'warn') {
    if (extra !== undefined) console.warn(line, extra);
    else console.warn(line);
    return;
  }
  if (extra !== undefined) console.log(line, extra);
  else console.log(line);
}

export const log = {
  info: (message: string, extra?: unknown) => write('info', message, extra),
  warn: (message: string, extra?: unknown) => write('warn', message, extra),
  error: (message: string, extra?: unknown) => write('error', message, extra),
};
