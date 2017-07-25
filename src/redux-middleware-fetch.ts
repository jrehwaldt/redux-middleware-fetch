// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
import "core-js/fn/promise";
import "core-js/fn/object/assign";
import "core-js/fn/array/for-each";

import uniqueId from "lodash.uniqueid";
import forEach from "lodash.foreach";
import qs from "qs";

import { Middleware, Dispatch, MiddlewareAPI, Action } from "redux";

//
// Types
export type FetchUUID = string | number;

export interface FetchOption<P, D extends {}> {
  entrypoint: string;
  types: [string | symbol, string | symbol | null, string | symbol | null];

  method?: "GET" | "POST" | "DELETE" | "PUT" | "OPTION" | "HEAD" | "PATCH";
  body?: any;

  auth?: boolean;
  json?: boolean;
  formData?: boolean;
  urlEncoded?: boolean;

  onSuccess?: (action: D & FetchResult<P>) => void;
  onFailed?: (action: D & FetchFailure<P>) => void;

  fqdn?: string;
  headers?: { [key: string]: string };
  dispatchPayload?: D;
  uuid?: FetchUUID;
}

export interface FetchAction<P, D extends {}> {
  // TODO it is currently not possible to type check constant computed keys
  // due to @see https://github.com/Microsoft/TypeScript/issues/5579
  //[API_REQUEST]: FetchOption;
  [key: string]: FetchOption<P, D>;
}

export interface FetchResult<P> extends Action {
  payload: P;
  response: Response;
  uuid: FetchUUID;
}
export interface FetchFailure<P> extends Action {
  error: Error | string;
  payload?: P;
  response?: Response;
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
    <P, D extends {}>(fetchAction: FetchAction<P, D>): Promise<
      D & (FetchFailure<P> | FetchResult<P>)
    >;
  }
}

export interface Storage {
  getItem: (key: string) => any;
  setItem: (key: string, value: any) => void;
}

export const API_REQUEST = "REDUX_MIDDLEWARE_FETCH/API_REQUEST";
export type API_REQUEST = typeof API_REQUEST;
export const API_NO_TOKEN_STORED = "REDUX_MIDDLEWARE_FETCH/API_NO_TOKEN_STORED";
export type API_NO_TOKEN_STORED = typeof API_NO_TOKEN_STORED;
export const API_REQUEST_START = "REDUX_MIDDLEWARE_FETCH/API_REQUEST_START";
export type API_REQUEST_START = typeof API_REQUEST_START;
export const API_REQUEST_END = "REDUX_MIDDLEWARE_FETCH/API_REQUEST_END";
export type API_REQUEST_END = typeof API_REQUEST_END;

//
// Configuration implementation
class SimpleStorage implements Storage {
  store: { [key: string]: any } = {};

  getItem(key: string): any {
    return this.store[key];
  }

  setItem(key: string, value: any) {
    this.store[key] = value;
  }
}

let storage: Storage = new SimpleStorage();

export function setAPIHost(host: string): void {
  storage.setItem("host", host);
}

export function setToken(token: string): void {
  storage.setItem("accessToken", token);
}

export function setStorage(customStorage: Storage): void {
  storage = customStorage;
}

//
// Middleware implementation
export const middleware: Middleware = function<S>(
  api: MiddlewareAPI<S>
): (next: Dispatch<S>) => Dispatch<S> {
  return next => {
    return async function fetchActionHandler<P, D extends {}>(
      action: FetchAction<P, D> | any
    ): Promise<D & (FetchFailure<P> | FetchResult<P>)> {
      const requestOptions: FetchOption<P, D> | undefined = action[API_REQUEST];

      if (typeof requestOptions === "undefined") {
        return next(action);
      }

      const {
        entrypoint,
        types,
        auth,
        json,
        body,
        formData,
        method,
        onSuccess,
        onFailed,
        urlEncoded,
        fqdn,
        headers,
        uuid = uniqueId("fetch-"),
        dispatchPayload
      } = requestOptions;

      const customHeaders = headers || {};
      const [successType, errorType, requestType] = types;

      // Fetch Endpoint
      const fetchOptions: RequestInit = {
        method: method || "GET",
        headers: {
          Accept: "application/json",
          ...customHeaders
        }
      };

      // Inject JWT Token
      if (auth) {
        const token = storage.getItem("accessToken");

        if (token) {
          fetchOptions.headers.Authorization = token;
        } else {
          const noTokenAction: D & FetchFailure<P> = {
            ...dispatchPayload as {},
            type: API_NO_TOKEN_STORED,
            uuid,
            error: "Access token required."
          } as D & FetchFailure<P>;
          next(noTokenAction);
          return Promise.reject(noTokenAction);
        }
      }

      // ContentType
      if (json) {
        fetchOptions.headers["Content-Type"] = "application/json";
        fetchOptions.body = JSON.stringify(body || {});
      }

      // x-www-form-urlencoded
      if (urlEncoded) {
        fetchOptions.headers["Content-Type"] =
          "application/x-www-form-urlencoded";
        fetchOptions.body = qs.stringify(body || {});
      }

      // FormData
      if (formData) {
        fetchOptions.body = new FormData();
        forEach(body, (val, key) => {
          if (val) {
            if (val instanceof FileList) {
              [].forEach.call(val, (file: File) =>
                fetchOptions.body.append(key, file)
              );
            } else {
              fetchOptions.body.append(key, val);
            }
          }
        });
      }

      let response: Response | undefined;
      let responseJson: P | undefined;

      try {
        const url = `${fqdn || storage.getItem("host") || "/api"}${entrypoint}`;
        // Before Request
        if (requestType) {
          // TODO Due to missing support as of TypeScript 1.4.x all palces
          // which spread <...dispatchPayload> into our action contain the
          // following hack:
          // - `{...dispatchPayload as {}, ...}`
          // - `{...} as D & FetchInitiation`
          // I wasn't quite able to pinpoint the related issues.
          // Suposedly it is https://github.com/Microsoft/TypeScript/issues/10727
          // and thus could be fixed in TypeScript 2.5?!
          const initAction: D & FetchInitiation = {
            ...dispatchPayload as {},
            type: requestType,
            entrypoint,
            url,
            fetchOptions,
            uuid
          } as D & FetchInitiation;
          next(initAction);
        }

        // Request Animation Start
        next({
          ...dispatchPayload as {},
          type: API_REQUEST_START,
          uuid
        });

        response = await fetch(url, fetchOptions);

        // Request Animation End
        next({
          ...dispatchPayload as {},
          type: API_REQUEST_END,
          uuid
        });

        if (response.ok) {
          if (response.status === 204) {
            responseJson = {} as P;
          } else {
            responseJson = await response.json();
          }
        } else {
          responseJson = await response.json();

          const parseFailureAction: D & FetchFailure<P> = {
            ...dispatchPayload as {},
            error: (response as any).message,
            payload: responseJson,
            response,
            type: errorType,
            uuid
          } as D & FetchFailure<P>;
          if (onFailed) {
            onFailed(parseFailureAction);
          }
          if (errorType) {
            next(parseFailureAction);
          }
          return Promise.reject(parseFailureAction);
        }
      } catch (error) {
        const fetchFailureAction: D & FetchFailure<P> = {
          ...dispatchPayload as {},
          error,
          response,
          type: errorType,
          uuid
        } as D & FetchFailure<P>;
        if (onFailed) {
          onFailed(fetchFailureAction);
        }
        if (errorType) {
          next(fetchFailureAction);
        }

        return Promise.reject(fetchFailureAction);
      }

      const successAction: D & FetchResult<P> = {
        ...dispatchPayload as {},
        payload: responseJson,
        response,
        type: successType,
        uuid
      } as D & FetchResult<P>;
      if (onSuccess) {
        onSuccess(successAction);
      }
      next(successAction);
      return Promise.resolve(successAction);
    };
  };
};

export default middleware;
