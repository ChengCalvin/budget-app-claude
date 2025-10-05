import {
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL
} from 'firebase/storage';
import { storage } from '../../../services/firebaseConfig';
import { Receipt } from '../models/expenseModel';

export interface ReceiptService {
  uploadReceipt(file: File, expenseId: string): Promise<Receipt>;
  uploadMultipleReceipts(files: File[], expenseId: string): Promise<Receipt[]>;
  deleteReceipt(receiptId: string): Promise<void>;
  getReceiptUrl(receiptId: string): Promise<string>;
  compressImage(file: File, quality?: number): Promise<File>;
  extractTextFromReceipt(receiptId: string): Promise<string>;
}

class ReceiptServiceImpl implements ReceiptService {
  constructor() {
    // No setup needed for Firebase SDK
  }

  async uploadReceipt(file: File, expenseId: string): Promise<Receipt> {
    const compressedFile = await this.compressImage(file);

    const fileName = `receipts/${expenseId}/${Date.now()}_${compressedFile.name}`;
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, compressedFile);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    const receipt: Receipt = {
      id: snapshot.ref.name,
      fileName: compressedFile.name,
      url: downloadUrl,
      size: compressedFile.size,
      mimeType: compressedFile.type,
      uploadedAt: new Date().toISOString(),
    };

    return receipt;
  }

  async uploadMultipleReceipts(files: File[], expenseId: string): Promise<Receipt[]> {
    const uploadPromises = files.map(file => this.uploadReceipt(file, expenseId));
    return Promise.all(uploadPromises);
  }

  async deleteReceipt(receiptId: string): Promise<void> {
    const storageRef = ref(storage, receiptId);
    await deleteObject(storageRef);
  }

  async getReceiptUrl(receiptId: string): Promise<string> {
    const storageRef = ref(storage, receiptId);
    return await getDownloadURL(storageRef);
  }

  async compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1080;

        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  async extractTextFromReceipt(receiptId: string): Promise<string> {
    // OCR functionality would require Google Cloud Vision API or similar
    // For now, returning placeholder text
    console.log('OCR functionality needs to be implemented with Cloud Vision API');
    return 'OCR text extraction not yet implemented';
  }
}

export const receiptService = new ReceiptServiceImpl();