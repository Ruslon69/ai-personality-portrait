export type LogMetadata = Readonly<{
  code?: string;
  migrationId?: string;
  recoveryStrategy?: string;
  revision?: number;
  schemaVersion?: string;
  section?: string;
  status?: number;
}>;

export type Logger = {
  debug: (message: string, metadata?: LogMetadata) => void;
  error: (message: string, metadata?: LogMetadata) => void;
  info: (message: string, metadata?: LogMetadata) => void;
  warn: (message: string, metadata?: LogMetadata) => void;
};
