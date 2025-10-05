export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateAmount = (amount: number): ValidationResult => {
  if (amount < 0) {
    return { isValid: false, error: 'Amount cannot be negative' };
  }

  if (!Number.isFinite(amount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { isValid: false, error: 'Amount cannot have more than 2 decimal places' };
  }

  return { isValid: true };
};

export const validateLabel = (label: string): ValidationResult => {
  if (!label || label.trim().length === 0) {
    return { isValid: false, error: 'Label is required' };
  }

  if (label.length > 26) {
    return { isValid: false, error: 'Label cannot exceed 26 characters' };
  }

  return { isValid: true };
};

export const validateDescription = (description?: string): ValidationResult => {
  if (!description) {
    return { isValid: true };
  }

  const wordCount = description.trim().split(/\s+/).filter(word => word.length > 0).length;
  if (wordCount > 50) {
    return { isValid: false, error: 'Description cannot exceed 50 words' };
  }

  return { isValid: true };
};

export const validateDate = (date: string): ValidationResult => {
  const inputDate = new Date(date);
  const minDate = new Date('2008-01-01');

  if (isNaN(inputDate.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  if (inputDate < minDate) {
    return { isValid: false, error: 'Date cannot be before January 1, 2008' };
  }

  return { isValid: true };
};

export const validateCategoryName = (name: string, existingCategories: string[] = []): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Category name is required' };
  }

  if (name.trim() !== name || name.trim().length === 0) {
    return { isValid: false, error: 'Category name cannot be only spaces' };
  }

  if (name.length > 15) {
    return { isValid: false, error: 'Category name cannot exceed 15 characters' };
  }

  if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    return { isValid: false, error: 'Category name can only contain alphanumeric characters and spaces' };
  }

  const duplicateExists = existingCategories.some(existing => existing === name);
  if (duplicateExists) {
    return { isValid: false, error: 'Category name already exists (case-sensitive)' };
  }

  return { isValid: true };
};

export const validateReceiptFile = (file: { size: number; type: string }): ValidationResult => {
  const maxSize = 10 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size cannot exceed 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File must be JPG, PNG, JPEG, or PDF format' };
  }

  return { isValid: true };
};

export const validateExpenseForm = (expense: {
  amount: number;
  label: string;
  description?: string;
  category: string;
  date: string;
}): ValidationResult => {
  const amountValidation = validateAmount(expense.amount);
  if (!amountValidation.isValid) return amountValidation;

  const labelValidation = validateLabel(expense.label);
  if (!labelValidation.isValid) return labelValidation;

  const descriptionValidation = validateDescription(expense.description);
  if (!descriptionValidation.isValid) return descriptionValidation;

  if (!expense.category || expense.category.trim().length === 0) {
    return { isValid: false, error: 'Category is required' };
  }

  const dateValidation = validateDate(expense.date);
  if (!dateValidation.isValid) return dateValidation;

  return { isValid: true };
};