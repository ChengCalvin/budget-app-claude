import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useExpenseAnalytics, TimePeriod, QuickFilter } from '../hooks/useExpenseAnalytics';
import { ExpenseSummary } from '../components/expenseSummary';
import { CategoryAnalytics } from '../models/categoryModel';

interface ExpenseAnalyticsScreenProps {
  onCategoryPress?: (categoryId: string) => void;
}

export const ExpenseAnalyticsScreen: React.FC<ExpenseAnalyticsScreenProps> = ({
  onCategoryPress,
}) => {
  const {
    categoryAnalytics,
    categorySummary,
    timeBasedSummary,
    isLoading,
    error,
    timePeriod,
    dateFrom,
    dateTo,
    periodLabel,
    navigatePeriod,
    applyQuickFilter,
    setCustomDateRange,
    refresh,
    canNavigatePrevious,
    canNavigateNext,
    isEmpty,
  } = useExpenseAnalytics();

  const quickFilters: { label: string; value: QuickFilter }[] = [
    { label: '7 Days', value: '7days' },
    { label: '30 Days', value: '30days' },
    { label: '90 Days', value: '90days' },
    { label: 'All Time', value: 'all' },
  ];

  const timePeriods: { label: string; value: TimePeriod }[] = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ];

  const renderCategoryBreakdown = () => {
    if (!categoryAnalytics.length) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        {categoryAnalytics.map((category) => (
          <TouchableOpacity
            key={category.categoryId}
            style={styles.categoryItem}
            onPress={() => onCategoryPress?.(category.categoryId)}
          >
            <View style={styles.categoryHeader}>
              <View style={styles.categoryInfo}>
                <View
                  style={[
                    styles.categoryColor,
                    { backgroundColor: category.categoryColor },
                  ]}
                />
                <Text style={styles.categoryName}>{category.categoryName}</Text>
              </View>
              <Text style={styles.categoryPercentage}>
                {category.percentageOfTotal.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.categoryStats}>
              <Text style={styles.categoryAmount}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(category.totalAmount)}
              </Text>
              <Text style={styles.categoryCount}>
                {category.expenseCount} transaction{category.expenseCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${category.percentageOfTotal}%`,
                    backgroundColor: category.categoryColor,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTimeComparison = () => {
    if (!timeBasedSummary) return null;

    const { current, previous, percentageChange } = timeBasedSummary;
    const isIncrease = percentageChange > 0;
    const isDecrease = percentageChange < 0;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Period Comparison</Text>
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonPeriod}>
            <Text style={styles.comparisonLabel}>{current.periodLabel}</Text>
            <Text style={styles.comparisonAmount}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(current.totalAmount)}
            </Text>
            <Text style={styles.comparisonCount}>
              {current.expenseCount} expenses
            </Text>
          </View>

          <View style={styles.comparisonArrow}>
            <Text style={[
              styles.changePercentage,
              isIncrease && styles.increaseText,
              isDecrease && styles.decreaseText,
            ]}>
              {isIncrease ? '+' : ''}{percentageChange.toFixed(1)}%
            </Text>
            <Text style={styles.changeLabel}>
              vs previous period
            </Text>
          </View>

          <View style={styles.comparisonPeriod}>
            <Text style={styles.comparisonLabel}>{previous.periodLabel}</Text>
            <Text style={styles.comparisonAmount}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(previous.totalAmount)}
            </Text>
            <Text style={styles.comparisonCount}>
              {previous.expenseCount} expenses
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Quick Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={styles.quickFilterButton}
              onPress={() => applyQuickFilter(filter.value)}
            >
              <Text style={styles.quickFilterText}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Period Navigation */}
      <View style={styles.periodNavigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            !canNavigatePrevious && styles.navButtonDisabled,
          ]}
          onPress={() => navigatePeriod('previous')}
          disabled={!canNavigatePrevious}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.currentPeriod}>{periodLabel}</Text>

        <TouchableOpacity
          style={[
            styles.navButton,
            !canNavigateNext && styles.navButtonDisabled,
          ]}
          onPress={() => navigatePeriod('next')}
          disabled={!canNavigateNext}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      {categorySummary && (
        <ExpenseSummary
          monthlyTotal={categorySummary.monthlyTotal}
          yearToDateTotal={categorySummary.yearToDateTotal}
          expenseCount={categoryAnalytics.reduce((sum, cat) => sum + cat.expenseCount, 0)}
          averageExpense={categorySummary.monthlyTotal / Math.max(1, categoryAnalytics.reduce((sum, cat) => sum + cat.expenseCount, 0))}
          period={periodLabel}
        />
      )}

      {/* Time Comparison */}
      {renderTimeComparison()}

      {/* Category Breakdown */}
      {renderCategoryBreakdown()}

      {isEmpty && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No data available</Text>
          <Text style={styles.emptySubtitle}>
            No expenses found for the selected period
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filtersContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
  },
  quickFilterButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickFilterText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  periodNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 20,
    color: '#333333',
    fontWeight: '600',
  },
  currentPeriod: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  categoryCount: {
    fontSize: 14,
    color: '#666666',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonPeriod: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  comparisonAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 2,
  },
  comparisonCount: {
    fontSize: 12,
    color: '#666666',
  },
  comparisonArrow: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  changePercentage: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  changeLabel: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  increaseText: {
    color: '#FF5722',
  },
  decreaseText: {
    color: '#4CAF50',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5722',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});