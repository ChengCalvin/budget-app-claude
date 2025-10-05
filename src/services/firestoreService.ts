import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  QueryConstraint,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface FirestoreResult<T = DocumentData> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FirestoreListResult<T = DocumentData> {
  success: boolean;
  data?: T[];
  error?: string;
}

class FirestoreService {
  async create<T extends DocumentData>(
    collectionName: string,
    data: T,
    docId?: string
  ): Promise<FirestoreResult<string>> {
    try {
      if (docId) {
        await setDoc(doc(db, collectionName, docId), data);
        return {
          success: true,
          data: docId,
        };
      } else {
        const docRef = await addDoc(collection(db, collectionName), data);
        return {
          success: true,
          data: docRef.id,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create document',
      };
    }
  }

  async read<T extends DocumentData>(
    collectionName: string,
    docId: string
  ): Promise<FirestoreResult<T>> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() } as T,
        };
      } else {
        return {
          success: false,
          error: 'Document not found',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to read document',
      };
    }
  }

  async update<T extends DocumentData>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<FirestoreResult<void>> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update document',
      };
    }
  }

  async delete(
    collectionName: string,
    docId: string
  ): Promise<FirestoreResult<void>> {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete document',
      };
    }
  }

  async list<T extends DocumentData>(
    collectionName: string,
    constraints?: QueryConstraint[]
  ): Promise<FirestoreListResult<T>> {
    try {
      const collectionRef = collection(db, collectionName);
      const q = constraints ? query(collectionRef, ...constraints) : collectionRef;
      const querySnapshot = await getDocs(q);

      const documents: T[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() } as T);
      });

      return {
        success: true,
        data: documents,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to list documents',
      };
    }
  }

  async getUserData<T extends DocumentData>(
    userId: string,
    collectionName: string
  ): Promise<FirestoreListResult<T>> {
    try {
      return await this.list<T>(collectionName, [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
      ]);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get user data',
      };
    }
  }
}

export const firestoreService = new FirestoreService();
export default firestoreService;