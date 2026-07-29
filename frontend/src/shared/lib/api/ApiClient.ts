import { ApiError } from './ApiError';
import type {
  ApiClientOptions,
  ApiErrorInterceptor,
  ApiRequest,
  ApiRequestInterceptor,
  ApiRequestOptions,
  ApiResponseInterceptor,
  ApiResponseType,
} from './ApiClient.types';

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function isNativeBody(value: unknown): value is BodyInit {
  return (
    typeof value === 'string' ||
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value)
  );
}

function prepareBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (isNativeBody(body)) {
    return body;
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return JSON.stringify(body);
}

async function parseResponse<T>(response: Response, responseType: ApiResponseType): Promise<T> {
  if (responseType === 'void' || response.status === 204) {
    return undefined as T;
  }

  if (responseType === 'text') {
    return (await response.text()) as T;
  }

  const contentType = response.headers.get('Content-Type');
  if (!contentType?.includes('application/json')) {
    throw new ApiError('API returned an unsupported response format', 'invalid_response', {
      status: response.status,
    });
  }

  return (await response.json()) as T;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultTimeoutMs: number;
  private readonly errorInterceptors: ApiErrorInterceptor[] = [];
  private readonly requestInterceptors: ApiRequestInterceptor[] = [];
  private readonly responseInterceptors: ApiResponseInterceptor[] = [];

  constructor({ baseUrl, timeoutMs }: ApiClientOptions) {
    this.baseUrl = baseUrl;
    this.defaultTimeoutMs = timeoutMs;
  }

  addRequestInterceptor(interceptor: ApiRequestInterceptor) {
    this.requestInterceptors.push(interceptor);
    return () => this.removeInterceptor(this.requestInterceptors, interceptor);
  }

  addResponseInterceptor(interceptor: ApiResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
    return () => this.removeInterceptor(this.responseInterceptors, interceptor);
  }

  addErrorInterceptor(interceptor: ApiErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
    return () => this.removeInterceptor(this.errorInterceptors, interceptor);
  }

  get<T>(path: string, options?: Omit<ApiRequestOptions, 'body'>) {
    return this.request<T>('GET', path, options);
  }

  post<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions, 'body'>,
  ) {
    return this.request<TResponse>('POST', path, { ...options, body });
  }

  put<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions, 'body'>,
  ) {
    return this.request<TResponse>('PUT', path, { ...options, body });
  }

  patch<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions, 'body'>,
  ) {
    return this.request<TResponse>('PATCH', path, { ...options, body });
  }

  delete<T>(path: string, options?: Omit<ApiRequestOptions, 'body'>) {
    return this.request<T>('DELETE', path, options);
  }

  async request<T>(method: string, path: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      body,
      headers: initialHeaders,
      responseType = 'json',
      signal,
      timeoutMs = this.defaultTimeoutMs,
      ...requestInit
    } = options;
    const headers = new Headers(initialHeaders);
    const preparedBody = prepareBody(body, headers);

    let request: ApiRequest = {
      init: {
        ...requestInit,
        body: preparedBody,
        headers,
        method,
        signal,
      },
      responseType,
      timeoutMs,
      url: joinUrl(this.baseUrl, path),
    };

    for (const interceptor of this.requestInterceptors) {
      request = await interceptor(request);
    }

    return this.execute<T>(request);
  }

  private async execute<T>(request: ApiRequest): Promise<T> {
    const controller = new AbortController();
    const callerSignal = request.init.signal;
    let timedOut = false;

    const abortFromCaller = () => controller.abort(callerSignal?.reason);
    if (callerSignal?.aborted) {
      abortFromCaller();
    } else {
      callerSignal?.addEventListener('abort', abortFromCaller, { once: true });
    }

    const timeoutId = globalThis.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, request.timeoutMs);

    try {
      let response = await fetch(request.url, {
        ...request.init,
        signal: controller.signal,
      });

      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response, request);
      }

      if (!response.ok) {
        throw new ApiError(`API request failed with status ${response.status}`, 'http_error', {
          status: response.status,
        });
      }

      return await parseResponse<T>(response, request.responseType);
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(
              timedOut ? 'API request timed out' : 'API request failed',
              timedOut ? 'timeout' : callerSignal?.aborted ? 'aborted' : 'network_error',
              { cause: error },
            );

      for (const interceptor of this.errorInterceptors) {
        await interceptor(apiError, request);
      }

      throw apiError;
    } finally {
      globalThis.clearTimeout(timeoutId);
      callerSignal?.removeEventListener('abort', abortFromCaller);
    }
  }

  private removeInterceptor<T>(collection: T[], interceptor: T) {
    const index = collection.indexOf(interceptor);
    if (index >= 0) {
      collection.splice(index, 1);
    }
  }
}
