import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, RefreshControl, Alert, StyleSheet } from 'react-native';
import { useExpenseList } from '../hooks/useExpenseList';
import { useExpenseActions } from '../hooks/useExpenseActions';
import { ExpenseCard } from '../components/expenseCard';
import { ExpenseFiltersComponent } from '../components/expenseFilters';
import { ExpenseSummary } from '../components/expenseSummary';
import { Expense } from '../models/expenseModel';

interface ExpenseListScreenProps {
  onExpensePress: (expense: Expense) => void;
  onAddExpensePress: () => void;
  onExpenseEdit: (expense: Expense) => void;
}

export const ExpenseListScreen: React.FC<ExpenseListScreenProps> = ({
  onExpensePress,
  onAddExpensePress,
  onExpenseEdit,
}) => {
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const {
    expenses,
    totalCount,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    isEmpty,
    canLoadMore,
    filters,
    searchQuery,
    loadMore,
    refresh,
    search,
    applyFilters,
    clearFilters,
    removeExpenseFromList,
    updateExpenseInList,
  } = useExpenseList();

  const {
    deleteExpense,
    bulkDeleteExpenses,
    duplicateExpense,
    isDeleting,
    error: actionError,
  } = useExpenseActions({
    onExpenseDeleted: removeExpenseFromList,
    onExpenseUpdated: updateExpenseInList,
    onError: (error) => Alert.alert('Error', error),
    onSuccess: (message) => Alert.alert('Success', message),
  });

  // Calculate summary data
  const monthlyTotal = expenses.reduce((sum, expense) => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    if (expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()) {
      return sum + expense.amount;
    }
    return sum;
  }, 0);

  const yearToDateTotal = expenses.reduce((sum, expense) => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    if (expenseDate.getFullYear() === now.getFullYear()) {
      return sum + expense.amount;
    }
    return sum;
  }, 0);

  const averageExpense = expenses.length > 0 ? monthlyTotal / expenses.length : 0;

  const handleExpensePress = (expense: Expense) => {
    if (isSelectionMode) {
      toggleExpenseSelection(expense.id);
    } else {
      onExpensePress(expense);
    }
  };

  const handleExpenseLongPress = (expense: Expense) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedExpenses([expense.id]);
    }
  };

  const toggleExpenseSelection = (expenseId: string) => {
    setSelectedExpenses(prev => {
      if (prev.includes(expenseId)) {
        const newSelection = prev.filter(id => id !== expenseId);
        if (newSelection.length === 0) {
          setIsSelectionMode(false);
        }
        return newSelection;
      } else {
        return [...prev, expenseId];
      }
    });
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedExpenses([]);
  };

  const handleBulkDelete = () => {
    Alert.alert(
      'Delete Expenses',
      `Are you sure you want to delete ${selectedExpenses.length} expense(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await bulkDeleteExpenses(selectedExpenses);
            exitSelectionMode();
          },
        },
      ]
    );
  };

  const handleDuplicate = async (expense: Expense) => {
    const duplicated = await duplicateExpense(expense);
    if (duplicated) {
      // Refresh list to show the new expense
      refresh();
    }
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <ExpenseCard
      expense={item}
      onPress={handleExpensePress}
      onLongPress={handleExpenseLongPress}
      isSelected={selectedExpenses.includes(item.id)}
    />
  );

  const renderHeader = () => (
    <View>
      <ExpenseSummary
        monthlyTotal={monthlyTotal}
        yearToDateTotal={yearToDateTotal}
        expenseCount={expenses.length}
        averageExpense={averageExpense}
      />

      <View style={styles.filtersContainer}>
        <ExpenseFiltersComponent
          filters={filters}
          onFiltersChange={applyFilters}
          onClearFilters={clearFilters}
        />
      </View>

      {totalCount > 0 && (
        <View style={styles.listHeader}>
          <Text style={styles.totalCountText}>
            {totalCount} expense{totalCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!canLoadMore) return null;

    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={loadMore}
        disabled={isLoadingMore}
      >
        <Text style={styles.loadMoreText}>
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No expenses found</Text>
      <Text style={styles.emptySubtitle}>
        {Object.keys(filters).length > 0
          ? 'Try adjusting your filters or add your first expense'
          : 'Add your first expense to get started'
        }
      </Text>
      <TouchableOpacity style={styles.addFirstButton} onPress={onAddExpensePress}>
        <Text style={styles.addFirstButtonText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );

  if (error && expenses.length === 0) {
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
    <View style={styles.container}>
      {/* Selection Mode Header */}
      {isSelectionMode && (
        <View style={styles.selectionHeader}>
          <TouchableOpacity onPress={exitSelectionMode}>
            <Text style={styles.cancelSelectionText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.selectionCountText}>
            {selectedExpenses.length} selected
          </Text>
          <TouchableOpacity onPress={handleBulkDelete}>
            <Text style={styles.deleteSelectionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={isEmpty ? renderEmpty : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={['#2196F3']}
          />
        }
        onEndReached={canLoadMore ? loadMore : undefined}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isEmpty ? styles.emptyListContainer : undefined}
      />

      {/* Add Button */}
      {!isSelectionMode && (
        <TouchableOpacity style={styles.addButton} onPress={onAddExpensePress}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2196F3',
  },
  cancelSelectionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectionCountText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteSelectionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  totalCountText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  loadMoreButton: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  addFirstButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});