import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Transaction } from '../models/transactionModel';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  onLongPress?: (transaction: Transaction) => void;
  isSelected?: boolean;
  showDate?: boolean;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
  onLongPress,
  isSelected = false,
  showDate = true,
}) => {
  const formatAmount = (amount: number, type: 'income' | 'expense'): string => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getAmountColor = (type: 'income' | 'expense'): string => {
    return type === 'income' ? '#4CAF50' : '#F44336';
  };

  const getTypeIndicator = (type: 'income' | 'expense'): string => {
    return type === 'income' ? '↗️' : '↙️';
  };

  const getCategoryColor = (type: 'income' | 'expense'): string => {
    return type === 'income' ? '#E8F5E8' : '#FFF3E0';
  };

  const getCategoryTextColor = (type: 'income' | 'expense'): string => {
    return type === 'income' ? '#2E7D32' : '#F57C00';
  };

  const handlePress = () => {
    onPress?.(transaction);
  };

  const handleLongPress = () => {
    onLongPress?.(transaction);
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
              { backgroundColor: getCategoryColor(transaction.type) },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: getCategoryTextColor(transaction.type) }
              ]}
              numberOfLines={1}
            >
              {transaction.category}
            </Text>
          </View>

          <View style={styles.typeIndicator}>
            <Text style={styles.typeText}>
              {getTypeIndicator(transaction.type)}
            </Text>
          </View>

          {transaction.documents && transaction.documents.length > 0 && (
            <View style={styles.documentIndicator}>
              <Text style={styles.documentText}>📎</Text>
            </View>
          )}
        </View>

        <Text style={styles.label} numberOfLines={1}>
          {transaction.label}
        </Text>

        {transaction.description && (
          <Text style={styles.description} numberOfLines={2}>
            {transaction.description}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        <Text
          style={[
            styles.amount,
            { color: getAmountColor(transaction.type) }
          ]}
        >
          {formatAmount(transaction.amount, transaction.type)}
        </Text>
        {showDate && (
          <Text style={styles.date}>
            {formatDate(transaction.date)}
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
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  typeIndicator: {
    marginRight: 6,
  },
  typeText: {
    fontSize: 12,
  },
  documentIndicator: {
    marginLeft: 2,
  },
  documentText: {
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
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#999999',
  },
});