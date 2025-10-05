import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ExpenseSummaryProps {
  monthlyTotal: number;
  yearToDateTotal: number;
  expenseCount: number;
  averageExpense: number;
  currency?: string;
  period?: string;
}

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  monthlyTotal,
  yearToDateTotal,
  expenseCount,
  averageExpense,
  currency = 'USD',
  period = 'This Month',
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.periodText}>{period}</Text>
      </View>

      <View style={styles.mainTotal}>
        <Text style={styles.totalLabel}>Total Expenses</Text>
        <Text style={styles.totalAmount}>
          {formatCurrency(monthlyTotal)}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatCurrency(yearToDateTotal)}
          </Text>
          <Text style={styles.statLabel}>Year to Date</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatNumber(expenseCount)}
          </Text>
          <Text style={styles.statLabel}>
            Transaction{expenseCount !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatCurrency(averageExpense)}
          </Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  periodText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainTotal: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333333',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
});