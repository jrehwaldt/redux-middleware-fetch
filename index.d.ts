import { Middleware, Dispatch, Action } from "redux";

export const API_REQUEST = "REDUX_MIDDLEWARE_FETCH/API_REQUEST";
export type API_REQUEST = typeof API_REQUEST;
export const NO_TOKEN_STORED = "REDUX_MIDDLEWARE_FETCH/NO_TOKEN_STORED";
export type NO_TOKEN_STORED = typeof NO_TOKEN_STORED;
export const API_REQUEST_SENT = "REDUX_MIDDLEWARE_FETCH/API_REQUEST_SENT";
export type API_REQUEST_SENT = typeof API_REQUEST_SENT;
export const API_FINISHED = "REDUX_MIDDLEWARE_FETCH/API_FINISHED";
export type API_FINISHED = typeof API_FINISHED;

export interface FetchAction extends Action {
  type: API_REQUEST;
  entrypoint: string;
  types: [string | null, string, string];

  method?: "GET" | "POST" | "DELETE" | "PUT" | "OPTION" | "HEAD" | "PATCH";
  body?: any;

  auth?: boolean;
  json?: boolean;
  formData?: boolean;
  urlEncoded?: boolean;

  onSuccess?: () => void;
  onFailed?: () => void;

  fqdn?: string;
  headers?: { [key: string]: string };
}

declare module "redux" {
  export interface Dispatch<S> {
    <R>(fetchAction: FetchAction): R;
  }
}

declare const fetchMiddleware: Middleware & {
  withExtraArgument(extraArgument: any): Middleware;
};

export default fetchMiddleware;

export interface Storage {
  getItem: (key: string) => any;
  setItem: (key: string, value: any) => void;
}

export function setStorage(storage: Storage): void;
export function setAPIHost(host: string): void;
export function setToken(token: string): void;
