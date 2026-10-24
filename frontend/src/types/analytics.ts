/**
 * Analytics and Summary Types
 * Strictly synchronized with backend/app/schemas/analytics.py
 */

import { PredictionResponse } from './prediction';

export interface UserAnalyticsSummary {
  total_predictions: number;
  sale_predictions: number;
  rent_predictions: number;
  average_sale_estimate_lakhs: number | null;
  recent_predictions: PredictionResponse[];
}

export interface AdminAnalyticsSummary {
  total_users: number;
  total_predictions: number;
  sale_predictions: number;
  rent_predictions: number;
  active_models_count: number;
  system_status: string;
}
