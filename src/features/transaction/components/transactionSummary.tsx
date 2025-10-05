import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TransactionSummaryData } from '../models/transactionModel';

interface TransactionSummaryProps {
  monthlyData: TransactionSummaryData;
  yearToDateData: TransactionSummaryData;
  currency?: string;
  period?: string;
}

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  monthlyData,
  yearToDateData,
  currency = 'USD',
  period = 'This Month',
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(Math.abs(amount));
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getNetBalanceColor = (balance: number): string => {
    if (balance > 0) return '#4CAF50'; // Green for positive
    if (balance < 0) return '#F44336'; // Red for negative
    return '#666666'; // Gray for zero
  };

  const getNetBalanceText = (balance: number): string => {
    if (balance > 0) return `+${formatCurrency(balance)}`;
    if (balance < 0) return `-${formatCurrency(balance)}`;
    return formatCurrency(balance);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.periodText}>{period}</Text>
      </View>

      {/* Net Balance - Main metric */}
      <View style={styles.mainTotal}>
        <Text style={styles.totalLabel}>Net Balance</Text>
        <Text
          style={[
            styles.totalAmount,
            { color: getNetBalanceColor(monthlyData.netBalance) }
          ]}
        >
          {getNetBalanceText(monthlyData.netBalance)}
        </Text>
      </View>

      {/* Income and Expense Row */}
      <View style={styles.incomeExpenseRow}>
        <View style={styles.incomeExpenseItem}>
          <Text style={[styles.incomeExpenseValue, { color: '#4CAF50' }]}>
            +{formatCurrency(monthlyData.totalIncome)}
          </Text>
          <Text style={styles.incomeExpenseLabel}>Income</Text>
          <Text style={styles.incomeExpenseCount}>
            {formatNumber(monthlyData.incomeCount)} entries
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.incomeExpenseItem}>
          <Text style={[styles.incomeExpenseValue, { color: '#F44336' }]}>
            -{formatCurrency(monthlyData.totalExpenses)}
          </Text>
          <Text style={styles.incomeExpenseLabel}>Expenses</Text>
          <Text style={styles.incomeExpenseCount}>
            {formatNumber(monthlyData.expenseCount)} entries
          </Text>
        </View>
      </View>

      {/* Secondary Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {getNetBalanceText(yearToDateData.netBalance)}
          </Text>
          <Text style={styles.statLabel}>Year to Date</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatNumber(monthlyData.transactionCount)}
          </Text>
          <Text style={styles.statLabel}>
            Transaction{monthlyData.transactionCount !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatCurrency(monthlyData.averageIncome)}
          </Text>
          <Text style={styles.statLabel}>Avg Income</Text>
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
  },
  incomeExpenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  incomeExpenseItem: {
    flex: 1,
    alignItems: 'center',
  },
  incomeExpenseValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  incomeExpenseLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  incomeExpenseCount: {
    fontSize: 12,
    color: '#999999',
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
    fontSize: 14,
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