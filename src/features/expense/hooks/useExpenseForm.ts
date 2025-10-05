import { useState, useEffect } from 'react';
import { Expense, ExpenseCreateInput, ExpenseUpdateInput, Receipt } from '../models/expenseModel';
import { validateExpenseForm, validateAmount, validateLabel, validateDescription, validateDate } from '../models/expenseValidation';
import { expenseService } from '../services/expenseService';
import { receiptService } from '../services/receiptService';

interface UseExpenseFormProps {
  initialExpense?: Expense | null;
  onSuccess?: (expense: Expense) => void;
  onError?: (error: string) => void;
}

interface ExpenseFormData {
  amount: string;
  label: string;
  description: string;
  category: string;
  date: string;
  receipts: Receipt[];
}

interface FormErrors {
  amount?: string;
  label?: string;
  description?: string;
  category?: string;
  date?: string;
  general?: string;
}

export const useExpenseForm = ({ initialExpense, onSuccess, onError }: UseExpenseFormProps = {}) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: initialExpense?.amount.toString() || '',
    label: initialExpense?.label || '',
    description: initialExpense?.description || '',
    category: initialExpense?.category || 'Other',
    date: initialExpense?.date || new Date().toISOString().split('T')[0],
    receipts: initialExpense?.receipts || [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [uploadingReceipts, setUploadingReceipts] = useState(false);

  // Real-time validation
  useEffect(() => {
    const newErrors: FormErrors = {};

    if (formData.amount) {
      const amountValidation = validateAmount(parseFloat(formData.amount));
      if (!amountValidation.isValid) {
        newErrors.amount = amountValidation.error;
      }
    }

    if (formData.label) {
      const labelValidation = validateLabel(formData.label);
      if (!labelValidation.isValid) {
        newErrors.label = labelValidation.error;
      }
    }

    if (formData.description) {
      const descriptionValidation = validateDescription(formData.description);
      if (!descriptionValidation.isValid) {
        newErrors.description = descriptionValidation.error;
      }
    }

    if (formData.date) {
      const dateValidation = validateDate(formData.date);
      if (!dateValidation.isValid) {
        newErrors.date = dateValidation.error;
      }
    }

    setErrors(newErrors);

    // Check if form is valid for submission
    const hasRequiredFields = formData.amount && formData.label && formData.category && formData.date;
    const hasNoErrors = Object.keys(newErrors).length === 0;
    setIsValid(!!hasRequiredFields && hasNoErrors);
  }, [formData]);

  const updateField = (field: keyof ExpenseFormData, value: string | Receipt[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addReceipts = async (files: File[]) => {
    if (!files.length) return;

    setUploadingReceipts(true);
    try {
      const expenseId = initialExpense?.id || 'temp-' + Date.now();
      const uploadedReceipts = await receiptService.uploadMultipleReceipts(files, expenseId);

      setFormData(prev => ({
        ...prev,
        receipts: [...prev.receipts, ...uploadedReceipts],
      }));
    } catch (error) {
      console.error('Error uploading receipts:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to upload receipts. Please try again.',
      }));
    } finally {
      setUploadingReceipts(false);
    }
  };

  const removeReceipt = async (receiptId: string) => {
    try {
      await receiptService.deleteReceipt(receiptId);
      setFormData(prev => ({
        ...prev,
        receipts: prev.receipts.filter(receipt => receipt.id !== receiptId),
      }));
    } catch (error) {
      console.error('Error removing receipt:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to remove receipt. Please try again.',
      }));
    }
  };

  const submitForm = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Final validation
      const expenseData = {
        amount: parseFloat(formData.amount),
        label: formData.label.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        date: formData.date,
      };

      const validation = validateExpenseForm(expenseData);
      if (!validation.isValid) {
        setErrors({ general: validation.error });
        return;
      }

      let result: Expense;

      if (initialExpense) {
        // Update existing expense
        const updateData: ExpenseUpdateInput = {
          id: initialExpense.id,
          ...expenseData,
          receipts: formData.receipts,
        };
        result = await expenseService.updateExpense(updateData);
      } else {
        // Create new expense
        const createData: ExpenseCreateInput = {
          ...expenseData,
          receipts: formData.receipts,
        };
        result = await expenseService.createExpense(createData);
      }

      onSuccess?.(result);
    } catch (error: any) {
      console.error('Error submitting expense:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save expense';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      label: '',
      description: '',
      category: 'Other',
      date: new Date().toISOString().split('T')[0],
      receipts: [],
    });
    setErrors({});
  };

  const setAmount = (value: string) => updateField('amount', value);
  const setLabel = (value: string) => updateField('label', value);
  const setDescription = (value: string) => updateField('description', value);
  const setCategory = (value: string) => updateField('category', value);
  const setDate = (value: string) => updateField('date', value);

  return {
    // Form data
    formData,
    errors,
    isValid,
    isSubmitting,
    uploadingReceipts,

    // Actions
    updateField,
    setAmount,
    setLabel,
    setDescription,
    setCategory,
    setDate,
    addReceipts,
    removeReceipt,
    submitForm,
    resetForm,

    // Computed values
    isEditing: !!initialExpense,
    hasUnsavedChanges: initialExpense ? (
      formData.amount !== initialExpense.amount.toString() ||
      formData.label !== initialExpense.label ||
      formData.description !== (initialExpense.description || '') ||
      formData.category !== initialExpense.category ||
      formData.date !== initialExpense.date ||
      formData.receipts.length !== (initialExpense.receipts?.length || 0)
    ) : (
      formData.amount !== '' ||
      formData.label !== '' ||
      formData.description !== '' ||
      formData.category !== 'Other' ||
      formData.receipts.length > 0
    ),
  };
};