import { Middleware, Dispatch, Action } from "redux";
export {
  API_REQUEST,
  API_NO_TOKEN_STORED,
  API_REQUEST_START,
  API_REQUEST_END
} from "./src/middleware";

//export type API_REQUEST = typeof API_REQUEST;
//export type NO_TOKEN_STORED = typeof NO_TOKEN_STORED;
//export type API_REQUEST_SENT = typeof API_REQUEST_SENT;
//export type API_FINISHED = typeof API_FINISHED;

export type FetchUUID = string | number;

export interface FetchOption {
  entrypoint: string;
  types: [string | symbol, string | symbol | null, string | symbol | null];

  method?: "GET" | "POST" | "DELETE" | "PUT" | "OPTION" | "HEAD" | "PATCH";
  body?: any;

  auth?: boolean;
  json?: boolean;
  formData?: boolean;
  urlEncoded?: boolean;

  onSuccess?: (json: {}, response: Response) => void;
  onFailed?: (
    errorMessage: string,
    error: Error | {},
    response?: Response
  ) => void;

  fqdn?: string;
  headers?: { [key: string]: string };
  dispatchPayload?: {};
  uuid?: FetchUUID;
}

export interface FetchAction {
  // TODO it is currently not possible to type check constant computed keys
  // due to @see https://github.com/Microsoft/TypeScript/issues/5579
  //[API_REQUEST]: FetchOption;
  [key: string]: FetchOption;
}

export interface FetchResult<P> extends Action {
  payload: P;
  response: Response;
  uuid: FetchUUID;
}
export interface FetchFailure<P> extends Action {
  error: Error | string;
  payload?: P;
  response?: ResponseInit;
  uuid: FetchUUID;
}
export interface FetchInitiation extends Action {
  entrypoint: string;
  url: string;
  fetchOptions: RequestInit;
  uuid: FetchUUID;
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
