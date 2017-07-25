import "core-js/fn/promise";
import "core-js/fn/object/assign";
import "core-js/fn/array/for-each";
import { Middleware, Action } from "redux";
export declare type FetchUUID = string | number;
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
    headers?: {
        [key: string]: string;
    };
    dispatchPayload?: D;
    uuid?: FetchUUID;
}
export interface FetchAction<P, D extends {}> {
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
    interface Dispatch<S> {
        <P, D extends {}>(fetchAction: FetchAction<P, D>): Promise<D & (FetchFailure<P> | FetchResult<P>)>;
    }
}
export interface Storage {
    getItem: (key: string) => any;
    setItem: (key: string, value: any) => void;
}
export declare const API_REQUEST = "REDUX_MIDDLEWARE_FETCH/API_REQUEST";
export declare type API_REQUEST = typeof API_REQUEST;
export declare const API_NO_TOKEN_STORED = "REDUX_MIDDLEWARE_FETCH/API_NO_TOKEN_STORED";
export declare type API_NO_TOKEN_STORED = typeof API_NO_TOKEN_STORED;
export declare const API_REQUEST_START = "REDUX_MIDDLEWARE_FETCH/API_REQUEST_START";
export declare type API_REQUEST_START = typeof API_REQUEST_START;
export declare const API_REQUEST_END = "REDUX_MIDDLEWARE_FETCH/API_REQUEST_END";
export declare type API_REQUEST_END = typeof API_REQUEST_END;
export declare function setAPIHost(host: string): void;
export declare function setToken(token: string): void;
export declare function setStorage(customStorage: Storage): void;
export declare const middleware: Middleware;
export default middleware;
