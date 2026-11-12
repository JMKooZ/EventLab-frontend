import axios from "axios";

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0이면 서버에 연결하지 못했거나 응답이 없는 경우
  }
}

const toApiError = (error) => {
  const response = error.response;
  const status = response ? response.status : 0;
  const serverMessage = response && response.data && response.data.message;

  // 서버가 내려준 한글 메시지가 있으면 그대로 사용
  if (serverMessage) {
    return new ApiError(serverMessage, status);
  }
  if (error.code === "ECONNABORTED") {
    return new ApiError(
      "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
      0,
    );
  }
  if (!response) {
    return new ApiError(
      "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      0,
    );
  }
  return new ApiError("요청 처리 중 오류가 발생했습니다.", status);
};

// token을 넘기면 참여자 인증 헤더(X-Reconnect-Token)가 붙는다
const tokenHeader = (token) => (token ? { "X-Reconnect-Token": token } : {});

export const useApi = () => {
  const client = axios.create({
    baseURL: useRuntimeConfig().public.apiBase,
    timeout: 10000,
  });

  // 백엔드 응답 { success, data, message }에서 data만 꺼낸다
  const request = async (config) => {
    try {
      const response = await client.request(config);
      const body = response.data;
      return body && body.data !== undefined ? body.data : null;
    } catch (error) {
      throw toApiError(error);
    }
  };

  return {
    get: (path, options = {}) =>
      request({
        url: path,
        method: "GET",
        params: options.query,
        headers: tokenHeader(options.token),
      }),
    post: (path, body, options = {}) =>
      request({
        url: path,
        method: "POST",
        data: body,
        params: options.query,
        headers: tokenHeader(options.token),
      }),
    put: (path, body, options = {}) =>
      request({
        url: path,
        method: "PUT",
        data: body,
        params: options.query,
        headers: tokenHeader(options.token),
      }),
    patch: (path, body, options = {}) =>
      request({
        url: path,
        method: "PATCH",
        data: body,
        params: options.query,
        headers: tokenHeader(options.token),
      }),
    delete: (path, options = {}) =>
      request({
        url: path,
        method: "DELETE",
        params: options.query,
        headers: tokenHeader(options.token),
      }),
  };
};
