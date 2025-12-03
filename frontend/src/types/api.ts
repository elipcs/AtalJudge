export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  data: null;
  message: string;
}

export type ApiEnvelope<T> = SuccessResponse<T> | ErrorResponse;

export interface ApiResult<T> {
  data: T;
  message?: string;
  success: boolean;
  status: number;
}

