import type { ApiError } from './ApiError';

export type ApiResponseType = 'json' | 'text' | 'void';

export type ApiRequestOptions = Omit<RequestInit, 'body' | 'method' | 'signal'> & {
  body?: unknown;
  responseType?: ApiResponseType;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type ApiRequest = {
  init: RequestInit;
  responseType: ApiResponseType;
  timeoutMs: number;
  url: string;
};

export type ApiRequestInterceptor = (request: ApiRequest) => ApiRequest | Promise<ApiRequest>;

export type ApiResponseInterceptor = (
  response: Response,
  request: ApiRequest,
) => Promise<Response> | Response;

export type ApiErrorInterceptor = (error: ApiError, request: ApiRequest) => Promise<void> | void;

export type ApiClientOptions = {
  baseUrl: string;
  timeoutMs: number;
};
