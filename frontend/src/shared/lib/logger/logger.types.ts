export type LogMetadata = Readonly<{
  code?: string;
  status?: number;
}>;

export type Logger = {
  debug: (message: string, metadata?: LogMetadata) => void;
  error: (message: string, metadata?: LogMetadata) => void;
  info: (message: string, metadata?: LogMetadata) => void;
  warn: (message: string, metadata?: LogMetadata) => void;
};
