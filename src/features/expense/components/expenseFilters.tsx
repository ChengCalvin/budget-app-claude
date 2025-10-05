import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { ExpenseFilters } from '../models/expenseModel';
import { useCategories } from '../hooks/useCategories';
import { CategorySelector } from './categorySelector';
import { DatePicker } from './datePicker';
import { AmountInput } from './amountInput';

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
  onClearFilters: () => void;
}

export const ExpenseFiltersComponent: React.FC<ExpenseFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState<ExpenseFilters>(filters);
  const { categories } = useCategories();

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof ExpenseFilters];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  }).length;

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setIsModalVisible(false);
  };

  const handleClearFilters = () => {
    setTempFilters({});
    onClearFilters();
    setIsModalVisible(false);
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
            {/* Categories Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => {
                  const isSelected = tempFilters.categories?.includes(category.name) || false;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipSelected,
                      ]}
                      onPress={() => handleCategoryToggle(category.name)}
                    >
                      <View
                        style={[
                          styles.categoryColor,
                          { backgroundColor: category.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextSelected,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Date Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Date Range</Text>
              <View style={styles.dateRangeContainer}>
                <View style={styles.dateField}>
                  <Text style={styles.fieldLabel}>From</Text>
                  <DatePicker
                    value={tempFilters.dateFrom || ''}
                    onDateChange={(date) => updateDateFilter('dateFrom', date)}
                  />
                </View>
                <View style={styles.dateField}>
                  <Text style={styles.fieldLabel}>To</Text>
                  <DatePicker
                    value={tempFilters.dateTo || ''}
                    onDateChange={(date) => updateDateFilter('dateTo', date)}
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
                  <AmountInput
                    value={tempFilters.amountMin?.toString() || ''}
                    onValueChange={(value) => updateAmountFilter('amountMin', value)}
                    placeholder="0.00"
                  />
                </View>
                <View style={styles.amountField}>
                  <Text style={styles.fieldLabel}>Max Amount</Text>
                  <AmountInput
                    value={tempFilters.amountMax?.toString() || ''}
                    onValueChange={(value) => updateAmountFilter('amountMax', value)}
                    placeholder="No limit"
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
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
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
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
  amountRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  amountField: {
    flex: 1,
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