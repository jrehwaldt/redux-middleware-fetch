import { Middleware, Dispatch, Action } from "redux";
export {
  API_REQUEST,
  NO_TOKEN_STORED,
  API_REQUEST_SENT,
  API_FINISHED
} from "./src/middleware";

export type API_REQUEST = typeof API_REQUEST;
export type NO_TOKEN_STORED = typeof NO_TOKEN_STORED;
export type API_REQUEST_SENT = typeof API_REQUEST_SENT;
export type API_FINISHED = typeof API_FINISHED;

export interface FetchOption {
  entrypoint: string;
  types: [string | symbol, string | symbol | null, string | symbol | null];

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

export interface FetchAction extends Action {
  // TODO it is currently not possible to type check constant computed keys
  // due to @see https://github.com/Microsoft/TypeScript/issues/5579
  //[API_REQUEST]: FetchOption;
  ["REDUX_MIDDLEWARE_FETCH/API_REQUEST"]: FetchOption;
}

declare module "redux" {
  export interface Dispatch<S> {
    <R>(fetchAction: FetchAction): R;
  }
}

declare const fetchMiddleware: Middleware;
export default fetchMiddleware;

export interface Storage {
  getItem: (key: string) => any;
  setItem: (key: string, value: any) => void;
}

export function setStorage(storage: Storage): void;
export function setAPIHost(host: string): void;
export function setToken(token: string): void;
