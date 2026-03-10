/**
 * Service de stockage IndexedDB pour la progression de récitation
 * Plus performant et capable que localStorage
 */

import { RiwayaType } from '../config/riwayaConfig';

// Types
export interface RecitationProgress {
  id: string;                    // Format: "{riwaya}_page_{pageNumber}"
  riwaya: RiwayaType;
  pageNumber: number;
  revealedWords: number[];       // Index des mots révélés
  helpedWords: number[];         // Index des mots révélés par aide (verts)
  errorWords: number[];          // Index des mots avec erreur (rouges)
  completedAt?: Date;            // Date de complétion de la page
  lastUpdated: Date;
}

export interface RecitationSession {
  id: string;
  riwaya: RiwayaType;
  startPage: number;
  currentPage: number;
  startedAt: Date;
  lastUpdated: Date;
}

// Constantes
const DB_NAME = 'quran-recitation-db';
const DB_VERSION = 1;
const PROGRESS_STORE = 'recitation_progress';
const SESSION_STORE = 'recitation_sessions';

// Instance de la base de données
let dbInstance: IDBDatabase | null = null;

/**
 * Ouvre ou crée la base de données IndexedDB
 */
export async function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Erreur ouverture IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store pour la progression par page
      if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
        const progressStore = db.createObjectStore(PROGRESS_STORE, { keyPath: 'id' });
        progressStore.createIndex('riwaya', 'riwaya', { unique: false });
        progressStore.createIndex('pageNumber', 'pageNumber', { unique: false });
        progressStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
      }

      // Store pour les sessions de récitation
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        const sessionStore = db.createObjectStore(SESSION_STORE, { keyPath: 'id' });
        sessionStore.createIndex('riwaya', 'riwaya', { unique: false });
        sessionStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
      }
    };
  });
}

/**
 * Génère l'ID unique pour une page
 */
function getPageId(riwaya: RiwayaType, pageNumber: number): string {
  return `${riwaya}_page_${pageNumber}`;
}

/**
 * Sauvegarde la progression d'une page
 */
export async function savePageProgress(
  riwaya: RiwayaType,
  pageNumber: number,
  revealedWords: number[],
  helpedWords: number[] = [],
  errorWords: number[] = []
): Promise<void> {
  const db = await openDatabase();
  const id = getPageId(riwaya, pageNumber);

  const progress: RecitationProgress = {
    id,
    riwaya,
    pageNumber,
    revealedWords,
    helpedWords,
    errorWords,
    lastUpdated: new Date(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROGRESS_STORE], 'readwrite');
    const store = transaction.objectStore(PROGRESS_STORE);
    const request = store.put(progress);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Marque une page comme complétée
 */
export async function markPageCompleted(
  riwaya: RiwayaType,
  pageNumber: number,
  revealedWords: number[],
  helpedWords: number[] = [],
  errorWords: number[] = []
): Promise<void> {
  const db = await openDatabase();
  const id = getPageId(riwaya, pageNumber);

  const progress: RecitationProgress = {
    id,
    riwaya,
    pageNumber,
    revealedWords,
    helpedWords,
    errorWords,
    completedAt: new Date(),
    lastUpdated: new Date(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROGRESS_STORE], 'readwrite');
    const store = transaction.objectStore(PROGRESS_STORE);
    const request = store.put(progress);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Récupère la progression d'une page
 */
export async function getPageProgress(
  riwaya: RiwayaType,
  pageNumber: number
): Promise<RecitationProgress | null> {
  const db = await openDatabase();
  const id = getPageId(riwaya, pageNumber);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROGRESS_STORE], 'readonly');
    const store = transaction.objectStore(PROGRESS_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * Récupère toutes les pages avec progression pour une riwaya
 */
export async function getAllProgress(riwaya: RiwayaType): Promise<RecitationProgress[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROGRESS_STORE], 'readonly');
    const store = transaction.objectStore(PROGRESS_STORE);
    const index = store.index('riwaya');
    const request = index.getAll(riwaya);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Efface la progression d'une page
 */
export async function clearPageProgress(
  riwaya: RiwayaType,
  pageNumber: number
): Promise<void> {
  const db = await openDatabase();
  const id = getPageId(riwaya, pageNumber);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROGRESS_STORE], 'readwrite');
    const store = transaction.objectStore(PROGRESS_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Efface toute la progression pour une riwaya
 */
export async function clearAllProgress(riwaya: RiwayaType): Promise<void> {
  const db = await openDatabase();
  const allProgress = await getAllProgress(riwaya);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROGRESS_STORE], 'readwrite');
    const store = transaction.objectStore(PROGRESS_STORE);

    let completed = 0;
    const total = allProgress.length;

    if (total === 0) {
      resolve();
      return;
    }

    allProgress.forEach((progress) => {
      const request = store.delete(progress.id);
      request.onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * Sauvegarde la session de récitation en cours
 */
export async function saveSession(
  riwaya: RiwayaType,
  startPage: number,
  currentPage: number
): Promise<string> {
  const db = await openDatabase();
  const id = `session_${riwaya}_${Date.now()}`;

  const session: RecitationSession = {
    id,
    riwaya,
    startPage,
    currentPage,
    startedAt: new Date(),
    lastUpdated: new Date(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSION_STORE], 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.put(session);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(id);
  });
}

/**
 * Met à jour la session courante
 */
export async function updateSession(
  sessionId: string,
  currentPage: number
): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSION_STORE], 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);
    const getRequest = store.get(sessionId);

    getRequest.onsuccess = () => {
      const session = getRequest.result as RecitationSession;
      if (session) {
        session.currentPage = currentPage;
        session.lastUpdated = new Date();
        const putRequest = store.put(session);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      } else {
        reject(new Error('Session not found'));
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Récupère la dernière session pour une riwaya
 */
export async function getLastSession(riwaya: RiwayaType): Promise<RecitationSession | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSION_STORE], 'readonly');
    const store = transaction.objectStore(SESSION_STORE);
    const index = store.index('riwaya');
    const request = index.getAll(riwaya);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const sessions = request.result as RecitationSession[];
      if (sessions.length === 0) {
        resolve(null);
        return;
      }
      // Trier par date de mise à jour et retourner la plus récente
      sessions.sort((a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
      resolve(sessions[0]);
    };
  });
}

/**
 * Calcule les statistiques de progression
 */
export async function getProgressStats(riwaya: RiwayaType, totalPages: number): Promise<{
  completedPages: number;
  inProgressPages: number;
  totalWordsRevealed: number;
  totalWordsHelped: number;
  totalErrors: number;
  percentComplete: number;
}> {
  const allProgress = await getAllProgress(riwaya);

  let completedPages = 0;
  let inProgressPages = 0;
  let totalWordsRevealed = 0;
  let totalWordsHelped = 0;
  let totalErrors = 0;

  allProgress.forEach((progress) => {
    if (progress.completedAt) {
      completedPages++;
    } else if (progress.revealedWords.length > 0) {
      inProgressPages++;
    }
    totalWordsRevealed += progress.revealedWords.length;
    totalWordsHelped += progress.helpedWords.length;
    totalErrors += progress.errorWords.length;
  });

  const percentComplete = Math.round((completedPages / totalPages) * 100);

  return {
    completedPages,
    inProgressPages,
    totalWordsRevealed,
    totalWordsHelped,
    totalErrors,
    percentComplete,
  };
}
