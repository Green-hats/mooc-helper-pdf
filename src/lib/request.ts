import ky from "ky";
import { fetch } from "@tauri-apps/plugin-http";
import mapValues from "lodash/mapValues";
import store from "./store";

interface RequestOptions {
  url: string;
  method?: string;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

async function requestWeb<T>(options: RequestOptions) {
  const mobToken = await store.get("mob-token");

  const response = await ky(options.url, {
    prefixUrl: "/api",
    method: options.method,
    headers: {
      ...options.headers,
      "edu-app-type": "android",
    },
    searchParams: {
      ...options.query,
      "mob-token": mobToken ?? "",
    },
    json: options.body,
    timeout: options.timeout,
  });

  const data = await response.json<T>();

  return data;
}

async function requestTauri<T>(options: RequestOptions) {
  const { url, query, body, timeout } = options;

  const mobToken = await store.get("mob-token");

  const handledQuery = mapValues(
    {
      ...query,
      "mob-token": mobToken ?? "",
    },
    (value) => String(value)
  );

  const searchParams = new URLSearchParams(handledQuery).toString();
  const baseUrl = `https://www.icourse163.org/${url}`;
  const target = searchParams ? `${baseUrl}?${searchParams}` : baseUrl;

  const response = await fetch(target, {
    method: options.method ?? "GET",
    headers: {
      ...options.headers,
      "edu-app-type": "android",
    },
    body: body != null ? JSON.stringify(body) : undefined,
    connectTimeout: timeout,
  });

  return (await response.json()) as unknown as T;
}

const request = process.env.NEXT_PUBLIC_TAURI ? requestTauri : requestWeb;

export default request;
