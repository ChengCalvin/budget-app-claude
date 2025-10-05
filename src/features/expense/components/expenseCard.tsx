import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Expense } from '../models/expenseModel';
import { useCategories } from '../hooks/useCategories';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: (expense: Expense) => void;
  onLongPress?: (expense: Expense) => void;
  isSelected?: boolean;
  showDate?: boolean;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onPress,
  onLongPress,
  isSelected = false,
  showDate = true,
}) => {
  const { getCategoryById } = useCategories({ loadOnMount: false });
  const category = getCategoryById(expense.category);

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePress = () => {
    onPress?.(expense);
  };

  const handleLongPress = () => {
    onLongPress?.(expense);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={styles.categoryContainer}>
          <View
            style={[
              styles.categoryTag,
              { backgroundColor: category?.color || '#FECA57' },
            ]}
          >
            <Text style={styles.categoryText} numberOfLines={1}>
              {category?.name || expense.category}
            </Text>
          </View>
          {expense.receipts && expense.receipts.length > 0 && (
            <View style={styles.receiptIndicator}>
              <Text style={styles.receiptText}>📎</Text>
            </View>
          )}
        </View>

        <Text style={styles.label} numberOfLines={1}>
          {expense.label}
        </Text>

        {expense.description && (
          <Text style={styles.description} numberOfLines={2}>
            {expense.description}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.amount}>
          {formatAmount(expense.amount)}
        </Text>
        {showDate && (
          <Text style={styles.date}>
            {formatDate(expense.date)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedContainer: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  receiptIndicator: {
    marginLeft: 4,
  },
  receiptText: {
    fontSize: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#999999',
  },
});