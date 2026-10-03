import { describe, it, expect } from 'vitest';
import { ApiError, normalizeApiError } from './error-handler';
import { ErrorModel } from '@/types/api';

describe('ApiError & normalizeApiError', () => {
  it('correctly maps RFC 7807 ErrorModel field errors', () => {
    const errorModel: ErrorModel = {
      title: 'Bad Request',
      status: 400,
      detail: 'Validation failed on submitted payload',
      errors: [
        { location: 'body.name', message: 'Name must be at least 1 character' },
        { location: 'body.author_id', message: 'Author UUID is required' },
      ],
    };

    const apiError = new ApiError(400, errorModel.detail!, errorModel);
    expect(apiError.status).toBe(400);
    expect(apiError.title).toBe('Bad Request');
    expect(apiError.fieldErrors.name).toBe('Name must be at least 1 character');
    expect(apiError.fieldErrors.author_id).toBe('Author UUID is required');
    expect(apiError.isValidationError).toBe(true);
    expect(apiError.isUnauthorized).toBe(false);
  });

  it('identifies unauthorized 401 errors', () => {
    const apiError = new ApiError(401, 'Invalid Bearer token');
    expect(apiError.isUnauthorized).toBe(true);
  });

  it('normalizes HTTP Response with JSON body', async () => {
    const rawError = {
      title: 'Not Found',
      status: 404,
      detail: 'The requested resource was not located',
    };

    const mockResponse = new Response(JSON.stringify(rawError), {
      status: 404,
      statusText: 'Not Found',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await normalizeApiError(mockResponse);
    expect(result.status).toBe(404);
    expect(result.message).toBe('The requested resource was not located');
  });
});
