import type { Logger, LogMetadata } from './logger.types';

function write(
  level: 'debug' | 'error' | 'info' | 'warn',
  message: string,
  metadata?: LogMetadata,
) {
  if (level === 'debug' && !import.meta.env.DEV) {
    return;
  }

  const output = metadata ? [message, metadata] : [message];
  console[level](...output);
}

export const logger: Logger = {
  debug: (message, metadata) => write('debug', message, metadata),
  error: (message, metadata) => write('error', message, metadata),
  info: (message, metadata) => write('info', message, metadata),
  warn: (message, metadata) => write('warn', message, metadata),
};
