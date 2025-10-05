export interface IncomeValidationResult {
  isValid: boolean;
  errors: IncomeValidationError[];
}

export interface IncomeValidationError {
  field: string;
  message: string;
}