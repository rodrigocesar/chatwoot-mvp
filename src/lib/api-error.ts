import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'ADAPTER_ERROR'
  | 'UNAUTHORIZED'
  | 'INTERNAL_ERROR';

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status },
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError('VALIDATION_ERROR', 'Invalid request', 400, {
      issues: error.flatten(),
    });
  }

  if (error instanceof Error) {
    if (error.message === 'NOT_FOUND') {
      return apiError('NOT_FOUND', 'Resource not found', 404);
    }
    if (error.message === 'CONFLICT') {
      return apiError('CONFLICT', 'Resource conflict', 409);
    }
    if (error.message === 'ALREADY_ENABLED') {
      return apiError('CONFLICT', 'Omnichannel already enabled', 409);
    }
    if (error.message === 'NOT_ENABLED') {
      return apiError('CONFLICT', 'Omnichannel not enabled', 409);
    }
    if (error.message.startsWith('ADAPTER_ERROR')) {
      return apiError('ADAPTER_ERROR', error.message.replace('ADAPTER_ERROR: ', ''), 502);
    }
  }

  console.error(error);
  return apiError('INTERNAL_ERROR', 'Internal server error', 500);
}
