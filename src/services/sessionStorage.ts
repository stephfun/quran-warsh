/**
 * Service de stockage des sessions de récitation
 * Gère la persistance des sessions avec IndexedDB
 */

import { RiwayaType } from '../config/riwayaConfig';

// Types
export interface RecitationSession {
  id: string;
  riwaya: RiwayaType;
  currentPage: number;
  surahName: string;
  surahNo: number;
  juz: number;
  hizb: number;
  thoumn: number;
  revealedWordsPerPage: { [pageIndex: number]: number[] }; // page -> word indices
  lastRevealedPage: number | null;
  lastRevealedWord: number | null;
  totalWordsRevealed: number;
  status: 'active' | 'paused';
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

// Constantes
const DB_NAME = 'quran-recitation-db';
const DB_VERSION = 2; // Incrémenté pour ajouter le nouveau store
const SESSION_STORE = 'recitation_sessions_v2';

// Instance de la base de données
let dbInstance: IDBDatabase | null = null;

/**
 * Ouvre ou crée la base de données IndexedDB
 */
export async function openSessionDatabase(): Promise<IDBDatabase> {
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

      // Store pour les sessions de récitation v2
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        const sessionStore = db.createObjectStore(SESSION_STORE, { keyPath: 'id' });
        sessionStore.createIndex('riwaya', 'riwaya', { unique: false });
        sessionStore.createIndex('status', 'status', { unique: false });
        sessionStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
}

/**
 * Génère un ID unique pour une session
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Crée une nouvelle session de récitation
 */
export async function createSession(
  riwaya: RiwayaType,
  currentPage: number,
  surahName: string,
  surahNo: number,
  juz: number,
  hizb: number,
  thoumn: number
): Promise<RecitationSession> {
  const db = await openSessionDatabase();
  const now = new Date().toISOString();

  const session: RecitationSession = {
    id: generateSessionId(),
    riwaya,
    currentPage,
    surahName,
    surahNo,
    juz,
    hizb,
    thoumn,
    revealedWordsPerPage: {},
    lastRevealedPage: null,
    lastRevealedWord: null,
    totalWordsRevealed: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSION_STORE], 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.add(session);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(session);
  });
}

/**
 * Met à jour une session existante
 */
export async function updateSession(session: RecitationSession): Promise<void> {
  const db = await openSessionDatabase();
  session.updatedAt = new Date().toISOString();

  // Calculer le total des mots révélés
  session.totalWordsRevealed = Object.values(session.revealedWordsPerPage)
    .reduce((sum, words) => sum + words.length, 0);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSION_STORE], 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.put(session);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Récupère une session par son ID
 */
export async function getSession(sessionId: string): Promise<RecitationSession | null> {
  const db = await openSessionDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSION_STORE], 'readonly');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.get(sessionId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * Récupère toutes les sessions pour une riwaya (triées par date de mise à jour)
 */
export async function getAllSessions(riwaya: RiwayaType): Promise<RecitationSession[]> {
  const db = await openSessionDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSION_STORE], 'readonly');
    const store = transaction.objectStore(SESSION_STORE);
    const index = store.index('riwaya');
    const request = index.getAll(riwaya);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const sessions = request.result as RecitationSession[];
      // Trier par date de mise à jour (plus récent en premier)
      sessions.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      resolve(sessions);
    };
  });
}

/**
 * Récupère la session active (s'il y en a une)
 */
export async function getActiveSession(riwaya: RiwayaType): Promise<RecitationSession | null> {
  const sessions = await getAllSessions(riwaya);
  return sessions.find(s => s.status === 'active') || null;
}

/**
 * Récupère toutes les sessions en pause
 */
export async function getPausedSessions(riwaya: RiwayaType): Promise<RecitationSession[]> {
  const sessions = await getAllSessions(riwaya);
  return sessions.filter(s => s.status === 'paused');
}

/**
 * Supprime une session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const db = await openSessionDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSION_STORE], 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.delete(sessionId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Met en pause une session (change status et sauvegarde)
 */
export async function pauseSession(session: RecitationSession): Promise<void> {
  session.status = 'paused';
  await updateSession(session);
}

/**
 * Convertit Map<number, Set<number>> vers format stockable
 */
export function mapToStorable(map: Map<number, Set<number>>): { [key: number]: number[] } {
  const result: { [key: number]: number[] } = {};
  map.forEach((set, key) => {
    result[key] = Array.from(set);
  });
  return result;
}

/**
 * Convertit format stocké vers Map<number, Set<number>>
 */
export function storableToMap(obj: { [key: number]: number[] }): Map<number, Set<number>> {
  const map = new Map<number, Set<number>>();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(Number(key), new Set(value));
  });
  return map;
}
