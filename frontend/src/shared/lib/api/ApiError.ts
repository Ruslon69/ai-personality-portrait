export type ApiErrorCode =
  'aborted' | 'http_error' | 'invalid_response' | 'network_error' | 'timeout';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;

  constructor(message: string, code: ApiErrorCode, options?: { cause?: unknown; status?: number }) {
    super(message, { cause: options?.cause });
    this.name = 'ApiError';
    this.code = code;
    this.status = options?.status;
  }
}
