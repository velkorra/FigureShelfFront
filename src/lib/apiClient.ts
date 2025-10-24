import { z } from "zod";

const AUTH_TOKEN_NAME = "auth_token";
const REFRESH_TOKEN_NAME = "refresh_token";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any, message?: string) {
    super(message || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "/api";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api`;
  return `https://api.figureshelf.local`;
};

const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const baseHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = getCookie(AUTH_TOKEN_NAME);
    if (token) {
      baseHeaders["Authorization"] = `Bearer ${token}`;
    }
  } else {
    if (INTERNAL_API_KEY) {
      baseHeaders["X-Internal-API-Key"] = INTERNAL_API_KEY;
    }
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...baseHeaders,
      ...options.headers,
    },
  };

  try {
    console.log(getBaseUrl());
    const response = await fetch(`${getBaseUrl()}${endpoint}`, mergedOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData, response.statusText);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();

    if (schema) {
      return schema.parse(data);
    }

    return data;
  } catch (error) {
    const originalRequest = { endpoint, options, schema };

    if (
      error instanceof ApiError &&
      error.status === 401 &&
      typeof window !== "undefined" &&
      !(options.headers as Record<string, string> | undefined)?.["X-Retry"]
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() =>
          request(
            originalRequest.endpoint,
            {
              ...originalRequest.options,
              headers: {
                ...originalRequest.options.headers,
                "X-Retry": "true",
              },
            },
            originalRequest.schema
          )
        );
      }

      isRefreshing = true;

      return new Promise<T>((resolve, reject) => {
        const refreshToken = getCookie(REFRESH_TOKEN_NAME);
        if (!refreshToken) {
          processQueue(new Error("No refresh token available."));
          return reject(error);
        }

        fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })
          .then(async (res) => {
            if (!res.ok) throw new Error("Failed to refresh token");
            processQueue(null);
            resolve(
              request(
                originalRequest.endpoint,
                {
                  ...originalRequest.options,
                  headers: {
                    ...originalRequest.options.headers,
                    "X-Retry": "true",
                  },
                },
                originalRequest.schema
              )
            );
          })
          .catch((err) => {
            processQueue(err);
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    throw error;
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit, schema?: z.ZodType<T>) =>
    request<T>(endpoint, { ...options, method: "GET" }, schema),

  post: <T>(
    endpoint: string,
    body: unknown,
    options?: RequestInit,
    schema?: z.ZodType<T>
  ) =>
    request<T>(
      endpoint,
      { ...options, method: "POST", body: JSON.stringify(body) },
      schema
    ),

  put: <T>(
    endpoint: string,
    body: unknown,
    options?: RequestInit,
    schema?: z.ZodType<T>
  ) =>
    request<T>(
      endpoint,
      { ...options, method: "PUT", body: JSON.stringify(body) },
      schema
    ),

  patch: <T>(
    endpoint: string,
    body: unknown,
    options?: RequestInit,
    schema?: z.ZodType<T>
  ) =>
    request<T>(
      endpoint,
      { ...options, method: "PATCH", body: JSON.stringify(body) },
      schema
    ),

  delete: <T>(endpoint: string, options?: RequestInit, schema?: z.ZodType<T>) =>
    request<T>(endpoint, { ...options, method: "DELETE" }, schema),
};