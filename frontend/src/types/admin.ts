/**
 * Admin Resource Types
 * Strictly synchronized with backend/app/api/v1/endpoints/admin.py
 */

export interface ModelArtifactRecord {
  id: string;
  model_name: string;
  model_version: string;
  prediction_type: string;
  artifact_path: string;
  feature_schema: Record<string, unknown>;
  metrics: {
    cv_mean_mae?: number;
    cv_std_mae?: number;
    holdout_mae?: number;
    holdout_rmse?: number;
    holdout_r2?: number;
    [key: string]: unknown;
  };
  supported_geography: string;
  is_active: boolean;
  trained_at: string | null;
}
