import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, StyleSheet } from 'react-native';
import { TransactionFilters } from '../models/transactionModel';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
  availableCategories?: string[];
}

export const TransactionFiltersComponent: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  availableCategories = [],
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState<TransactionFilters>(filters);

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof TransactionFilters];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '' && value !== 'all';
  }).length;

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setIsModalVisible(false);
  };

  const handleClearFilters = () => {
    setTempFilters({ type: 'all' });
    onClearFilters();
    setIsModalVisible(false);
  };

  const handleTypeToggle = (type: 'all' | 'income' | 'expense') => {
    setTempFilters(prev => ({
      ...prev,
      type,
    }));
  };

  const handleCategoryToggle = (categoryName: string) => {
    const currentCategories = tempFilters.categories || [];
    const isSelected = currentCategories.includes(categoryName);

    let newCategories: string[];
    if (isSelected) {
      newCategories = currentCategories.filter(cat => cat !== categoryName);
    } else {
      newCategories = [...currentCategories, categoryName];
    }

    setTempFilters(prev => ({
      ...prev,
      categories: newCategories.length > 0 ? newCategories : undefined,
    }));
  };

  const updateAmountFilter = (field: 'amountMin' | 'amountMax', value: string) => {
    const numericValue = value ? parseFloat(value) : undefined;
    setTempFilters(prev => ({
      ...prev,
      [field]: numericValue,
    }));
  };

  const updateDateFilter = (field: 'dateFrom' | 'dateTo', value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const getTypeButtonStyle = (type: 'all' | 'income' | 'expense') => {
    const isSelected = tempFilters.type === type;
    return [
      styles.typeButton,
      isSelected && styles.typeButtonSelected,
      type === 'income' && isSelected && styles.incomeButtonSelected,
      type === 'expense' && isSelected && styles.expenseButtonSelected,
    ];
  };

  const getTypeButtonTextStyle = (type: 'all' | 'income' | 'expense') => {
    const isSelected = tempFilters.type === type;
    return [
      styles.typeButtonText,
      isSelected && styles.typeButtonTextSelected,
    ];
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.filterIcon}>🔍</Text>
        <Text style={styles.filterButtonText}>
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.headerButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleClearFilters}
            >
              <Text style={[styles.headerButtonText, styles.clearButtonText]}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Transaction Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Transaction Type</Text>
              <View style={styles.typeButtonsContainer}>
                <TouchableOpacity
                  style={getTypeButtonStyle('all')}
                  onPress={() => handleTypeToggle('all')}
                >
                  <Text style={getTypeButtonTextStyle('all')}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={getTypeButtonStyle('income')}
                  onPress={() => handleTypeToggle('income')}
                >
                  <Text style={getTypeButtonTextStyle('income')}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={getTypeButtonStyle('expense')}
                  onPress={() => handleTypeToggle('expense')}
                >
                  <Text style={getTypeButtonTextStyle('expense')}>Expenses</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Categories Filter */}
            {availableCategories.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <View style={styles.categoryGrid}>
                  {availableCategories.map((category) => {
                    const isSelected = tempFilters.categories?.includes(category) || false;
                    return (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryChip,
                          isSelected && styles.categoryChipSelected,
                        ]}
                        onPress={() => handleCategoryToggle(category)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            isSelected && styles.categoryChipTextSelected,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Date Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Date Range</Text>
              <View style={styles.dateRangeContainer}>
                <View style={styles.dateField}>
                  <Text style={styles.fieldLabel}>From</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={formatDateForInput(tempFilters.dateFrom)}
                    onChangeText={(text) => updateDateFilter('dateFrom', text)}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={styles.dateField}>
                  <Text style={styles.fieldLabel}>To</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={formatDateForInput(tempFilters.dateTo)}
                    onChangeText={(text) => updateDateFilter('dateTo', text)}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>
            </View>

            {/* Amount Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Amount Range</Text>
              <View style={styles.amountRangeContainer}>
                <View style={styles.amountField}>
                  <Text style={styles.fieldLabel}>Min Amount</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={tempFilters.amountMin?.toString() || ''}
                    onChangeText={(value) => updateAmountFilter('amountMin', value)}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.amountField}>
                  <Text style={styles.fieldLabel}>Max Amount</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={tempFilters.amountMax?.toString() || ''}
                    onChangeText={(value) => updateAmountFilter('amountMax', value)}
                    placeholder="No limit"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#2196F3',
  },
  clearButtonText: {
    color: '#FF5722',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  typeButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  incomeButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  expenseButtonSelected: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    fontWeight: '600',
    color: '#2196F3',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333333',
  },
  categoryChipTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 6,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  amountRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  amountField: {
    flex: 1,
  },
  amountInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  applyButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});