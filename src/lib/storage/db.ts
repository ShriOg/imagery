import { CanvasDocument } from "@/types/canvas";

const DB_NAME = "ImageryStudioDB";
const DB_VERSION = 1;
const STORE_DOCUMENTS = "documents";
const ACTIVE_DOC_KEY = "active_document";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
        db.createObjectStore(STORE_DOCUMENTS, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save the currently active document to persistent IndexedDB
 */
export async function saveActiveDocument(document: CanvasDocument): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_DOCUMENTS, "readwrite");
      const store = transaction.objectStore(STORE_DOCUMENTS);
      
      const record = {
        id: ACTIVE_DOC_KEY,
        document: JSON.parse(JSON.stringify(document)),
        updatedAt: Date.now(),
      };

      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to persist document to IndexedDB:", err);
  }
}

/**
 * Rehydrate the last active document from IndexedDB
 */
export async function getActiveDocument(): Promise<CanvasDocument | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_DOCUMENTS, "readonly");
      const store = transaction.objectStore(STORE_DOCUMENTS);
      const request = store.get(ACTIVE_DOC_KEY);

      request.onsuccess = () => {
        if (request.result && request.result.document) {
          resolve(request.result.document);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to load document from IndexedDB:", err);
    return null;
  }
}

/**
 * Save as a named Project
 */
export async function saveProject(document: CanvasDocument): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_DOCUMENTS, "readwrite");
      const store = transaction.objectStore(STORE_DOCUMENTS);

      const record = {
        id: document.id || `project_${Date.now()}`,
        document: JSON.parse(JSON.stringify(document)),
        updatedAt: Date.now(),
      };

      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to save project to IndexedDB:", err);
  }
}

/**
 * List all saved projects
 */
export async function listProjects(): Promise<Array<{ id: string; document: CanvasDocument; updatedAt: number }>> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_DOCUMENTS, "readonly");
      const store = transaction.objectStore(STORE_DOCUMENTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = (request.result || [])
          .filter((item: any) => item.id !== ACTIVE_DOC_KEY)
          .map((item: any) => ({
            id: item.id,
            document: item.document,
            updatedAt: item.updatedAt || Date.now(),
          }));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to list projects from IndexedDB:", err);
    return [];
  }
}

/**
 * Delete a saved project
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_DOCUMENTS, "readwrite");
      const store = transaction.objectStore(STORE_DOCUMENTS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to delete project from IndexedDB:", err);
  }
}
