import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useCategories } from '../hooks/useCategories';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  error?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
  error,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { categories, getFrequentlyUsedCategories, getCategoryByName } = useCategories();

  const selectedCategoryObj = getCategoryByName(selectedCategory);
  const frequentlyUsed = getFrequentlyUsedCategories(5);

  const handleCategorySelect = (categoryName: string) => {
    onCategorySelect(categoryName);
    setIsModalVisible(false);
  };

  const renderCategoryItem = ({ item, isFrequent = false }: { item: any; isFrequent?: boolean }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.name && styles.selectedCategoryItem,
        isFrequent && styles.frequentCategoryItem,
      ]}
      onPress={() => handleCategorySelect(item.name)}
    >
      <View style={styles.categoryInfo}>
        <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
        <Text style={[
          styles.categoryName,
          selectedCategory === item.name && styles.selectedCategoryName,
        ]}>
          {item.name}
        </Text>
        {item.isDefault && (
          <Text style={styles.defaultLabel}>Default</Text>
        )}
      </View>
      {selectedCategory === item.name && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.selector,
          error && styles.selectorError,
        ]}
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          {selectedCategoryObj && (
            <View style={[styles.colorIndicator, { backgroundColor: selectedCategoryObj.color }]} />
          )}
          <Text style={styles.selectorText}>
            {selectedCategory || 'Select a category'}
          </Text>
        </View>
        <Text style={styles.chevron}>▼</Text>
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
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            renderItem={({ item }) => renderCategoryItem({ item })}
            keyExtractor={(item) => item.id}
            style={styles.categoryList}
            ListHeaderComponent={() => (
              <View>
                {frequentlyUsed.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Used</Text>
                    {frequentlyUsed.map((item) => (
                      <View key={`frequent-${item.id}`}>
                        {renderCategoryItem({ item, isFrequent: true })}
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>All Categories</Text>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorError: {
    borderColor: '#FF5722',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  chevron: {
    fontSize: 12,
    color: '#666666',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#FF5722',
    marginTop: 4,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
  },
  categoryList: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCategoryItem: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  frequentCategoryItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  selectedCategoryName: {
    fontWeight: '600',
    color: '#2196F3',
  },
  defaultLabel: {
    fontSize: 12,
    color: '#999999',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  checkmark: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '700',
  },
});