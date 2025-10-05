import { IncomeValidationResult, IncomeValidationError } from '../models/incomeValidation';

// Validation constants
export const VALIDATION_CONSTANTS = {
  AMOUNT_MAX_DECIMAL_PLACES: 2,
  LABEL_MAX_LENGTH: 26,
  DESCRIPTION_MAX_WORDS: 50,
  CATEGORY_MAX_LENGTH: 15,
  MIN_DATE: '2008-01-01',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'] as const,
} as const;

export const INCOME_VALIDATION_MESSAGES = {
  amount: {
    required: 'Amount is required',
    positive: 'Amount must be positive',
    decimal: 'Amount can have maximum 2 decimal places',
    min: 'Amount must be greater than 0',
  },
  label: {
    required: 'Label is required',
    maxLength: 'Label cannot exceed 26 characters',
    minLength: 'Label cannot be empty',
  },
  description: {
    maxWords: 'Description cannot exceed 50 words',
  },
  category: {
    required: 'Category is required',
    maxLength: 'Category name cannot exceed 15 characters',
    alphanumeric: 'Category name must contain only alphanumeric characters and spaces',
    duplicate: 'Category name already exists',
    empty: 'Category name cannot be empty or contain only spaces',
  },
  date: {
    required: 'Date is required',
    minDate: 'Date cannot be before January 1, 2008',
    invalid: 'Please select a valid date',
  },
  supportingDocuments: {
    maxSize: 'File size cannot exceed 10MB',
    invalidFormat: 'Only JPG, PNG, and PDF files are allowed',
  },
} as const;

// Validation functions
export const validateAmount = (amount: number | string): IncomeValidationError[] => {
  const errors: IncomeValidationError[] = [];

  if (!amount && amount !== 0) {
    errors.push({ field: 'amount', message: INCOME_VALIDATION_MESSAGES.amount.required });
    return errors;
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount) || numAmount <= 0) {
    errors.push({ field: 'amount', message: INCOME_VALIDATION_MESSAGES.amount.positive });
  }

  // Check decimal places
  const decimalPlaces = (numAmount.toString().split('.')[1] || '').length;
  if (decimalPlaces > VALIDATION_CONSTANTS.AMOUNT_MAX_DECIMAL_PLACES) {
    errors.push({ field: 'amount', message: INCOME_VALIDATION_MESSAGES.amount.decimal });
  }

  return errors;
};

export const validateLabel = (label: string): IncomeValidationError[] => {
  const errors: IncomeValidationError[] = [];

  if (!label || label.trim().length === 0) {
    errors.push({ field: 'label', message: INCOME_VALIDATION_MESSAGES.label.required });
  } else if (label.length > VALIDATION_CONSTANTS.LABEL_MAX_LENGTH) {
    errors.push({ field: 'label', message: INCOME_VALIDATION_MESSAGES.label.maxLength });
  }

  return errors;
};

export const validateDescription = (description?: string): IncomeValidationError[] => {
  const errors: IncomeValidationError[] = [];

  if (description && description.trim()) {
    const wordCount = description.trim().split(/\s+/).length;
    if (wordCount > VALIDATION_CONSTANTS.DESCRIPTION_MAX_WORDS) {
      errors.push({ field: 'description', message: INCOME_VALIDATION_MESSAGES.description.maxWords });
    }
  }

  return errors;
};

export const validateCategory = (category: string, existingCategories: string[] = []): IncomeValidationError[] => {
  const errors: IncomeValidationError[] = [];

  if (!category || category.trim().length === 0) {
    errors.push({ field: 'category', message: INCOME_VALIDATION_MESSAGES.category.required });
    return errors;
  }

  if (category.length > VALIDATION_CONSTANTS.CATEGORY_MAX_LENGTH) {
    errors.push({ field: 'category', message: INCOME_VALIDATION_MESSAGES.category.maxLength });
  }

  // Check alphanumeric only (including spaces)
  if (!/^[a-zA-Z0-9\s]+$/.test(category)) {
    errors.push({ field: 'category', message: INCOME_VALIDATION_MESSAGES.category.alphanumeric });
  }

  // Check for duplicates (case-sensitive)
  if (existingCategories.includes(category)) {
    errors.push({ field: 'category', message: INCOME_VALIDATION_MESSAGES.category.duplicate });
  }

  return errors;
};

export const validateDate = (date: string): IncomeValidationError[] => {
  const errors: IncomeValidationError[] = [];

  if (!date) {
    errors.push({ field: 'date', message: INCOME_VALIDATION_MESSAGES.date.required });
    return errors;
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    errors.push({ field: 'date', message: INCOME_VALIDATION_MESSAGES.date.invalid });
    return errors;
  }

  const minDate = new Date(VALIDATION_CONSTANTS.MIN_DATE);
  if (dateObj < minDate) {
    errors.push({ field: 'date', message: INCOME_VALIDATION_MESSAGES.date.minDate });
  }

  return errors;
};

export const validateSupportingDocuments = (documents?: File[]): IncomeValidationError[] => {
  const errors: IncomeValidationError[] = [];

  if (!documents || documents.length === 0) {
    return errors; // Optional field
  }

  documents.forEach((file, index) => {
    if (file.size > VALIDATION_CONSTANTS.MAX_FILE_SIZE) {
      errors.push({
        field: `supportingDocuments[${index}]`,
        message: INCOME_VALIDATION_MESSAGES.supportingDocuments.maxSize
      });
    }

    if (!VALIDATION_CONSTANTS.ALLOWED_FILE_FORMATS.includes(file.type as any)) {
      errors.push({
        field: `supportingDocuments[${index}]`,
        message: INCOME_VALIDATION_MESSAGES.supportingDocuments.invalidFormat
      });
    }
  });

  return errors;
};

// Combined validation function
export const validateIncome = (incomeData: {
  amount: number | string;
  label: string;
  description?: string;
  category: string;
  date: string;
  supportingDocuments?: File[];
}, existingCategories: string[] = []): IncomeValidationResult => {
  const allErrors: IncomeValidationError[] = [
    ...validateAmount(incomeData.amount),
    ...validateLabel(incomeData.label),
    ...validateDescription(incomeData.description),
    ...validateCategory(incomeData.category, existingCategories),
    ...validateDate(incomeData.date),
    ...validateSupportingDocuments(incomeData.supportingDocuments),
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

// Helper function to get error for a specific field
export const getFieldError = (errors: IncomeValidationError[], fieldName: string): string | undefined => {
  const fieldError = errors.find(error => error.field === fieldName);
  return fieldError?.message;
};