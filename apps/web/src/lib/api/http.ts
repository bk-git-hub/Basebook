import type { ApiErrorResponse } from "@basebook/contracts";

const DEFAULT_API_BASE_URL = "http://localhost:4000";

type QueryValue = string | number | boolean | null | undefined;

type FetchJsonOptions = {
  query?: Record<string, QueryValue>;
  init?: RequestInit;
};

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const error = (value as ApiErrorResponse).error;

  return Boolean(
    error &&
      typeof error === "object" &&
      typeof error.code === "string" &&
      typeof error.message === "string",
  );
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function buildRequestUrl(
  path: string,
  query?: Record<string, QueryValue>,
): URL {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(
    normalizedPath,
    `${normalizeBaseUrl(getApiBaseUrl())}/`,
  );

  if (!query) {
    return url;
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly requestId?: string;

  constructor(
    message: string,
    options: {
      status: number;
      code?: string;
      requestId?: string;
      cause?: unknown;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiClientError";
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
  }
}

export function getApiBaseUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
  );
}

export async function fetchJson<T>(
  path: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const { query, init } = options;
  const url = buildRequestUrl(path, query);
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
  const payload = await parseResponseBody(response);

  if (!response.ok) {
    if (isApiErrorResponse(payload)) {
      throw new ApiClientError(payload.error.message, {
        status: response.status,
        code: payload.error.code,
        requestId: payload.error.requestId,
      });
    }

    if (typeof payload === "string" && payload.trim()) {
      throw new ApiClientError(payload, { status: response.status });
    }

    throw new ApiClientError("요청이 실패했습니다.", {
      status: response.status,
    });
  }

  return payload as T;
}
