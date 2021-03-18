import { CoreOutput } from './dtos/output.dto';

export function errorMessage(
  errorMessageContent: string,
  error?: string,
): CoreOutput {
  return {
    ok: false,
    error: errorMessageContent + '_' + error,
  };
}
