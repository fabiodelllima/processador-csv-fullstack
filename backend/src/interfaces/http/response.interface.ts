export interface HttpResponse<T = any> {
  status: "success" | "error" | "processing";
  message: string;
  data?: T;
  error?: string;
}
