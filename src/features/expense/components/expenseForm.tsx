import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Expense } from '../models/expenseModel';
import { useExpenseForm } from '../hooks/useExpenseForm';
import { AmountInput } from './amountInput';
import { CategorySelector } from './categorySelector';
import { DatePicker } from './datePicker';
import { ReceiptManager } from './receiptManager';

interface ExpenseFormProps {
  expense?: Expense | null;
  onSubmit: (expense: Expense) => void;
  onCancel: () => void;
  submitButtonText?: string;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expense,
  onSubmit,
  onCancel,
  submitButtonText,
}) => {
  const {
    formData,
    errors,
    isValid,
    isSubmitting,
    uploadingReceipts,
    setAmount,
    setLabel,
    setDescription,
    setCategory,
    setDate,
    addReceipts,
    removeReceipt,
    submitForm,
    isEditing,
    hasUnsavedChanges,
  } = useExpenseForm({
    initialExpense: expense,
    onSuccess: onSubmit,
    onError: (error) => {
      Alert.alert('Error', error);
    },
  });

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }
    await submitForm();
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          { text: 'Continue Editing', style: 'cancel' },
          { text: 'Discard Changes', style: 'destructive', onPress: onCancel },
        ]
      );
    } else {
      onCancel();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Amount Input */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Amount <Text style={styles.required}>*</Text>
            </Text>
            <AmountInput
              value={formData.amount}
              onValueChange={setAmount}
              error={errors.amount}
              placeholder="0.00"
            />
          </View>

          {/* Label Input */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Label <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                errors.label && styles.inputError,
              ]}
              value={formData.label}
              onChangeText={setLabel}
              placeholder="What did you spend on?"
              maxLength={26}
              returnKeyType="next"
            />
            {errors.label && (
              <Text style={styles.errorText}>{errors.label}</Text>
            )}
            <Text style={styles.characterCount}>
              {formData.label.length}/26
            </Text>
          </View>

          {/* Category Selector */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <CategorySelector
              selectedCategory={formData.category}
              onCategorySelect={setCategory}
              error={errors.category}
            />
          </View>

          {/* Date Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Date <Text style={styles.required}>*</Text>
            </Text>
            <DatePicker
              value={formData.date}
              onDateChange={setDate}
              error={errors.date}
            />
          </View>

          {/* Description Input */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
                errors.description && styles.inputError,
              ]}
              value={formData.description}
              onChangeText={setDescription}
              placeholder="Add a description (optional)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
            <Text style={styles.characterCount}>
              {formData.description.split(' ').filter(word => word.length > 0).length}/50 words
            </Text>
          </View>

          {/* Receipt Manager */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Receipts</Text>
            <ReceiptManager
              receipts={formData.receipts}
              onAddReceipts={addReceipts}
              onRemoveReceipt={removeReceipt}
              isUploading={uploadingReceipts}
            />
          </View>
        </View>

        {/* Error Display */}
        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.generalErrorText}>{errors.general}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isValid || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting
                ? 'Saving...'
                : submitButtonText || (isEditing ? 'Update' : 'Add Expense')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  required: {
    color: '#FF5722',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF5722',
  },
  errorText: {
    fontSize: 12,
    color: '#FF5722',
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  generalErrorText: {
    fontSize: 14,
    color: '#FF5722',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 16,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    marginLeft: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});