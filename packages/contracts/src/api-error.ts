export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UPLOAD_FAILED"
  | "ESTIMATE_FAILED"
  | "ORDER_FAILED"
  | "EXTERNAL_API_ERROR"
  | "INTERNAL_SERVER_ERROR";

export type FieldError = {
  field: string;
  message: string;
};

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: FieldError[];
    requestId?: string;
  };
};

