import type { PostgrestError } from '@supabase/postgrest-js';

export class ApiError extends Error {
  public code?: string;
  public details?: string;
  public hint?: string;

  constructor(message: string, error?: PostgrestError | Error) {
    super(message);
    this.name = 'ApiError';
    
    if (error && 'code' in error) {
      this.code = error.code;
      this.details = error.details;
      this.hint = error.hint;
    }
  }
}

export const handleApiError = (error: unknown): never => {
  if (error && typeof error === 'object' && 'message' in error) {
    throw new ApiError(error.message as string, error as PostgrestError);
  }
  throw new ApiError('Neočekávaná chyba při komunikaci s API');
};
