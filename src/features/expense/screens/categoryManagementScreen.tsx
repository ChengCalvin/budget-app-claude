import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert, StyleSheet } from 'react-native';
import { useCategories } from '../hooks/useCategories';
import { Category, CategoryCreateInput, CategoryUpdateInput } from '../models/categoryModel';

interface CategoryManagementScreenProps {
  onClose: () => void;
}

export const CategoryManagementScreen: React.FC<CategoryManagementScreenProps> = ({
  onClose,
}) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#2196F3');

  const {
    categories,
    defaultCategories,
    customCategories,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    validateNewCategoryName,
    clearError,
    totalCount,
    customCount,
  } = useCategories();

  const predefinedColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A24', '#0096C7', '#7209B7', '#F368E0',
  ];

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const validation = validateNewCategoryName(newCategoryName.trim());
    if (!validation.isValid) {
      Alert.alert('Error', validation.error);
      return;
    }

    const categoryData: CategoryCreateInput = {
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };

    const created = await createCategory(categoryData);
    if (created) {
      setIsAddModalVisible(false);
      setNewCategoryName('');
      setNewCategoryColor('#2196F3');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const validation = validateNewCategoryName(newCategoryName.trim(), editingCategory.id);
    if (!validation.isValid) {
      Alert.alert('Error', validation.error);
      return;
    }

    const updateData: CategoryUpdateInput = {
      id: editingCategory.id,
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };

    const updated = await updateCategory(updateData);
    if (updated) {
      setIsEditModalVisible(false);
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryColor('#2196F3');
    }
  };

  const handleDeleteCategory = (category: Category) => {
    if (category.isDefault) {
      Alert.alert('Error', 'Cannot delete default categories');
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? All expenses with this category will be moved to "Other".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(category.id),
        },
      ]
    );
  };

  const openEditModal = (category: Category) => {
    if (category.isDefault) {
      Alert.alert('Error', 'Cannot edit default categories');
      return;
    }

    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setIsEditModalVisible(true);
  };

  const openAddModal = () => {
    setNewCategoryName('');
    setNewCategoryColor('#2196F3');
    setIsAddModalVisible(true);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <View
          style={[
            styles.categoryColor,
            { backgroundColor: item.color },
          ]}
        />
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryName}>{item.name}</Text>
          {item.isDefault && (
            <Text style={styles.defaultLabel}>Default</Text>
          )}
        </View>
      </View>

      <View style={styles.categoryActions}>
        {!item.isDefault && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(item)}
              disabled={isUpdating}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteCategory(item)}
              disabled={isDeleting === item.id}
            >
              <Text style={styles.deleteButtonText}>
                {isDeleting === item.id ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderColorPicker = () => (
    <View style={styles.colorPicker}>
      <Text style={styles.colorPickerLabel}>Color</Text>
      <View style={styles.colorOptions}>
        {predefinedColors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              newCategoryColor === color && styles.selectedColorOption,
            ]}
            onPress={() => setNewCategoryColor(color)}
          />
        ))}
      </View>
    </View>
  );

  const renderModal = (
    isVisible: boolean,
    onClose: () => void,
    onSubmit: () => void,
    title: string,
    submitText: string,
    isSubmitting: boolean
  ) => (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity
            onPress={onSubmit}
            disabled={isSubmitting || !newCategoryName.trim()}
          >
            <Text style={[
              styles.submitButtonText,
              (!newCategoryName.trim() || isSubmitting) && styles.submitButtonTextDisabled,
            ]}>
              {isSubmitting ? 'Saving...' : submitText}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category Name</Text>
            <TextInput
              style={styles.textInput}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Enter category name"
              maxLength={15}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
            <Text style={styles.characterCount}>
              {newCategoryName.length}/15
            </Text>
          </View>

          {renderColorPicker()}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Categories</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {totalCount} total categories ({customCount} custom)
        </Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.dismissErrorText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Categories List */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        style={styles.categoryList}
        contentContainerStyle={styles.categoryListContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {defaultCategories.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Default Categories</Text>
              </View>
            )}
          </View>
        )}
        ListFooterComponent={() => (
          customCategories.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Custom Categories</Text>
            </View>
          ) : null
        )}
      />

      {/* Add Category Modal */}
      {renderModal(
        isAddModalVisible,
        () => setIsAddModalVisible(false),
        handleAddCategory,
        'Add Category',
        'Add',
        isCreating
      )}

      {/* Edit Category Modal */}
      {renderModal(
        isEditModalVisible,
        () => setIsEditModalVisible(false),
        handleEditCategory,
        'Edit Category',
        'Save',
        isUpdating
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  addButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  stats: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF5722',
    flex: 1,
  },
  dismissErrorText: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: '600',
  },
  categoryList: {
    flex: 1,
  },
  categoryListContent: {
    padding: 16,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  categoryItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
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
    elevation: 2,
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
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  defaultLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  categoryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  editButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: '600',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#CCCCCC',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  characterCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  colorPicker: {
    marginBottom: 24,
  },
  colorPickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#333333',
  },
});