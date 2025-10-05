import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SupportingDocument } from '../models/incomeModel';

interface SupportingDocumentManagerProps {
  documents: SupportingDocument[];
  onAddDocuments: (files: File[]) => void;
  onRemoveDocument: (documentId: string) => void;
  isUploading: boolean;
}

export const SupportingDocumentManager: React.FC<SupportingDocumentManagerProps> = ({
  documents,
  onAddDocuments,
  onRemoveDocument,
  isUploading,
}) => {
  const handleAddDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
        multiple: true,
        copyToCacheDirectory: false,
      });

      if (!result.canceled && result.assets) {
        const files = result.assets.map(asset => {
          // Create File-like object from DocumentPicker result
          const file = {
            name: asset.name,
            size: asset.size || 0,
            type: asset.mimeType || 'application/octet-stream',
            uri: asset.uri,
          } as any;

          return file;
        });

        onAddDocuments(files);
      }
    } catch (error) {
      console.error('Error picking documents:', error);
      Alert.alert('Error', 'Failed to pick documents. Please try again.');
    }
  };

  const handleRemoveDocument = (documentId: string) => {
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemoveDocument(documentId) },
      ]
    );
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType === 'application/pdf') {
      return '📄';
    }
    return '📎';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderDocument = ({ item }: { item: SupportingDocument }) => (
    <View style={styles.documentItem}>
      <View style={styles.documentInfo}>
        <Text style={styles.documentIcon}>
          {getFileIcon(item.mimeType)}
        </Text>
        <View style={styles.documentDetails}>
          <Text style={styles.documentName} numberOfLines={1}>
            {item.filename}
          </Text>
          <Text style={styles.documentSize}>
            {formatFileSize(item.size)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveDocument(item.id)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Add Documents Button */}
      <TouchableOpacity
        style={[styles.addButton, isUploading && styles.addButtonDisabled]}
        onPress={handleAddDocuments}
        disabled={isUploading}
      >
        <Text style={styles.addButtonText}>
          {isUploading ? 'Uploading...' : '+ Add Supporting Documents'}
        </Text>
      </TouchableOpacity>

      {/* Documents List */}
      {documents.length > 0 && (
        <View style={styles.documentsList}>
          <Text style={styles.documentsTitle}>
            Supporting Documents ({documents.length})
          </Text>
          <FlatList
            data={documents}
            renderItem={renderDocument}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Help Text */}
      <Text style={styles.helpText}>
        Supported formats: JPG, PNG, PDF (max 10MB per file)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  documentsList: {
    marginTop: 16,
  },
  documentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  documentSize: {
    fontSize: 12,
    color: '#999999',
  },
  removeButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5722',
  },
  helpText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
  },
});