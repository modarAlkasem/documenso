type APIStatus = "SUCCESS" | "FAILURE" | "ERROR";
export type APIResponse<T = any> = {
  status: APIStatus;
  status_code: number;
  data?: T;
  errors?: unknown;
};
