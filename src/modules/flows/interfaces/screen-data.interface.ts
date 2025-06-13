export interface IScreenDataRequest {
  version: string;
  screen: string;
  action: string;
  flow_token: string;
  data: unknown;
}

export interface IScreenDataResponse {
  version: string;
  screen: string;
  data?: unknown;
}
