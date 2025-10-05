import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactionList } from '../features/transaction/hooks/useTransactionList';
import { TransactionSummary } from '../features/transaction/components/transactionSummary';
import { TransactionCard } from '../features/transaction/components/transactionCard';
import { TransactionFiltersComponent } from '../features/transaction/components/transactionFilters';
import { Transaction } from '../features/transaction/models/transactionModel';

type ScreenType = 'transactions' | 'addIncome' | 'addExpense';

interface TransactionScreenProps {
  navigation?: any;
}

const ITEM_HEIGHT = 80; // Fixed height for virtual scrolling

export const TransactionScreen: React.FC<TransactionScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('transactions');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    transactions,
    monthlyData,
    yearToDateData,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    hasMore,
    isEmpty,
    filters,
    loadMore,
    refresh,
    search,
    applyFilters,
    clearFilters,
  } = useTransactionList({
    pageSize: 20,
    initialFilters: { type: 'all' }
  });

  // Get unique categories for filter component
  const availableCategories = useMemo(() => {
    const categories = transactions.map(t => t.category);
    return Array.from(new Set(categories)).sort();
  }, [transactions]);

  const handleTransactionPress = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      // Navigate to income edit screen
      console.log('Navigate to income edit:', transaction.id);
      // navigation?.navigate('IncomeForm', { income: transaction });
    } else {
      // Navigate to expense edit screen
      console.log('Navigate to expense edit:', transaction.id);
      // navigation?.navigate('ExpenseForm', { expense: transaction });
    }
  };

  const handleAddTransactionPress = () => {
    console.log('Navigate to add transaction');
    // navigation?.navigate('TransactionForm');
  };


  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    search(text);
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TransactionCard
      transaction={item}
      onPress={handleTransactionPress}
      onLongPress={() => {}} // Disable long press for now
      isSelected={false}
      showDate={true}
    />
  );

  const getItemLayout = (data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const keyExtractor = (item: Transaction) => item.id;

  const renderHeader = () => (
    <View>
      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <TransactionSummary
          monthlyData={monthlyData}
          yearToDateData={yearToDateData}
          period="This Month"
        />
      </View>

      {/* Search and Filters */}
      <View style={styles.searchFiltersContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>
        <TransactionFiltersComponent
          filters={filters}
          onFiltersChange={applyFilters}
          onClearFilters={clearFilters}
          availableCategories={availableCategories}
        />
      </View>

      {/* Transaction List Header */}
      <View style={styles.transactionListHeader}>
        <Text style={styles.sectionTitle}>
          All Transactions ({transactions.length})
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>No transactions found</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery || Object.keys(filters).length > 1
          ? 'Try adjusting your search or filters'
          : 'Start by adding your first income or expense'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        getItemLayout={getItemLayout}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        onRefresh={refresh}
        refreshing={isRefreshing}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isEmpty ? styles.emptyListContainer : undefined}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && transactions.length === 0 && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddTransactionPress}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  summaryContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  transactionListHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    fontSize: 14,
    color: '#FF5722',
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF5722',
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});