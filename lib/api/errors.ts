export interface ApiError {
  status: number;
  code?: string;
  message: string;
  fieldErrors?: Record<string, string>;
  details?: unknown;
  cause?: unknown;
}

export class ApiException extends Error implements ApiError {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;
  details?: unknown;
  cause?: unknown;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiException";
    this.status = apiError.status;
    this.code = apiError.code;
    this.fieldErrors = apiError.fieldErrors;
    this.details = apiError.details;
    this.cause = apiError.cause;
  }
}
