import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, getApiBaseUrl } from '@/lib/api/client';
import {
  ValidationError,
  ServiceUnavailableError,
  NetworkError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ApiHttpError,
} from '@/lib/api/errors';
import { SalePriceInferenceRequest, PredictionCreateRequest } from '@/types/prediction';

describe('ApiClient', () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    vi.restoreAllMocks();
    apiClient.setAuthToken(null);
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
    apiClient.setAuthToken(null);
  });

  it('resolves default API base URL when env variable is not set', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getApiBaseUrl()).toBe('http://localhost:8000/api/v1');
  });

  it('respects NEXT_PUBLIC_API_URL with trailing slash trimmed', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.estora.com/api/v1/';
    expect(getApiBaseUrl()).toBe('https://api.estora.com/api/v1');
  });

  it('attaches Bearer token in Authorization header when token is set', async () => {
    apiClient.setAuthToken('test-jwt-token-xyz');

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await apiClient.health.check();

    expect(fetchSpy).toHaveBeenCalled();
    const calledInit = fetchSpy.mock.calls[0][1] as RequestInit;
    const headers = calledInit.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-jwt-token-xyz');
  });

  it('omits Authorization header when token is null', async () => {
    apiClient.setAuthToken(null);

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'live' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await apiClient.health.checkLive();

    const calledInit = fetchSpy.mock.calls[0][1] as RequestInit;
    const headers = calledInit.headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });

  it('fetches health liveness successfully', async () => {
    const mockResponse = { status: 'live' };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const data = await apiClient.health.checkLive();
    expect(data.status).toBe('live');
  });

  it('submits valid prediction payload and returns structured response', async () => {
    const mockResponse = {
      estimated_price_lakhs: 85.5,
      estimated_price_inr: 8550000,
      currency: 'INR',
      currency_unit: 'lakhs',
      model_name: 'HistGradientBoostingRegressor',
      model_version: '1.0.0',
      prediction_type: 'sale_price',
      disclaimer: 'Decision support disclaimer',
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': 'req-test-123',
        },
      })
    );

    const payload: SalePriceInferenceRequest = {
      square_ft: 1100,
      bhk_no: 2,
      latitude: 18.5204,
      longitude: 73.8567,
      posted_by: 'Owner',
      address: 'Kothrud, Pune',
      rera: 1,
      ready_to_move: 1,
      resale: 0,
    };

    const result = await apiClient.predictions.predictSalePrice(payload);
    expect(result.estimated_price_lakhs).toBe(85.5);
    expect(result.currency).toBe('INR');
  });

  it('calls auth login and receives token', async () => {
    const mockToken = {
      access_token: 'fake-access-token',
      token_type: 'bearer',
      expires_in: 3600,
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockToken), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await apiClient.auth.login({
      email: 'test@example.com',
      password: 'StrongPassword123!',
    });

    expect(res.access_token).toBe('fake-access-token');
    expect(res.token_type).toBe('bearer');
  });

  it('calls auth register and receives created user', async () => {
    const mockUser = {
      id: 'usr-123',
      email: 'newuser@example.com',
      full_name: 'New User',
      role: 'user',
      is_active: true,
      created_at: '2026-10-24T00:00:00Z',
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockUser), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await apiClient.auth.register({
      email: 'newuser@example.com',
      password: 'StrongPassword123!',
      full_name: 'New User',
    });

    expect(res.id).toBe('usr-123');
    expect(res.email).toBe('newuser@example.com');
  });

  it('creates persisted prediction when authenticated', async () => {
    const mockRecord = {
      id: 'pred-456',
      user_id: 'usr-123',
      property_inputs: {
        square_ft: 1200,
        bhk_no: 3,
        latitude: 18.5204,
        longitude: 73.8567,
        posted_by: 'Owner',
        address: 'Kalyani Nagar, Pune',
        rera: 1,
        ready_to_move: 1,
        resale: 0,
      },
      estimated_price_lakhs: 110.0,
      estimated_price_inr: 11000000,
      prediction_type: 'sale_price',
      model_name: 'HistGradientBoostingRegressor',
      model_version: '1.0.0',
      currency: 'INR',
      currency_unit: 'lakhs',
      disclaimer: 'Disclaimer text',
      supported_geography: 'Pune',
      created_at: '2026-10-24T00:00:00Z',
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockRecord), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const payload: PredictionCreateRequest = {
      property_inputs: {
        square_ft: 1200,
        bhk_no: 3,
        latitude: 18.5204,
        longitude: 73.8567,
        posted_by: 'Owner',
        address: 'Kalyani Nagar, Pune',
        rera: 1,
        ready_to_move: 1,
        resale: 0,
      },
      prediction_type: 'sale_price',
    };

    const res = await apiClient.predictions.createPrediction(payload);
    expect(res.id).toBe('pred-456');
    expect(res.estimated_price_lakhs).toBe(110.0);
  });

  it('lists user predictions with pagination parameters', async () => {
    const mockList = [
      {
        id: 'pred-1',
        user_id: 'usr-1',
        property_inputs: {},
        estimated_price_lakhs: 90.0,
        estimated_price_inr: 9000000,
        prediction_type: 'sale_price',
        model_name: 'HistGradientBoostingRegressor',
        model_version: '1.0.0',
        currency: 'INR',
        currency_unit: 'lakhs',
        disclaimer: 'Disclaimer',
        supported_geography: 'Pune',
        created_at: '2026-10-24T00:00:00Z',
      },
    ];

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockList), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await apiClient.predictions.listUserPredictions({ skip: 10, limit: 10 });
    expect(res).toHaveLength(1);
    expect(fetchSpy.mock.calls[0][0]).toContain('skip=10&limit=10');
  });

  it('fetches prediction detail by ID', async () => {
    const mockRecord = {
      id: 'pred-999',
      user_id: 'usr-1',
      property_inputs: { address: 'Baner' },
      estimated_price_lakhs: 75.0,
      estimated_price_inr: 7500000,
      prediction_type: 'sale_price',
      model_name: 'HistGradientBoostingRegressor',
      model_version: '1.0.0',
      currency: 'INR',
      currency_unit: 'lakhs',
      disclaimer: 'Disclaimer',
      supported_geography: 'Pune',
      created_at: '2026-10-24T00:00:00Z',
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockRecord), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await apiClient.predictions.getPredictionDetail('pred-999');
    expect(res.id).toBe('pred-999');
    expect(res.estimated_price_lakhs).toBe(75.0);
  });

  it('throws UnauthorizedError on 401 response and notifies listeners', async () => {
    const unauthorizedListener = vi.fn();
    const unsub = apiClient.onUnauthorized(unauthorizedListener);

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { code: 401, message: 'Invalid authentication credentials' },
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    await expect(apiClient.users.getMe()).rejects.toThrow(UnauthorizedError);
    expect(unauthorizedListener).toHaveBeenCalledTimes(1);

    unsub();
  });

  it('throws ForbiddenError on 403 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { code: 403, message: 'Administrator privileges required' },
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    await expect(apiClient.admin.getSystemAnalytics()).rejects.toThrow(ForbiddenError);
  });

  it('throws NotFoundError on 404 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { code: 404, message: 'Prediction not found' },
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    await expect(apiClient.predictions.getPredictionDetail('non-existent-id')).rejects.toThrow(NotFoundError);
  });

  it('throws ValidationError on 422 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { code: 422, message: 'Built-up area out of bounds' },
        }),
        {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const payload: SalePriceInferenceRequest = {
      square_ft: 50,
      bhk_no: 2,
      latitude: 18.5204,
      longitude: 73.8567,
      posted_by: 'Owner',
      address: 'Kothrud, Pune',
      rera: 1,
      ready_to_move: 1,
      resale: 0,
    };

    await expect(apiClient.predictions.predictSalePrice(payload)).rejects.toThrow(ValidationError);
  });

  it('throws ServiceUnavailableError on 503 unready response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { code: 503, message: 'Model artifact not loaded' },
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    await expect(apiClient.health.checkReady()).rejects.toThrow(ServiceUnavailableError);
  });

  it('throws NetworkError when fetch throws network failure', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(apiClient.health.checkLive()).rejects.toThrow(NetworkError);
  });
});
