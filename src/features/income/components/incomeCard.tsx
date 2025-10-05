import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Income } from '../models/incomeModel';
import { useIncomeCategories } from '../hooks/useIncomeCategories';

interface IncomeCardProps {
  income: Income;
  onPress?: (income: Income) => void;
  onLongPress?: (income: Income) => void;
  isSelected?: boolean;
  showDate?: boolean;
}

export const IncomeCard: React.FC<IncomeCardProps> = ({
  income,
  onPress,
  onLongPress,
  isSelected = false,
  showDate = true,
}) => {
  const { getCategoryById } = useIncomeCategories({ loadOnMount: false });
  const category = getCategoryById(income.category);

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
    onPress?.(income);
  };

  const handleLongPress = () => {
    onLongPress?.(income);
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
              { backgroundColor: category?.color || '#4CAF50' },
            ]}
          >
            <Text style={styles.categoryText} numberOfLines={1}>
              {category?.name || income.category}
            </Text>
          </View>
          {income.supportingDocuments && income.supportingDocuments.length > 0 && (
            <View style={styles.documentIndicator}>
              <Text style={styles.documentText}>📎</Text>
            </View>
          )}
        </View>

        <Text style={styles.label} numberOfLines={1}>
          {income.label}
        </Text>

        {income.description && (
          <Text style={styles.description} numberOfLines={2}>
            {income.description}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.amount}>
          +{formatAmount(income.amount)}
        </Text>
        {showDate && (
          <Text style={styles.date}>
            {formatDate(income.date)}
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
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
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
  documentIndicator: {
    marginLeft: 4,
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
    color: '#4CAF50',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#999999',
  },
});