export interface HttpResponse<T = unknown> {
  status: "success" | "error" | "processing";
  message: string;
  data?: T;
  error?: string;
}
