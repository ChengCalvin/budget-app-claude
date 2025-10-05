import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../features/authentication/hooks/useAuth';
import { useExpenseList } from '../features/expense/hooks/useExpenseList';
import { ExpenseSummary } from '../features/expense/components/expenseSummary';
import { ExpenseCard } from '../features/expense/components/expenseCard';
import { ExpenseListScreen } from '../features/expense/screens/expenseListScreen';
import { ExpenseFormScreen } from '../features/expense/screens/expenseFormScreen';
import { ExpenseAnalyticsScreen } from '../features/expense/screens/expenseAnalyticsScreen';
import { CategoryManagementScreen } from '../features/expense/screens/categoryManagementScreen';
import { Expense } from '../features/expense/models/expenseModel';

type ScreenType = 'dashboard' | 'list' | 'form' | 'analytics' | 'categories';

interface ExpenseDashboardScreenProps { }

export const ExpenseDashboardScreen: React.FC<ExpenseDashboardScreenProps> = () => {
  const { logout, user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const {
    expenses,
    totalCount,
    isLoading,
    error,
    refresh,
  } = useExpenseList({
    pageSize: 5 // Only show recent 5 on dashboard
  });

  // Calculate summary data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTotal = expenses.reduce((sum, expense) => {
    const expenseDate = new Date(expense.date);
    if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
      return sum + expense.amount;
    }
    return sum;
  }, 0);

  const yearToDateTotal = expenses.reduce((sum, expense) => {
    const expenseDate = new Date(expense.date);
    if (expenseDate.getFullYear() === currentYear) {
      return sum + expense.amount;
    }
    return sum;
  }, 0);

  const averageExpense = expenses.length > 0 ? monthlyTotal / expenses.length : 0;

  const handleExpensePress = (expense: Expense) => {
    setSelectedExpense(expense);
    setCurrentScreen('form');
  };

  const handleAddExpensePress = () => {
    setSelectedExpense(null);
    setCurrentScreen('form');
  };

  const handleExpenseEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setCurrentScreen('form');
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
    setSelectedExpense(null);
    refresh(); // Refresh data when returning to dashboard
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  // Render different screens based on currentScreen state
  if (currentScreen === 'list') {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToDashboard}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>All Expenses</Text>
          <View style={styles.placeholder} />
        </View>
        <ExpenseListScreen
          onExpensePress={handleExpensePress}
          onAddExpensePress={handleAddExpensePress}
          onExpenseEdit={handleExpenseEdit}
        />
      </View>
    );
  }

  if (currentScreen === 'form') {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToDashboard}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>
            {selectedExpense ? 'Edit Expense' : 'Add Expense'}
          </Text>
          <View style={styles.placeholder} />
        </View>
        <ExpenseFormScreen
          expense={selectedExpense}
          // onExpenseSaved={handleBackToDashboard}
          onCancel={handleBackToDashboard}
          onSubmit={function (expense: Expense): void {
            throw new Error('Function not implemented.');
          }}
        />
      </View>
    );
  }

  if (currentScreen === 'analytics') {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToDashboard}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Analytics</Text>
          <View style={styles.placeholder} />
        </View>
        <ExpenseAnalyticsScreen />
      </View>
    );
  }

  if (currentScreen === 'categories') {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToDashboard}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Categories</Text>
          <View style={styles.placeholder} />
        </View>
        <CategoryManagementScreen
          onClose={function (): void {
            throw new Error('Function not implemented.');
          }} />
      </View>
    );
  }

  // Dashboard view
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.userEmailText}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <ExpenseSummary
          monthlyTotal={monthlyTotal}
          yearToDateTotal={yearToDateTotal}
          expenseCount={totalCount}
          averageExpense={averageExpense}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, styles.primaryAction]}
            onPress={handleAddExpensePress}
          >
            <Text style={styles.actionIcon}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setCurrentScreen('list')}
          >
            <Text style={styles.actionIcon}>📋</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setCurrentScreen('analytics')}
          >
            <Text style={styles.actionIcon}>📊</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setCurrentScreen('categories')}
          >
            <Text style={styles.actionIcon}>🏷️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Expenses */}
      <View style={styles.recentExpensesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <TouchableOpacity onPress={() => setCurrentScreen('list')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : expenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubtext}>Add your first expense to get started</Text>
          </View>
        ) : (
          expenses.slice(0, 3).map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onPress={handleExpensePress}
              onLongPress={() => { }} // Disable long press on dashboard
              isSelected={false}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  placeholder: {
    width: 60, // Balance the header layout
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  userEmailText: {
    fontSize: 14,
    color: '#666666',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF5722',
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    marginBottom: 24,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionCard: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryAction: {
    backgroundColor: '#2196F3',
  },
  actionIcon: {
    fontSize: 24,
    color: '#333333',
  },
  recentExpensesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF5722',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default ExpenseDashboardScreen;