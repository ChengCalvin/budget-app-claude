import {
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL
} from 'firebase/storage';
import { storage } from '../../../services/firebaseConfig';
import { SupportingDocument } from '../models/incomeModel';

export interface SupportingDocumentService {
  uploadSupportingDocument(file: File, incomeId: string): Promise<SupportingDocument>;
  uploadMultipleSupportingDocuments(files: File[], incomeId: string): Promise<SupportingDocument[]>;
  deleteSupportingDocument(documentId: string): Promise<void>;
  getSupportingDocumentUrl(documentId: string): Promise<string>;
  compressImage(file: File, quality?: number): Promise<File>;
  extractTextFromDocument(documentId: string): Promise<string>;
}

class SupportingDocumentServiceImpl implements SupportingDocumentService {
  constructor() {
    // No setup needed for Firebase SDK
  }

  async uploadSupportingDocument(file: File, incomeId: string): Promise<SupportingDocument> {
    const compressedFile = file.type.startsWith('image/')
      ? await this.compressImage(file)
      : file;

    const fileName = `supporting-documents/${incomeId}/${Date.now()}_${compressedFile.name}`;
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, compressedFile);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    const document: SupportingDocument = {
      id: snapshot.ref.name,
      filename: compressedFile.name,
      url: downloadUrl,
      size: compressedFile.size,
      mimeType: compressedFile.type as 'image/jpeg' | 'image/jpg' | 'image/png' | 'application/pdf',
      uploadedAt: new Date().toISOString(),
    };

    return document;
  }

  async uploadMultipleSupportingDocuments(files: File[], incomeId: string): Promise<SupportingDocument[]> {
    const uploadPromises = files.map(file => this.uploadSupportingDocument(file, incomeId));
    return Promise.all(uploadPromises);
  }

  async deleteSupportingDocument(documentId: string): Promise<void> {
    const storageRef = ref(storage, documentId);
    await deleteObject(storageRef);
  }

  async getSupportingDocumentUrl(documentId: string): Promise<string> {
    const storageRef = ref(storage, documentId);
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

  async extractTextFromDocument(documentId: string): Promise<string> {
    // OCR functionality would require Google Cloud Vision API or similar
    // For now, returning placeholder text
    console.log('OCR functionality needs to be implemented with Cloud Vision API');
    return 'OCR text extraction not yet implemented';
  }
}

export const supportingDocumentService = new SupportingDocumentServiceImpl();