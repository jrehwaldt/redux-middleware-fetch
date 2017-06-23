import { omit, forEach } from "lodash";
import qs from "qs";

export class SimpleStorage {
  getItem(key) {
    return this[key];
  }

  setItem(key, value) {
    this[key] = value;
  }
}

let storage = new SimpleStorage();

export const API_REQUEST = "REDUX_MIDDLEWARE_FETCH/API_REQUEST";
export const API_NO_TOKEN_STORED = "REDUX_MIDDLEWARE_FETCH/API_NO_TOKEN_STORED";
export const API_REQUEST_START = "REDUX_MIDDLEWARE_FETCH/API_REQUEST_START";
export const API_REQUEST_END = "REDUX_MIDDLEWARE_FETCH/API_REQUEST_END";

export function setAPIHost(host) {
  storage.setItem("host", host);
}

export function setToken(token) {
  storage.setItem("accessToken", token);
}

export function setStorage(customStorage) {
  storage = customStorage;
}

export default () => next => async action => {
  const requestOptions = action[API_REQUEST];

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
    headers
  } = requestOptions;

  const dispatchPayload = omit(requestOptions.dispatchPayload || {}, "type");
  const customHeaders = headers || {};

  const [successType, errorType, requestType] = types;

  // Fetch Endpoint
  const fetchOptions = {
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
      return next({
        type: API_NO_TOKEN_STORED
      });
    }
  }

  // ContentType
  if (json) {
    fetchOptions.headers["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(body || {});
  }

  // x-www-form-urlencoded
  if (urlEncoded) {
    fetchOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
    fetchOptions.body = qs.stringify(body || {});
  }

  // FormData
  if (formData) {
    fetchOptions.body = new FormData();
    forEach(body, (val, key) => {
      if (val) {
        if (val instanceof FileList) {
          [].forEach.call(val, file => fetchOptions.body.append(key, file));
        } else {
          fetchOptions.body.append(key, val);
        }
      }
    });
  }

  const response;
  const responseJson;

  try {
    const url = `${fqdn || storage.getItem("host") || "/api"}${entrypoint}`;
    // Before Request
    if (requestType) {
      next({
        type: requestType,
        entrypoint,
        url,
        fetchOptions
      });
    }

    // Request Animation Start
    next({
      type: API_REQUEST_START
    });

    response = await fetch(url, fetchOptions);

    // Request Animation End
    next({
      type: API_REQUEST_END
    });

    if (response.ok) {
      if (response.status === 204) {
        responseJson = {};
      } else {
        responseJson = await response.json();
      }
    } else {
      responseJson = await response.json();

      if (onFailed) {
        onFailed(response.message, responseJson, response);
      }

      return next({
        ...dispatchPayload,
        error: response.message,
        payload: responseJson,
        response: response,
        type: errorType
      });
    }
  } catch (error) {
    if (onFailed) {
      onFailed(error.message, error, response);
    }

    if (errorType) {
      next({
        ...dispatchPayload,
        error,
        response: response,
        type: errorType
      });
    }

    return console.error(error);
  }

  if (onSuccess) {
    onSuccess(responseJson, response);
  }

  return next({
    ...dispatchPayload,
    payload: responseJson,
    response: response,
    type: successType
  });
};
