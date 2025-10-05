import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet, Alert } from 'react-native';
import { useIncomeCategories } from '../hooks/useIncomeCategories';

interface IncomeCategorySelectorProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  error?: string;
}

export const IncomeCategorySelector: React.FC<IncomeCategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
  error,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {
    categories,
    defaultCategories,
    customCategories,
    getFrequentlyUsedCategories,
    getCategoryById,
    isLoading,
    error: categoriesError,
  } = useIncomeCategories();

  const selectedCategoryData = getCategoryById(selectedCategory);
  const frequentlyUsedCategories = getFrequentlyUsedCategories(5);

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
    setIsModalVisible(false);
  };

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem,
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <View style={styles.categoryInfo}>
        <View
          style={[
            styles.categoryColor,
            { backgroundColor: item.color },
          ]}
        />
        <Text style={[
          styles.categoryName,
          selectedCategory === item.id && styles.selectedCategoryName,
        ]}>
          {item.name}
        </Text>
        {item.isDefault && (
          <Text style={styles.defaultBadge}>Default</Text>
        )}
      </View>
      {item.incomeCount > 0 && (
        <Text style={styles.categoryCount}>
          {item.incomeCount} income{item.incomeCount !== 1 ? 's' : ''}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.selector,
          error && styles.selectorError,
        ]}
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.selectedCategoryDisplay}>
          {selectedCategoryData ? (
            <View style={styles.selectedCategoryInfo}>
              <View
                style={[
                  styles.selectedCategoryColor,
                  { backgroundColor: selectedCategoryData.color },
                ]}
              />
              <Text style={styles.selectedCategoryText}>
                {selectedCategoryData.name}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>
              Select a category
            </Text>
          )}
        </View>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Income Category</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {categoriesError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{categoriesError}</Text>
            </View>
          )}

          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriesList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <View>
                {frequentlyUsedCategories.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Used</Text>
                  </View>
                )}
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {isLoading ? 'Loading categories...' : 'No categories available'}
                </Text>
                {!isLoading && (
                  <Text style={styles.emptySubtext}>
                    Default categories will be created automatically
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  selector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorError: {
    borderColor: '#FF5722',
  },
  selectedCategoryDisplay: {
    flex: 1,
  },
  selectedCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  selectedCategoryText: {
    fontSize: 16,
    color: '#333333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999999',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666666',
  },
  errorText: {
    fontSize: 12,
    color: '#FF5722',
    marginTop: 4,
  },
  modal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#FF5722',
    textAlign: 'center',
  },
  categoriesList: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  selectedCategoryItem: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  selectedCategoryName: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  defaultBadge: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  categoryCount: {
    fontSize: 12,
    color: '#999999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});