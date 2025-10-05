import React from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { ExpenseForm } from '../components/expenseForm';
import { Expense } from '../models/expenseModel';

interface ExpenseFormScreenProps {
  expense?: Expense | null;
  onSubmit: (expense: Expense) => void;
  onCancel: () => void;
  title?: string;
}

export const ExpenseFormScreen: React.FC<ExpenseFormScreenProps> = ({
  expense,
  onSubmit,
  onCancel,
  title,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ExpenseForm
          expense={expense}
          onSubmit={onSubmit}
          onCancel={onCancel}
          submitButtonText={title}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});