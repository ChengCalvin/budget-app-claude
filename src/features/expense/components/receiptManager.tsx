import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { Receipt } from '../models/expenseModel';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface ReceiptManagerProps {
  receipts: Receipt[];
  onAddReceipts: (files: File[]) => void;
  onRemoveReceipt: (receiptId: string) => void;
  isUploading: boolean;
  maxFiles?: number;
}

export const ReceiptManager: React.FC<ReceiptManagerProps> = ({
  receipts,
  onAddReceipts,
  onRemoveReceipt,
  isUploading,
  maxFiles = 5,
}) => {
  const canAddMore = receipts.length < maxFiles;

  const handleAddReceipts = () => {
    Alert.alert(
      'Add Receipt',
      'Choose how you want to add your receipt',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Photo Library', onPress: openImageLibrary },
        { text: 'Files', onPress: openDocumentPicker },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: `receipt_${Date.now()}.jpg`,
        size: asset.fileSize || 0,
      } as any;

      onAddReceipts([file]);
    }
  };

  const openImageLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Photo library permission is required to select images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const files = result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `receipt_${Date.now()}.jpg`,
        size: asset.fileSize || 0,
      })) as any[];

      onAddReceipts(files);
    }
  };

  const openDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const files = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.mimeType,
          name: asset.name,
          size: asset.size,
        })) as any[];

        onAddReceipts(files);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleRemoveReceipt = (receiptId: string) => {
    Alert.alert(
      'Remove Receipt',
      'Are you sure you want to remove this receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemoveReceipt(receiptId) },
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    return '📎';
  };

  return (
    <View style={styles.container}>
      {/* Add Receipt Button */}
      {canAddMore && (
        <TouchableOpacity
          style={[
            styles.addButton,
            isUploading && styles.addButtonDisabled,
          ]}
          onPress={handleAddReceipts}
          disabled={isUploading}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>
            {isUploading ? 'Uploading...' : 'Add Receipt'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Receipt List */}
      {receipts.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.receiptsList}
          contentContainerStyle={styles.receiptsListContent}
        >
          {receipts.map((receipt) => (
            <View key={receipt.id} style={styles.receiptItem}>
              {/* Receipt Preview */}
              <View style={styles.receiptPreview}>
                {receipt.mimeType.startsWith('image/') ? (
                  <Image
                    source={{ uri: receipt.url }}
                    style={styles.receiptImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.filePreview}>
                    <Text style={styles.fileIcon}>
                      {getFileIcon(receipt.mimeType)}
                    </Text>
                    <Text style={styles.fileName} numberOfLines={2}>
                      {receipt.filename}
                    </Text>
                  </View>
                )}

                {/* Remove Button */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveReceipt(receipt.id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Receipt Info */}
              <View style={styles.receiptInfo}>
                <Text style={styles.receiptName} numberOfLines={1}>
                  {receipt.filename}
                </Text>
                <Text style={styles.receiptSize}>
                  {formatFileSize(receipt.size)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Info Text */}
      <Text style={styles.infoText}>
        Supported formats: JPG, PNG, PDF (max 10MB each)
      </Text>

      {receipts.length > 0 && (
        <Text style={styles.countText}>
          {receipts.length}/{maxFiles} receipts added
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonIcon: {
    fontSize: 24,
    color: '#2196F3',
    marginBottom: 4,
  },
  addButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  receiptsList: {
    marginBottom: 12,
  },
  receiptsListContent: {
    paddingRight: 16,
  },
  receiptItem: {
    marginRight: 12,
    width: 120,
  },
  receiptPreview: {
    position: 'relative',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    overflow: 'hidden',
    height: 120,
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
  filePreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  fileIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  fileName: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  receiptInfo: {
    marginTop: 8,
  },
  receiptName: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
  },
  receiptSize: {
    fontSize: 10,
    color: '#999999',
    marginTop: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  countText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    textAlign: 'right',
  },
});