/**
 * Core API response envelopes and health contracts
 */

export interface ApiErrorEnvelope {
  error: {
    code: number;
    message: string;
    request_id?: string;
  };
  detail?: string | Array<{ loc: string[]; msg: string; type: string }>;
}

export interface HealthLiveResponse {
  status: 'live';
}

export interface HealthReadyResponse {
  status: 'ready' | 'degraded';
  dependencies: {
    database: string;
    model_artifacts: string;
  };
}
