/**
 * ML Prediction Contract Types
 * Strictly synchronized with backend/app/schemas/prediction.py
 */

export type PostedByType = 'Owner' | 'Dealer' | 'Builder';

export interface SalePropertyInputs {
  square_ft: number;
  bhk_no: number;
  latitude: number;
  longitude: number;
  posted_by: PostedByType;
  address: string;
  rera: 0 | 1;
  ready_to_move: 0 | 1;
  resale: 0 | 1;
}

export type SalePriceInferenceRequest = SalePropertyInputs;

export interface SalePriceInferenceResponse {
  estimated_price_lakhs: number;
  estimated_price_inr: number;
  currency: string;
  currency_unit: string;
  model_name: string;
  model_version: string;
  prediction_type: string;
  supported_geography: string;
  disclaimer: string;
}

export interface PredictionCreateRequest {
  prediction_type: 'sale_price' | 'monthly_rent';
  property_inputs: SalePropertyInputs;
}

export interface PredictionResponse {
  id: string;
  user_id: string | null;
  prediction_type: string;
  property_inputs: Record<string, unknown>;
  estimated_price_lakhs: number;
  estimated_price_inr: number;
  currency: string;
  currency_unit: string;
  model_name?: string;
  model_version: string;
  supported_geography: string;
  disclaimer: string;
  created_at: string;
}

export type PredictionHistoryItem = PredictionResponse;
