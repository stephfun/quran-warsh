/**
 * Quran App - Web Version
 * Supporte Warsh et Hafs (configurable via riwayaConfig)
 * Navigation par Swiper.js
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';

import { PAGES, SURAHS } from './src/data/quranData';
import { Page, Surah, ThemeMode } from './src/types';
import {
  getRiwayaConfig,
  getQuranPosition,
  isThoumnMarker,
  DEFAULT_RIWAYA,
  type RiwayaType
} from './src/config/riwayaConfig';
import {
  savePageProgress,
  getPageProgress,
  markPageCompleted,
  clearPageProgress,
} from './src/services/recitationStorage';
import {
  RecitationSession,
  createSession,
  updateSession,
  getSession,
  getAllSessions,
  deleteSession,
  pauseSession,
  mapToStorable,
  storableToMap,
} from './src/services/sessionStorage';

// Configuration active (peut être changée dynamiquement)
const CURRENT_RIWAYA: RiwayaType = DEFAULT_RIWAYA;
const riwayaConfig = getRiwayaConfig(CURRENT_RIWAYA);

// ============================================
// MODERN ICONS (Lucide/Phosphor style)
// ============================================

// Book Open Icon - Pour le menu des sourates
const BookOpenIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

// Play Icon - Bouton lecture
const PlayIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M8 5.14v14l11-7-11-7z"/>
  </svg>
);

// Pause Icon
const PauseIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <rect x="6" y="4" width="4" height="16" rx="1"/>
    <rect x="14" y="4" width="4" height="16" rx="1"/>
  </svg>
);

// Chevron Left - Peek précédent
const ChevronLeftIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

// Chevron Right - Peek suivant
const ChevronRightIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

// Eye Icon - Afficher
const EyeIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// Eye Off Icon - Masquer
const EyeOffIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// Settings Icon - Paramètres
const SettingsIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

// X Icon - Fermer
const XIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// Menu Icon - Hamburger
const MenuIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

// Sun Icon - Mode clair
const SunIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

// Moon Icon - Mode sombre
const MoonIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

// Mic Icon - Microphone moderne pour récitation
const MicIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);

// Stop Icon - Arrêter la récitation (carré arrondi)
const StopIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
  </svg>
);

// Help Icon - Ampoule pour révéler le mot suivant
const HelpIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
    <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/>
  </svg>
);

// History Icon - Liste pour l'historique des sessions
const HistoryIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3"/>
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12a9 9 0 0 1 9-9"/>
  </svg>
);

// Trash Icon - Supprimer une session
const TrashIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

// ============================================
// CSS ANIMATIONS (injected once)
// ============================================

// Helper pour convertir hex en rgba (utilisé par injectStyles et dans les composants)
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const injectStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('quran-app-styles')) {
    const style = document.createElement('style');
    style.id = 'quran-app-styles';
    // Utilise les couleurs de la config active
    const pulseColor04 = hexToRgba(riwayaConfig.accentColor, 0.4);
    const pulseColor0 = hexToRgba(riwayaConfig.accentColor, 0);
    style.textContent = `
      @keyframes pulse-green {
        0%, 100% { box-shadow: 0 0 0 0 ${pulseColor04}; }
        50% { box-shadow: 0 0 0 12px ${pulseColor0}; }
      }
      @keyframes pulse-red {
        0%, 100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.5); }
        50% { box-shadow: 0 0 0 12px rgba(220, 53, 69, 0); }
      }
      @keyframes flash-error {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .btn-modern {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }
      .btn-modern:hover {
        transform: scale(1.05);
      }
      .btn-modern:active {
        transform: scale(0.95);
      }
      .btn-play {
        animation: pulse-green 2s infinite;
      }
      .btn-play:hover {
        animation: none;
        transform: scale(1.1);
      }
      .btn-rec {
        /* Pas d'animation pulse pour le bouton enregistrement */
      }
      .btn-rec:hover {
        transform: scale(1.1);
      }
      .btn-rec-active {
        animation: pulse-red 2s infinite;
      }
      .btn-rec-active:hover {
        animation: none;
        transform: scale(1.1);
      }
      .word-hidden {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #D4D0C8;
        border-radius: 8px;
        min-width: 20px;
        height: 1.2em;
        margin: 0 2px;
      }
      .word-revealed {
        color: inherit;
      }
      .word-error {
        color: #DC3545 !important;
        animation: flash-error 0.5s ease-in-out 3;
      }
      .word-help {
        color: #12D084 !important;
      }
      .word-current {
        background: rgba(18, 208, 132, 0.2);
        border-radius: 4px;
        padding: 0 4px;
      }
      .btn-icon:hover svg {
        transform: scale(1.1);
      }
      .btn-icon svg {
        transition: transform 0.2s ease;
      }
      .ornament-frame {
        background: linear-gradient(135deg, #2D5A3D 0%, #1E8449 50%, #2D5A3D 100%);
        padding: 3px;
        border-radius: 4px;
      }
      .ornament-frame-inner {
        background: inherit;
        border-radius: 2px;
        height: 100%;
      }
    `;
    document.head.appendChild(style);
  }
};

// Conversion chiffres arabes (kept for potential future use)
const toArabicNumerals = (num: number): string => {
  const arabicNums: { [key: string]: string } = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩',
  };
  return String(num).split('').map(d => arabicNums[d] || d).join('');
};

// Taille de police adaptative pour remplir la page
// Plus de mots = police plus petite, moins de mots = police plus grande
const getFontSizeForWords = (wordCount: number): number => {
  if (wordCount > 150) return 16;  // Pages très denses
  if (wordCount > 120) return 18;
  if (wordCount > 100) return 20;
  if (wordCount > 80) return 22;
  if (wordCount > 60) return 24;
  if (wordCount > 40) return 28;
  return 32; // Pages très courtes - grande police
};

// Line-height adaptative
const getLineHeightForWords = (wordCount: number): number => {
  if (wordCount > 100) return 1.8;
  if (wordCount > 60) return 2.0;
  if (wordCount > 40) return 2.4;
  return 2.8; // Plus d'espace pour les pages courtes
};

// Ornement décoratif islamique pour les headers de sourate (style Mushaf traditionnel)
const SurahOrnament: React.FC<{ isDark: boolean; surahName: string; surahNo: number; versesCount: number; fontFamily: string }> = ({
  isDark,
  surahName,
  surahNo,
  versesCount,
  fontFamily,
}) => {
  const strokeColor = isDark ? '#A0A0A0' : '#1A1A1A';
  const fillColor = isDark ? '#2A2A2A' : '#FFFFFF';
  const textColor = isDark ? '#F0EDE8' : '#1A1614';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      direction: 'rtl',
    }}>
      <svg viewBox="0 0 400 50" style={{ width: '100%', height: '100%', maxHeight: 40 }} preserveAspectRatio="xMidYMid meet">
        {/* Fond principal */}
        <rect x="2" y="8" width="396" height="34" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5"/>

        {/* Bordure intérieure */}
        <rect x="6" y="12" width="388" height="26" rx="2" fill="none" stroke={strokeColor} strokeWidth="0.5"/>

        {/* Motif décoratif gauche */}
        <g transform="translate(10, 25)">
          {/* Cercle externe */}
          <circle cx="20" cy="0" r="14" fill="none" stroke={strokeColor} strokeWidth="1.5"/>
          <circle cx="20" cy="0" r="10" fill="none" stroke={strokeColor} strokeWidth="0.8"/>
          {/* Motif floral */}
          <path d="M 20 -6 Q 24 0 20 6 Q 16 0 20 -6" fill="none" stroke={strokeColor} strokeWidth="0.8"/>
          <path d="M 14 0 Q 20 4 26 0 Q 20 -4 14 0" fill="none" stroke={strokeColor} strokeWidth="0.8"/>
          {/* Lignes décoratives */}
          <line x1="38" y1="0" x2="70" y2="0" stroke={strokeColor} strokeWidth="1"/>
          <circle cx="45" cy="0" r="2" fill={strokeColor}/>
          <circle cx="55" cy="0" r="2" fill={strokeColor}/>
          <circle cx="65" cy="0" r="2" fill={strokeColor}/>
        </g>

        {/* Motif décoratif droit (miroir) */}
        <g transform="translate(390, 25) scale(-1, 1)">
          {/* Cercle externe */}
          <circle cx="20" cy="0" r="14" fill="none" stroke={strokeColor} strokeWidth="1.5"/>
          <circle cx="20" cy="0" r="10" fill="none" stroke={strokeColor} strokeWidth="0.8"/>
          {/* Motif floral */}
          <path d="M 20 -6 Q 24 0 20 6 Q 16 0 20 -6" fill="none" stroke={strokeColor} strokeWidth="0.8"/>
          <path d="M 14 0 Q 20 4 26 0 Q 20 -4 14 0" fill="none" stroke={strokeColor} strokeWidth="0.8"/>
          {/* Lignes décoratives */}
          <line x1="38" y1="0" x2="70" y2="0" stroke={strokeColor} strokeWidth="1"/>
          <circle cx="45" cy="0" r="2" fill={strokeColor}/>
          <circle cx="55" cy="0" r="2" fill={strokeColor}/>
          <circle cx="65" cy="0" r="2" fill={strokeColor}/>
        </g>

        {/* Cadre central pour le nom */}
        <rect x="100" y="14" width="200" height="22" rx="11" fill={fillColor} stroke={strokeColor} strokeWidth="1"/>

        {/* Texte sourate */}
        <text x="200" y="30" textAnchor="middle"
          style={{
            fontFamily: fontFamily,
            fontSize: 16,
            fill: textColor,
            fontWeight: 600,
          }}>
          سُورَةُ {surahName}
        </text>
      </svg>
    </div>
  );
};

// Composant ornement de coin pour le cadre (style subtil)
const CornerOrnament: React.FC<{ position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; color: string }> = ({ position, color }) => {
  const rotations: Record<string, string> = {
    'top-left': 'rotate(0deg)',
    'top-right': 'rotate(90deg)',
    'bottom-right': 'rotate(180deg)',
    'bottom-left': 'rotate(270deg)',
  };
  const positions: Record<string, React.CSSProperties> = {
    'top-left': { top: -1, left: -1 },
    'top-right': { top: -1, right: -1 },
    'bottom-right': { bottom: -1, right: -1 },
    'bottom-left': { bottom: -1, left: -1 },
  };

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      style={{
        position: 'absolute',
        ...positions[position],
        transform: rotations[position],
        zIndex: 2,
      }}
    >
      {/* Ornement de coin simplifié */}
      <path
        d="M0,0 L14,0 L14,2 C9,2 7,5 7,7 C5,7 2,9 2,14 L0,14 Z"
        fill={color}
      />
    </svg>
  );
};

// Composant Page Quran pour le web
const QuranPageWeb: React.FC<{
  page: Page;
  pageNumber: number;
  isDark: boolean;
  isFirstPageOfSurah: boolean;
  config: typeof riwayaConfig; // Config de la riwaya active
  isReciting?: boolean; // Mode récitation actif
  revealedWords?: Set<number>; // Index des mots révélés
  lastRevealedWord?: number | null; // Dernier mot révélé (affiché en vert)
  onWordClick?: (wordIndex: number) => void; // Callback au clic sur un mot
}> = ({
  page,
  pageNumber,
  isDark,
  isFirstPageOfSurah,
  config,
  isReciting = false,
  revealedWords = new Set(),
  lastRevealedWord = null,
  onWordClick,
}) => {
  const bgColor = isDark ? '#1A1A1A' : '#FDFBF7';
  const textColor = isDark ? '#F0EDE8' : '#1A1614';
  const borderColor = isDark ? '#333' : '#E8E4DD';
  const accentLight = isDark ? config.accentColorLightDark : config.accentColorLight;

  // Couleur du cadre ornemental (vert foncé style bois peint)
  const frameColor = isDark ? '#1E5631' : '#2D5A3D';
  const frameLightColor = isDark ? '#2E8B57' : '#3CB371';

  // Pages 1-2 ont un layout spécial (Al-Fatiha et début Al-Baqara)
  // Pages spéciales définies dans la config (ex: pages 1-2 pour Al-Fatiha)
  const isSpecialPage = config.specialPages.includes(pageNumber);

  // Taille de police adaptative pour remplir la page
  // Pages 1-2: police grande (ornement + basmala + 6 lignes de texte)
  const fontSize = isSpecialPage
    ? 'clamp(22px, 5vw, 36px)'
    : getFontSizeForWords(page.total_words);

  // Line-height adaptative
  // Pages 1-2: espacement pour que tout rentre
  const lineHeight = isSpecialPage ? 1.8 : getLineHeightForWords(page.total_words);

  // Mots de la Basmala avec indices négatifs (avant le contenu des versets)
  // Ces indices permettent de les masquer/révéler indépendamment
  const BASMALA_WORDS = [
    { text: 'بِسْمِ', index: -4 },
    { text: 'ٱللَّهِ', index: -3 },
    { text: 'ٱلرَّحْمَٰنِ', index: -2 },
    { text: 'ٱلرَّحِيمِ', index: -1 },
  ];

  // Helper pour rendre un mot (visible ou masqué en mode récitation)
  // IMPORTANT: Les styles doivent être identiques pour éviter les décalages de layout
  const renderWord = (item: { text?: string; index?: number }, key: string) => {
    const wordIndex = item.index ?? -1;
    const isRevealed = !isReciting || revealedWords.has(wordIndex);
    const isLastRevealed = wordIndex === lastRevealedWord;

    // Style de base commun pour éviter les décalages de layout
    const baseStyle: React.CSSProperties = {
      display: 'inline-block',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      borderRadius: 4,
    };

    if (isReciting && !isRevealed) {
      // Mot masqué: fond gris, texte transparent (garde les dimensions exactes)
      return (
        <span
          key={key}
          data-testid="word-hidden"
          data-word-index={wordIndex}
          onClick={() => onWordClick?.(wordIndex)}
          style={{
            ...baseStyle,
            backgroundColor: isDark ? '#3A3A3A' : '#E8E4DD',
            color: 'transparent',
            userSelect: 'none',
          }}
        >
          {item.text}
        </span>
      );
    }

    // Mot visible - vert seulement si c'est le DERNIER mot révélé
    return (
      <span
        key={key}
        data-testid={isLastRevealed ? 'word-last-revealed' : 'word-visible'}
        data-word-index={wordIndex}
        onClick={() => onWordClick?.(wordIndex)}
        style={{
          ...baseStyle,
          color: isLastRevealed ? config.accentColor : undefined,
        }}
      >
        {item.text}
      </span>
    );
  };

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: bgColor,
        padding: 6,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cadre ornemental style cadre photo en bois */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Bordure extérieure - style subtil */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: `2px solid ${frameColor}`,
            borderRadius: 3,
            boxShadow: isDark
              ? `inset 0 1px 0 rgba(46,139,87,0.3), 0 1px 2px rgba(0,0,0,0.1)`
              : `inset 0 1px 0 rgba(60,179,113,0.2), 0 1px 2px rgba(0,0,0,0.05)`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Ornements de coins */}
        <CornerOrnament position="top-left" color={frameColor} />
        <CornerOrnament position="top-right" color={frameColor} />
        <CornerOrnament position="bottom-left" color={frameColor} />
        <CornerOrnament position="bottom-right" color={frameColor} />

        {/* Contenu intérieur avec fond */}
        <div
          style={{
            flex: 1,
            margin: 2,
            backgroundColor: bgColor,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Bordure intérieure fine */}
          <div
            style={{
              position: 'absolute',
              top: 2,
              left: 2,
              right: 2,
              bottom: 2,
              border: `1px solid ${isDark ? 'rgba(46, 139, 87, 0.2)' : 'rgba(46, 139, 87, 0.12)'}`,
              borderRadius: 1,
              pointerEvents: 'none',
            }}
          />

        {/* Quran Text - Remplit toute la page */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '6px 8px',
          }}
        >
          {/* Texte coranique - Rendu ligne par ligne pour remplir la page */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: isSpecialPage ? 'space-evenly' : 'space-around',
              direction: 'rtl',
              gap: isSpecialPage ? '0' : '0',
            }}
          >
            {(() => {
              // Pour pages 1-2: combiner en 6 lignes de texte seulement
              if (isSpecialPage) {
                // Extraire ornement, basmala et tout le contenu texte
                let surahStartData: { sura_name_ar?: string; sura_no?: number; verses_count?: number } | null = null;
                let hasBasmala = false;
                const allTextContent: Array<{ text?: string; index?: number; type?: string; aya?: number; sura?: number }> = [];

                page.lines?.forEach((line: { content: Array<{ text?: string; index?: number; type?: string; aya?: number; sura?: number; sura_name_ar?: string; sura_no?: number; verses_count?: number }> }) => {
                  line.content.forEach(item => {
                    if (item.type === 'surah_start') {
                      surahStartData = item;
                    } else if (item.type === 'basmala') {
                      hasBasmala = true;
                    } else {
                      allTextContent.push(item);
                    }
                  });
                });

                // Diviser en 6 lignes
                const LINES_COUNT = config.specialPagesLineCount;
                const itemsPerLine = Math.ceil(allTextContent.length / LINES_COUNT);
                const combinedLines: Array<Array<{ text?: string; index?: number; type?: string; aya?: number; sura?: number }>> = [];
                for (let i = 0; i < LINES_COUNT; i++) {
                  const start = i * itemsPerLine;
                  const end = Math.min(start + itemsPerLine, allTextContent.length);
                  if (start < allTextContent.length) {
                    combinedLines.push(allTextContent.slice(start, end));
                  }
                }

                return (
                  <>
                    {/* Ornement sourate */}
                    {surahStartData && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                        <SurahOrnament
                          isDark={isDark}
                          surahName={surahStartData.sura_name_ar || ''}
                          surahNo={surahStartData.sura_no || 0}
                          versesCount={surahStartData.verses_count || 0}
                          fontFamily={config.fontFamily}
                        />
                      </div>
                    )}
                    {/* Basmala - mot par mot pour le mode récitation */}
                    {hasBasmala && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 4px',
                        fontFamily: config.fontFamily,
                        fontSize: fontSize,
                        color: textColor,
                        gap: '8px',
                        direction: 'rtl',
                      }}>
                        {BASMALA_WORDS.map((word, idx) => renderWord(word, `basmala-${idx}`))}
                      </div>
                    )}
                    {/* 6 lignes de texte */}
                    {combinedLines.map((lineItems, lineIdx) => (
                      <div
                        key={lineIdx}
                        style={{
                          fontFamily: config.fontFamily,
                          fontSize: fontSize,
                          lineHeight: lineHeight,
                          color: textColor,
                          display: 'flex',
                          flexDirection: 'row',
                          flexWrap: 'nowrap',
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingLeft: 4,
                          paddingRight: 4,
                          width: '100%',
                          gap: '6px',
                        }}
                      >
                        {lineItems.map((item, idx) =>
                          item.type === 'verse_end' ? (
                            isThoumnMarker(item.sura || 0, item.aya || 0) ? (
                              <span
                                key={`end-${item.aya}-${idx}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  position: 'relative',
                                  width: 28,
                                  height: 24,
                                  margin: '0 2px',
                                  flexShrink: 0,
                                }}
                              >
                                <svg width="28" height="24" viewBox="0 0 28 24" style={{ position: 'absolute', top: 0, left: 0 }}>
                                  <defs>
                                    <linearGradient id={`thoumnGradS-${lineIdx}-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" stopColor={isDark ? '#2E8B57' : '#1E5631'} />
                                      <stop offset="100%" stopColor={isDark ? '#1E5631' : '#0D3320'} />
                                    </linearGradient>
                                  </defs>
                                  <path d="M14,0 L16,5 L14,8 L12,5 Z" fill={`url(#thoumnGradS-${lineIdx}-${idx})`} />
                                  <path d="M14,24 L16,19 L14,16 L12,19 Z" fill={`url(#thoumnGradS-${lineIdx}-${idx})`} />
                                  <path d="M0,12 L5,10 L8,12 L5,14 Z" fill={`url(#thoumnGradS-${lineIdx}-${idx})`} />
                                  <path d="M28,12 L23,10 L20,12 L23,14 Z" fill={`url(#thoumnGradS-${lineIdx}-${idx})`} />
                                  <ellipse cx="14" cy="12" rx="8" ry="6" fill={isDark ? '#1A1A1A' : '#FDFBF7'} stroke={`url(#thoumnGradS-${lineIdx}-${idx})`} strokeWidth="2" />
                                </svg>
                                <span style={{
                                  position: 'relative',
                                  zIndex: 1,
                                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                  fontSize: 8,
                                  fontWeight: 800,
                                  color: isDark ? '#2E8B57' : '#1E5631',
                                  lineHeight: 1,
                                }}>
                                  {item.aya || 0}
                                </span>
                              </span>
                            ) : (
                              <span
                                key={`end-${item.aya}-${idx}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 18,
                                  height: 18,
                                  margin: '0 2px',
                                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                  fontSize: 8,
                                  fontWeight: 700,
                                  color: config.accentColor,
                                  backgroundColor: accentLight,
                                  border: `1.5px solid ${config.accentColor}`,
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                  lineHeight: 1,
                                }}
                              >
                                {item.aya || 0}
                              </span>
                            )
                          ) : (
                            renderWord(item, item.index?.toString() ?? `word-${idx}`)
                          )
                        )}
                      </div>
                    ))}
                  </>
                );
              }

              // Pages normales: rendu standard ligne par ligne
              return page.lines?.map((line: { line: number; content: Array<{ text?: string; index?: number; type?: string; aya?: number; sura?: number; sura_name_ar?: string; sura_no?: number; verses_count?: number }> }) => {
              // Check if this line contains a surah_start
              const surahStart = line.content.find(item => item.type === 'surah_start');
              // Check if this line contains a basmala
              const basmala = line.content.find(item => item.type === 'basmala');
              const lineContent = line.content.filter(item => item.type !== 'surah_start' && item.type !== 'basmala');

              // Si la ligne contient un surah_start, l'ornement prend toute la ligne
              if (surahStart) {
                return (
                  <div
                    key={line.line}
                    style={{
                      flex: 1,
                      minHeight: 0,
                      maxHeight: `${100 / (page.total_lines || config.linesPerPage)}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                    }}
                  >
                    <SurahOrnament
                      isDark={isDark}
                      surahName={surahStart.sura_name_ar || ''}
                      surahNo={surahStart.sura_no || 0}
                      versesCount={surahStart.verses_count || 0}
                      fontFamily={config.fontFamily}
                    />
                  </div>
                );
              }

              // Si la ligne contient une basmala, l'afficher mot par mot pour le mode récitation
              if (basmala) {
                return (
                  <div
                    key={line.line}
                    style={{
                      flex: 1,
                      minHeight: 0,
                      maxHeight: `${100 / (page.total_lines || config.linesPerPage)}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      fontFamily: config.fontFamily,
                      fontSize: 'clamp(16px, 2.5vw, 24px)',
                      color: textColor,
                      gap: '8px',
                      direction: 'rtl',
                    }}
                  >
                    {BASMALA_WORDS.map((word, idx) => renderWord(word, `basmala-${line.line}-${idx}`))}
                  </div>
                );
              }

              // Ligne normale avec texte coranique
              const shouldCenter = lineContent.length <= 2;
              const justifyStyle = shouldCenter ? 'center' : 'space-between';

              return (
                <div
                  key={line.line}
                  style={{
                    fontFamily: config.fontFamily,
                    fontSize: 'clamp(16px, 2.5vw, 24px)',
                    lineHeight: lineHeight,
                    color: textColor,
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    justifyContent: justifyStyle,
                    alignItems: 'center',
                    flex: 1,
                    minHeight: 0,
                    maxHeight: `${100 / (page.total_lines || config.linesPerPage)}%`,
                    overflow: 'hidden',
                    paddingLeft: 4,
                    paddingRight: 4,
                    width: '100%',
                    gap: shouldCenter ? '8px' : '0',
                  }}
                >
                  {lineContent.map((item, idx) =>
                    item.type === 'verse_end' ? (
                      isThoumnMarker(item.sura, item.aya) ? (
                        // Ornement spécial pour les marqueurs de Thoumn
                        <span
                          key={`end-${item.aya}-${idx}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            width: 32,
                            height: 28,
                            margin: '0 2px',
                            flexShrink: 0,
                          }}
                        >
                          {/* Ornement étoile style Mushaf - adapté pour 3 chiffres */}
                          <svg width="32" height="28" viewBox="0 0 32 28" style={{ position: 'absolute', top: 0, left: 0 }}>
                            <defs>
                              <linearGradient id={`thoumnGrad-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={isDark ? '#2E8B57' : '#1E5631'} />
                                <stop offset="100%" stopColor={isDark ? '#1E5631' : '#0D3320'} />
                              </linearGradient>
                            </defs>
                            {/* Pointes de l'étoile */}
                            <path d="M16,0 L18,6 L16,10 L14,6 Z" fill={`url(#thoumnGrad-${idx})`} />
                            <path d="M16,28 L18,22 L16,18 L14,22 Z" fill={`url(#thoumnGrad-${idx})`} />
                            <path d="M0,14 L6,12 L10,14 L6,16 Z" fill={`url(#thoumnGrad-${idx})`} />
                            <path d="M32,14 L26,12 L22,14 L26,16 Z" fill={`url(#thoumnGrad-${idx})`} />
                            {/* Pointes diagonales */}
                            <path d="M4,4 L8,7 L7,8 L4,4" fill={`url(#thoumnGrad-${idx})`} />
                            <path d="M28,4 L24,7 L25,8 L28,4" fill={`url(#thoumnGrad-${idx})`} />
                            <path d="M4,24 L8,21 L7,20 L4,24" fill={`url(#thoumnGrad-${idx})`} />
                            <path d="M28,24 L24,21 L25,20 L28,24" fill={`url(#thoumnGrad-${idx})`} />
                            {/* Ellipse centrale */}
                            <ellipse cx="16" cy="14" rx="10" ry="8" fill={isDark ? '#1A1A1A' : '#FDFBF7'} stroke={`url(#thoumnGrad-${idx})`} strokeWidth="2" />
                          </svg>
                          {/* Numéro */}
                          <span style={{
                            position: 'relative',
                            zIndex: 1,
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: 9,
                            fontWeight: 800,
                            color: isDark ? '#2E8B57' : '#1E5631',
                            lineHeight: 1,
                          }}>
                            {item.aya || 0}
                          </span>
                        </span>
                      ) : (
                        // Numéro de verset standard
                        <span
                          key={`end-${item.aya}-${idx}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 20,
                            height: 20,
                            margin: '0 3px',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: 9,
                            fontWeight: 700,
                            color: config.accentColor,
                            backgroundColor: accentLight,
                            border: `1.5px solid ${config.accentColor}`,
                            borderRadius: '50%',
                            flexShrink: 0,
                            lineHeight: 1,
                            paddingTop: 1,
                          }}
                        >
                          {item.aya || 0}
                        </span>
                      )
                    ) : (
                      renderWord(item, item.index?.toString() ?? `word-${idx}`)
                    )
                  )}
                </div>
              );
            });
            })()}
          </div>
        </div>

        </div>

        {/* Page Number - En bas, à l'intérieur du cadre mais séparé */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: 6,
            paddingBottom: 4,
            fontSize: 11,
            fontWeight: 500,
            color: isDark ? '#A0A0A0' : '#666',
            backgroundColor: bgColor,
            marginTop: -1,
          }}
        >
          {pageNumber}
        </div>
      </div>
    </div>
  );
};

// Types pour l'état de la session
type SessionStatus = 'idle' | 'active' | 'paused';

// Constantes pour le layout responsive
const MAX_PAGE_WIDTH = 700; // Largeur max d'une page pour éviter les lignes trop étalées

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [menuVisible, setMenuVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [currentRiwaya, setCurrentRiwaya] = useState<RiwayaType>(DEFAULT_RIWAYA);
  const [hiddenMode, setHiddenMode] = useState(false);

  // État de la session de récitation
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [currentSession, setCurrentSession] = useState<RecitationSession | null>(null);
  const [revealedWordsPerPage, setRevealedWordsPerPage] = useState<Map<number, Set<number>>>(new Map());
  const [lastRevealedWord, setLastRevealedWord] = useState<number | null>(null);
  const [lastRevealedPage, setLastRevealedPage] = useState<number | null>(null);

  // Modals
  const [historyVisible, setHistoryVisible] = useState(false);
  const [stopConfirmVisible, setStopConfirmVisible] = useState(false);
  const [savedSessions, setSavedSessions] = useState<RecitationSession[]>([]);

  const swiperRef = useRef<SwiperType | null>(null);
  const menuListRef = useRef<HTMLDivElement | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Config dynamique basée sur la riwaya sélectionnée
  const activeConfig = getRiwayaConfig(currentRiwaya);

  // Dériver isReciting de sessionStatus pour les hooks useEffect
  const isReciting = sessionStatus === 'active';

  // Inject CSS animations on mount
  useEffect(() => {
    injectStyles();
  }, []);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1A1A1A' : '#FDFBF7';
  const headerBg = isDark ? '#252525' : '#FFFFFF';
  const borderColor = isDark ? '#333' : '#E8E4DD';
  const textColor = isDark ? '#F0EDE8' : '#1A1614';

  // Get current surah number
  const pageData = PAGES[currentPage] as Page;
  const currentSurahNo = pageData?.sura?.no || 1;

  // Navigation vers une page (instant, sans animation)
  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < PAGES.length && swiperRef.current) {
      // Speed=0 pour navigation instantanée sans simuler le scroll
      swiperRef.current.slideTo(pageIndex, 0);
      setCurrentPage(pageIndex);
      setMenuVisible(false);
    }
  }, []);

  // Navigation vers une sourate
  const goToSurah = useCallback(
    (suraNo: number) => {
      for (let i = 0; i < PAGES.length; i++) {
        const page = PAGES[i] as Page;
        if (page.sura.no === suraNo) {
          goToPage(i);
          return;
        }
        if (page.suras?.some((s: Surah) => s.no === suraNo)) {
          goToPage(i);
          return;
        }
      }
    },
    [goToPage]
  );

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Toggle hidden mode
  const toggleHiddenMode = useCallback(() => {
    setHiddenMode((prev) => !prev);
  }, []);

  // Obtenir les infos de position Quran
  const getPositionInfo = useCallback(() => {
    const pos = getQuranPosition(currentPage + 1, currentRiwaya);
    return {
      surahName: pageData?.sura?.name_ar || '',
      surahNo: pageData?.sura?.no || 1,
      juz: pos.juz,
      hizb: pos.hizb,
      thoumn: pos.thoumn,
    };
  }, [currentPage, currentRiwaya, pageData]);

  // Démarrer une nouvelle session
  const startNewSession = useCallback(async () => {
    const pos = getPositionInfo();

    // Créer nouvelle session dans IndexedDB
    const session = await createSession(
      currentRiwaya,
      currentPage,
      pos.surahName,
      pos.surahNo,
      pos.juz,
      pos.hizb,
      pos.thoumn
    );

    // Initialiser l'état
    setCurrentSession(session);
    setRevealedWordsPerPage(new Map());
    setLastRevealedWord(null);
    setLastRevealedPage(null);
    setSessionStatus('active');
  }, [currentRiwaya, currentPage, getPositionInfo]);

  // Mettre en pause la session (sauvegarde et garde l'affichage)
  const pauseCurrentSession = useCallback(async () => {
    if (!currentSession) return;

    // Mettre à jour la session avec les données actuelles
    currentSession.revealedWordsPerPage = mapToStorable(revealedWordsPerPage);
    currentSession.lastRevealedPage = lastRevealedPage;
    currentSession.lastRevealedWord = lastRevealedWord;
    currentSession.currentPage = currentPage;

    // Sauvegarder comme pausée
    await pauseSession(currentSession);
    setSessionStatus('paused');
  }, [currentSession, revealedWordsPerPage, lastRevealedPage, lastRevealedWord, currentPage]);

  // Reprendre une session (depuis pause ou historique)
  const resumeSession = useCallback(async (session?: RecitationSession) => {
    const sessionToResume = session || currentSession;
    if (!sessionToResume) return;

    // Charger les données de la session
    const loadedWords = storableToMap(sessionToResume.revealedWordsPerPage);
    setRevealedWordsPerPage(loadedWords);
    setLastRevealedPage(sessionToResume.lastRevealedPage);
    setLastRevealedWord(sessionToResume.lastRevealedWord);
    setCurrentSession({ ...sessionToResume, status: 'active' });
    setSessionStatus('active');

    // Naviguer vers la page de la session
    if (swiperRef.current && sessionToResume.currentPage !== currentPage) {
      swiperRef.current.slideTo(sessionToResume.currentPage, 300);
    }

    // Mettre à jour en base
    sessionToResume.status = 'active';
    await updateSession(sessionToResume);

    // Fermer le modal historique
    setHistoryVisible(false);
  }, [currentSession, currentPage]);

  // Arrêter et abandonner la session (sans sauvegarder)
  const stopSession = useCallback(async () => {
    if (currentSession) {
      await deleteSession(currentSession.id);
    }
    setCurrentSession(null);
    setRevealedWordsPerPage(new Map());
    setLastRevealedWord(null);
    setLastRevealedPage(null);
    setSessionStatus('idle');
    setStopConfirmVisible(false);
  }, [currentSession]);

  // Sauvegarder la session et revenir à l'état repos
  const saveAndStopSession = useCallback(async () => {
    if (currentSession) {
      // Mettre à jour la session avec les données actuelles
      currentSession.revealedWordsPerPage = mapToStorable(revealedWordsPerPage);
      currentSession.lastRevealedPage = lastRevealedPage;
      currentSession.lastRevealedWord = lastRevealedWord;
      currentSession.currentPage = currentPage;

      // Sauvegarder comme pausée
      await pauseSession(currentSession);
    }
    // Réinitialiser l'UI
    setCurrentSession(null);
    setRevealedWordsPerPage(new Map());
    setLastRevealedWord(null);
    setLastRevealedPage(null);
    setSessionStatus('idle');
    setStopConfirmVisible(false);
  }, [currentSession, revealedWordsPerPage, lastRevealedPage, lastRevealedWord, currentPage]);

  // Charger l'historique des sessions
  const loadHistory = useCallback(async () => {
    const sessions = await getAllSessions(currentRiwaya);
    setSavedSessions(sessions.filter(s => s.status === 'paused'));
    setHistoryVisible(true);
  }, [currentRiwaya]);

  // Supprimer une session de l'historique
  const deleteSessionFromHistory = useCallback(async (sessionId: string) => {
    await deleteSession(sessionId);
    setSavedSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  // Révéler un mot (simulation STT - sera appelé au clic)
  const revealWord = useCallback((wordIndex: number) => {
    setRevealedWordsPerPage((prev) => {
      const newMap = new Map(prev);
      const currentSet = new Set(prev.get(currentPage) || []);
      currentSet.add(wordIndex);
      newMap.set(currentPage, currentSet);
      return newMap;
    });
    setLastRevealedWord(wordIndex);
    setLastRevealedPage(currentPage);
  }, [currentPage]);

  // Vérifier si une page contient une Basmala
  const pageHasBasmala = useCallback((pageIndex: number): boolean => {
    const page = PAGES[pageIndex] as Page;
    if (!page?.lines) return false;
    return page.lines.some((line: { content: Array<{ type?: string }> }) =>
      line.content.some(item => item.type === 'basmala')
    );
  }, []);

  // Révéler le prochain mot avec aide (vert)
  // Ordre: Basmala (-4, -3, -2, -1) puis versets (0, 1, 2, ...)
  const revealNextWithHelp = useCallback(() => {
    // Si on a un dernier mot révélé sur une autre page, y naviguer d'abord
    if (lastRevealedPage !== null && lastRevealedPage !== currentPage) {
      if (swiperRef.current) {
        swiperRef.current.slideTo(lastRevealedPage, 300);
      }
      return;
    }

    const pageRevealedWords = revealedWordsPerPage.get(currentPage) || new Set();
    const currentPageData = PAGES[currentPage] as Page;
    const totalWords = currentPageData?.total_words || 0;
    const hasBasmala = pageHasBasmala(currentPage);

    // Construire la séquence d'indices à révéler
    // Basmala: -4, -3, -2, -1 puis versets: 0, 1, 2, ...
    const allIndices: number[] = [];
    if (hasBasmala) {
      allIndices.push(-4, -3, -2, -1);
    }
    for (let i = 0; i < totalWords; i++) {
      allIndices.push(i);
    }

    // Trouver le prochain mot non révélé
    let nextIndex: number | null = null;

    if (lastRevealedWord !== null && lastRevealedPage === currentPage) {
      // Continuer après le dernier mot révélé
      const lastIdx = allIndices.indexOf(lastRevealedWord);
      if (lastIdx !== -1 && lastIdx + 1 < allIndices.length) {
        const candidate = allIndices[lastIdx + 1];
        if (!pageRevealedWords.has(candidate)) {
          nextIndex = candidate;
        }
      }
    }

    // Si pas trouvé, chercher le premier mot non révélé
    if (nextIndex === null) {
      for (const idx of allIndices) {
        if (!pageRevealedWords.has(idx)) {
          nextIndex = idx;
          break;
        }
      }
    }

    // Révéler le mot trouvé
    if (nextIndex !== null) {
      setRevealedWordsPerPage((prev) => {
        const newMap = new Map(prev);
        const currentSet = new Set(prev.get(currentPage) || []);
        currentSet.add(nextIndex as number);
        newMap.set(currentPage, currentSet);
        return newMap;
      });
      setLastRevealedWord(nextIndex);
      setLastRevealedPage(currentPage);
    }
  }, [revealedWordsPerPage, currentPage, lastRevealedWord, lastRevealedPage, pageHasBasmala]);

  // Auto-swipe quand tous les mots de la page sont révélés (incluant Basmala)
  useEffect(() => {
    if (sessionStatus !== 'active') return;

    const totalVerseWords = pageData?.total_words || 0;
    if (totalVerseWords === 0) return;

    const hasBasmala = pageHasBasmala(currentPage);
    const totalExpectedWords = totalVerseWords + (hasBasmala ? 4 : 0);
    const currentRevealedWords = revealedWordsPerPage.get(currentPage) || new Set();

    // Vérifier si tous les mots sont révélés (versets + Basmala si présente)
    if (currentRevealedWords.size >= totalExpectedWords) {
      // Attendre 1 seconde avant le swipe automatique
      const timer = setTimeout(() => {
        if (currentPage < PAGES.length - 1 && swiperRef.current) {
          // Réinitialiser le dernier mot ET la dernière page pour la nouvelle page
          // Cela évite que le bouton Help ne retourne à l'ancienne page
          setLastRevealedWord(null);
          setLastRevealedPage(null);
          swiperRef.current.slideNext();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [sessionStatus, revealedWordsPerPage, currentPage, pageData?.total_words, pageHasBasmala]);

  // Auto-save toutes les 5 secondes quand session active
  useEffect(() => {
    if (sessionStatus !== 'active' || !currentSession) {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      return;
    }

    autoSaveTimerRef.current = setInterval(async () => {
      if (currentSession && sessionStatus === 'active') {
        currentSession.revealedWordsPerPage = mapToStorable(revealedWordsPerPage);
        currentSession.lastRevealedPage = lastRevealedPage;
        currentSession.lastRevealedWord = lastRevealedWord;
        currentSession.currentPage = currentPage;
        await updateSession(currentSession);
      }
    }, 5000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [sessionStatus, currentSession, revealedWordsPerPage, lastRevealedPage, lastRevealedWord, currentPage]);

  // Sauvegarder la progression dans IndexedDB (avec debounce)
  useEffect(() => {
    const currentRevealedWords = revealedWordsPerPage.get(currentPage) || new Set();
    if (!isReciting || currentRevealedWords.size === 0) return;

    const timer = setTimeout(() => {
      const pageNumber = currentPage + 1;
      const totalWords = pageData?.total_words || 0;

      // Convertir le Set en tableau pour le stockage
      const revealedArray = Array.from(currentRevealedWords);

      if (currentRevealedWords.size >= totalWords) {
        // Page complète - marquer comme terminée
        markPageCompleted(currentRiwaya, pageNumber, revealedArray, [], [])
          .catch(console.error);
      } else {
        // Sauvegarder la progression partielle
        savePageProgress(currentRiwaya, pageNumber, revealedArray, [], [])
          .catch(console.error);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [isReciting, revealedWordsPerPage, currentPage, currentRiwaya, pageData?.total_words]);

  // Réinitialiser le dernier mot révélé lors du changement de page en mode récitation
  useEffect(() => {
    if (!isReciting) return;
    // Ne pas charger la progression sauvegardée - chaque session commence fraîche
    // Juste réinitialiser le dernier mot révélé lors du changement de page
    setLastRevealedWord(null);
  }, [isReciting, currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (menuVisible) return;

      if (e.key === 'ArrowRight') {
        if (currentPage < PAGES.length - 1 && swiperRef.current) {
          swiperRef.current.slideNext();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentPage > 0 && swiperRef.current) {
          swiperRef.current.slidePrev();
        }
      } else if (e.key === 'h' || e.key === 'H') {
        toggleHiddenMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, menuVisible, toggleHiddenMode]);

  // Scroll to current surah when menu opens
  useEffect(() => {
    if (menuVisible && menuListRef.current) {
      const surahElement = menuListRef.current.querySelector(`[data-surah="${currentSurahNo}"]`);
      if (surahElement) {
        surahElement.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    }
  }, [menuVisible, currentSurahNo]);

  return (
    <div
      style={{
        height: '100dvh', // Dynamic viewport height - s'adapte à la barre d'adresse mobile
        minHeight: '-webkit-fill-available', // Fallback pour iOS Safari
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: bgColor,
        overflow: 'hidden', // Empêche tout débordement
      }}
    >
      {/* Header - RTL: first element appears on RIGHT, last on LEFT */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: headerBg,
          borderBottom: `1px solid ${borderColor}`,
          flexShrink: 0,
        }}
      >
        {/* In RTL: Menu button on RIGHT (first in JSX) */}
        <button
          className="btn-modern btn-icon"
          onClick={() => setMenuVisible(true)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: 'none',
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: textColor,
          }}
        >
          <MenuIcon size={22} color={textColor} />
        </button>

        {/* Center: Title (Arabic surah name) */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{
            fontSize: 18,
            color: textColor,
            fontWeight: 500,
            fontFamily: activeConfig.fontFamily,
          }}>
            {pageData?.sura?.name_ar || 'الفَاتِحَة'}
          </div>
          <div style={{ fontSize: 10, color: isDark ? '#A0A0A0' : '#666', direction: 'rtl' }}>
            {(() => {
              const pos = getQuranPosition(currentPage + 1, currentRiwaya);
              return `الجزء ${pos.juz} | الحزب ${pos.hizb} | الثمن ${pos.thoumn}`;
            })()}
          </div>
        </div>

        {/* In RTL: Settings button on LEFT (last in JSX) */}
        <button
          className="btn-modern btn-icon"
          onClick={() => setSettingsVisible(true)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: 'none',
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: textColor,
          }}
        >
          <SettingsIcon size={20} color={textColor} />
        </button>
      </div>

      {/* Swiper - Page unique avec largeur max pour éviter les lignes trop étalées */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: isDark ? '#1A1A1A' : '#FDFBF7',
      }}>
        <Swiper
          modules={[Virtual]}
          virtual
          spaceBetween={0}
          slidesPerView={1}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setCurrentPage(swiper.activeIndex)}
          resistance={true}
          resistanceRatio={0}
          style={{
            height: '100%',
            maxWidth: MAX_PAGE_WIDTH,
            width: '100%',
          }}
        >
          {(PAGES as Page[]).map((page, index) => {
            // Déterminer si c'est la première page de la sourate
            const prevPage = index > 0 ? (PAGES as Page[])[index - 1] : null;
            const isFirstPageOfSurah = !prevPage || prevPage.sura.no !== page.sura.no;
            // Mots révélés pour cette page spécifique
            const pageRevealedWords = revealedWordsPerPage.get(index) || new Set<number>();
            // Le dernier mot révélé n'est visible que sur la page courante
            const pageLastRevealed = index === currentPage ? lastRevealedWord : null;
            // Mode récitation actif = session active OU pausée (pour garder l'affichage)
            const isInRecitationMode = sessionStatus === 'active' || sessionStatus === 'paused';
            return (
              <SwiperSlide key={index} virtualIndex={index}>
                <QuranPageWeb
                  page={page}
                  pageNumber={index + 1}
                  isDark={isDark}
                  isFirstPageOfSurah={isFirstPageOfSurah}
                  config={activeConfig}
                  isReciting={isInRecitationMode}
                  revealedWords={pageRevealedWords}
                  lastRevealedWord={pageLastRevealed}
                  onWordClick={sessionStatus === 'active' ? revealWord : undefined}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Bottom Bar - Boutons selon l'état de la session */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px 16px',
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          borderTop: `1px solid ${borderColor}`,
          height: 70,
          minHeight: 70,
          flexShrink: 0,
          gap: 16,
        }}
      >
        {/* === ÉTAT REPOS (idle) === */}
        {sessionStatus === 'idle' && (
          <>
            {/* Bouton New - Nouvelle session */}
            <button
              data-testid="new-session-button"
              className="btn-modern btn-rec"
              onClick={startNewSession}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                background: `linear-gradient(135deg, ${activeConfig.accentColor} 0%, ${activeConfig.accentColorDark} 100%)`,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 15px ${hexToRgba(activeConfig.accentColor, 0.4)}`,
              }}
              title="جلسة جديدة"
            >
              <MicIcon size={26} color="#FFFFFF" />
            </button>

            {/* Bouton History */}
            <button
              data-testid="history-button"
              className="btn-modern"
              onClick={loadHistory}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                border: `1.5px solid ${isDark ? '#555' : '#DDD'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="سجل التلاوات"
            >
              <HistoryIcon size={22} color={isDark ? '#AAA' : '#666'} />
            </button>
          </>
        )}

        {/* === ÉTAT SESSION ACTIVE === */}
        {sessionStatus === 'active' && (
          <>
            {/* Bouton Help - révéler le prochain mot */}
            <button
              data-testid="help-button"
              className="btn-modern"
              onClick={revealNextWithHelp}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: `linear-gradient(135deg, ${activeConfig.accentColor} 0%, ${activeConfig.accentColorDark} 100%)`,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${hexToRgba(activeConfig.accentColor, 0.4)}`,
              }}
              title="مساعدة"
            >
              <HelpIcon size={24} color="#FFFFFF" />
            </button>

            {/* Bouton Pause - suspendre et sauvegarder */}
            <button
              data-testid="pause-button"
              className="btn-modern"
              onClick={pauseCurrentSession}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
              }}
              title="إيقاف مؤقت"
            >
              <PauseIcon size={24} color="#FFFFFF" />
            </button>

            {/* Bouton Stop - abandonner */}
            <button
              data-testid="stop-button"
              className="btn-modern"
              onClick={() => setStopConfirmVisible(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                border: `1.5px solid ${isDark ? '#555' : '#DDD'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="إنهاء الجلسة"
            >
              <StopIcon size={18} color={isDark ? '#999' : '#888'} />
            </button>
          </>
        )}

        {/* === ÉTAT SESSION EN PAUSE === */}
        {sessionStatus === 'paused' && (
          <>
            {/* Bouton Resume - reprendre la session */}
            <button
              data-testid="resume-button"
              className="btn-modern btn-rec"
              onClick={() => resumeSession()}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                background: `linear-gradient(135deg, ${activeConfig.accentColor} 0%, ${activeConfig.accentColorDark} 100%)`,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 15px ${hexToRgba(activeConfig.accentColor, 0.4)}`,
              }}
              title="استئناف"
            >
              <MicIcon size={26} color="#FFFFFF" />
            </button>

            {/* Bouton Stop - abandonner */}
            <button
              data-testid="stop-button"
              className="btn-modern"
              onClick={() => setStopConfirmVisible(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                border: `1.5px solid ${isDark ? '#555' : '#DDD'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="إنهاء الجلسة"
            >
              <StopIcon size={18} color={isDark ? '#999' : '#888'} />
            </button>

            {/* Bouton History */}
            <button
              data-testid="history-button"
              className="btn-modern"
              onClick={loadHistory}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                border: `1.5px solid ${isDark ? '#555' : '#DDD'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="سجل التلاوات"
            >
              <HistoryIcon size={22} color={isDark ? '#AAA' : '#666'} />
            </button>
          </>
        )}
      </div>

      {/* Menu Modal - Opens from RIGHT with sliding animation */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: menuVisible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
          display: 'flex',
          justifyContent: 'flex-start', // In RTL: flex-start = RIGHT side
          zIndex: 1000,
          pointerEvents: menuVisible ? 'auto' : 'none',
          transition: 'background-color 0.3s ease',
        }}
        onClick={() => setMenuVisible(false)}
      >
        <div
          style={{
            width: 300,
            maxWidth: '85vw',
            height: '100%',
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            boxShadow: menuVisible ? '4px 0 20px rgba(0,0,0,0.2)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            transform: menuVisible ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: `1px solid ${borderColor}`,
                background: isDark
                  ? `linear-gradient(135deg, ${hexToRgba(activeConfig.accentColor, 0.1)} 0%, transparent 100%)`
                  : `linear-gradient(135deg, ${hexToRgba(activeConfig.accentColor, 0.08)} 0%, transparent 100%)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BookOpenIcon size={22} color={activeConfig.accentColor} />
                <span style={{ fontSize: 18, color: activeConfig.accentColor, fontWeight: 600 }}>السور</span>
              </div>
              <button
                className="btn-modern btn-icon"
                onClick={() => setMenuVisible(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: 'none',
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <XIcon size={18} color={textColor} />
              </button>
            </div>
            <div ref={menuListRef} style={{ flex: 1, overflow: 'auto' }}>
              {(SURAHS as Surah[]).map((surah) => {
                const isCurrentSurah = surah.no === currentSurahNo;
                return (
                  <div
                    key={surah.no}
                    data-surah={surah.no}
                    onClick={() => goToSurah(surah.no)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 12,
                      borderBottom: `1px solid ${isDark ? '#333' : '#EEE'}`,
                      cursor: 'pointer',
                      backgroundColor: isCurrentSurah
                        ? (isDark ? activeConfig.accentColorLightDark : activeConfig.accentColorLight)
                        : 'transparent',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: isCurrentSurah
                          ? activeConfig.accentColor
                          : (isDark ? activeConfig.accentColorLightDark : activeConfig.accentColorLight),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        color: isCurrentSurah ? '#FFFFFF' : activeConfig.accentColor,
                      }}
                    >
                      {surah.no}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 16,
                        color: isCurrentSurah ? activeConfig.accentColor : textColor,
                        fontWeight: isCurrentSurah ? 600 : 400,
                      }}>
                        {surah.name_ar}
                      </div>
                      <div style={{ fontSize: 11, color: isDark ? '#A0A0A0' : '#666' }}>
                        {surah.name_en} • {surah.type} • {surah.verses} آيات
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      </div>

      {/* Settings Modal */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: settingsVisible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001,
          pointerEvents: settingsVisible ? 'auto' : 'none',
          transition: 'background-color 0.3s ease',
        }}
        onClick={() => setSettingsVisible(false)}
      >
        <div
          style={{
            width: 320,
            maxWidth: '90vw',
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderRadius: 16,
            boxShadow: settingsVisible ? '0 10px 40px rgba(0,0,0,0.3)' : 'none',
            transform: settingsVisible ? 'scale(1)' : 'scale(0.9)',
            opacity: settingsVisible ? 1 : 0,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Settings Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: `1px solid ${borderColor}`,
              background: isDark
                ? `linear-gradient(135deg, ${hexToRgba(activeConfig.accentColor, 0.1)} 0%, transparent 100%)`
                : `linear-gradient(135deg, ${hexToRgba(activeConfig.accentColor, 0.08)} 0%, transparent 100%)`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SettingsIcon size={22} color={activeConfig.accentColor} />
              <span style={{ fontSize: 18, color: activeConfig.accentColor, fontWeight: 600 }}>الإعدادات</span>
            </div>
            <button
              className="btn-modern btn-icon"
              onClick={() => setSettingsVisible(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: 'none',
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <XIcon size={18} color={textColor} />
            </button>
          </div>

          {/* Settings Content */}
          <div style={{ padding: '16px 20px' }}>
            {/* Theme Toggle */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 14,
                color: isDark ? '#A0A0A0' : '#666',
                marginBottom: 10,
                fontWeight: 500,
              }}>
                المظهر
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-modern"
                  onClick={() => setTheme('light')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: theme === 'light' ? `2px solid ${activeConfig.accentColor}` : `1px solid ${borderColor}`,
                    background: theme === 'light'
                      ? (isDark ? activeConfig.accentColorLightDark : activeConfig.accentColorLight)
                      : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <SunIcon size={18} color={theme === 'light' ? activeConfig.accentColor : (isDark ? '#A0A0A0' : '#666')} />
                  <span style={{
                    fontSize: 14,
                    color: theme === 'light' ? activeConfig.accentColor : textColor,
                    fontWeight: theme === 'light' ? 600 : 400,
                  }}>
                    فاتح
                  </span>
                </button>
                <button
                  className="btn-modern"
                  onClick={() => setTheme('dark')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: theme === 'dark' ? `2px solid ${activeConfig.accentColor}` : `1px solid ${borderColor}`,
                    background: theme === 'dark'
                      ? (isDark ? activeConfig.accentColorLightDark : activeConfig.accentColorLight)
                      : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <MoonIcon size={18} color={theme === 'dark' ? activeConfig.accentColor : (isDark ? '#A0A0A0' : '#666')} />
                  <span style={{
                    fontSize: 14,
                    color: theme === 'dark' ? activeConfig.accentColor : textColor,
                    fontWeight: theme === 'dark' ? 600 : 400,
                  }}>
                    داكن
                  </span>
                </button>
              </div>
            </div>

            {/* Riwaya Selector */}
            <div>
              <div style={{
                fontSize: 14,
                color: isDark ? '#A0A0A0' : '#666',
                marginBottom: 10,
                fontWeight: 500,
              }}>
                الرواية
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-modern"
                  onClick={() => setCurrentRiwaya('warsh')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: currentRiwaya === 'warsh' ? `2px solid ${activeConfig.accentColor}` : `1px solid ${borderColor}`,
                    background: currentRiwaya === 'warsh'
                      ? (isDark ? activeConfig.accentColorLightDark : activeConfig.accentColorLight)
                      : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{
                    fontSize: 16,
                    color: currentRiwaya === 'warsh' ? activeConfig.accentColor : textColor,
                    fontWeight: currentRiwaya === 'warsh' ? 600 : 400,
                    fontFamily: 'Traditional Arabic, serif',
                  }}>
                    ورش
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: isDark ? '#A0A0A0' : '#888',
                  }}>
                    Warsh
                  </span>
                </button>
                <button
                  className="btn-modern"
                  onClick={() => setCurrentRiwaya('hafs')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: currentRiwaya === 'hafs' ? `2px solid ${activeConfig.accentColor}` : `1px solid ${borderColor}`,
                    background: currentRiwaya === 'hafs'
                      ? (isDark ? activeConfig.accentColorLightDark : activeConfig.accentColorLight)
                      : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    opacity: 0.5, // Disabled look until Hafs data is ready
                  }}
                  disabled // Hafs data not yet available
                  title="قريباً - Hafs coming soon"
                >
                  <span style={{
                    fontSize: 16,
                    color: currentRiwaya === 'hafs' ? activeConfig.accentColor : textColor,
                    fontWeight: currentRiwaya === 'hafs' ? 600 : 400,
                    fontFamily: 'Traditional Arabic, serif',
                  }}>
                    حفص
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: isDark ? '#A0A0A0' : '#888',
                  }}>
                    Hafs (قريباً)
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Settings Footer */}
          <div style={{
            padding: '12px 20px',
            borderTop: `1px solid ${borderColor}`,
            textAlign: 'center',
          }}>
            <span style={{
              fontSize: 11,
              color: isDark ? '#666' : '#999',
            }}>
              {activeConfig.name} • {activeConfig.totalPages} صفحة
            </span>
          </div>
        </div>
      </div>

      {/* Modal Confirmation Stop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: stopConfirmVisible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1002,
          pointerEvents: stopConfirmVisible ? 'auto' : 'none',
          transition: 'background-color 0.3s ease',
        }}
        onClick={() => setStopConfirmVisible(false)}
      >
        <div
          style={{
            width: 300,
            maxWidth: '90vw',
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderRadius: 16,
            boxShadow: stopConfirmVisible ? '0 10px 40px rgba(0,0,0,0.3)' : 'none',
            transform: stopConfirmVisible ? 'scale(1)' : 'scale(0.9)',
            opacity: stopConfirmVisible ? 1 : 0,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
            overflow: 'hidden',
            direction: 'rtl',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '24px 20px', textAlign: 'center' }}>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: textColor,
              marginBottom: 16,
              fontFamily: activeConfig.fontFamily,
            }}>
              إنهاء جلسة التلاوة؟
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Option 1: Sauvegarder et arrêter */}
              <button
                className="btn-modern"
                onClick={saveAndStopSession}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: activeConfig.accentColor,
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                حفظ للاستئناف لاحقاً
              </button>
              {/* Option 2: Arrêter sans sauvegarder */}
              <button
                className="btn-modern"
                onClick={stopSession}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#DC3545',
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                إنهاء بدون حفظ
              </button>
              {/* Option 3: Annuler */}
              <button
                className="btn-modern"
                onClick={() => setStopConfirmVisible(false)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: `1px solid ${borderColor}`,
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: textColor,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Historique des sessions */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: historyVisible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1002,
          pointerEvents: historyVisible ? 'auto' : 'none',
          transition: 'background-color 0.3s ease',
        }}
        onClick={() => setHistoryVisible(false)}
      >
        <div
          style={{
            width: 350,
            maxWidth: '95vw',
            maxHeight: '80vh',
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderRadius: 16,
            boxShadow: historyVisible ? '0 10px 40px rgba(0,0,0,0.3)' : 'none',
            transform: historyVisible ? 'scale(1)' : 'scale(0.9)',
            opacity: historyVisible ? 1 : 0,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            direction: 'rtl',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${borderColor}`,
            background: isDark
              ? `linear-gradient(135deg, ${hexToRgba(activeConfig.accentColor, 0.1)} 0%, transparent 100%)`
              : `linear-gradient(135deg, ${hexToRgba(activeConfig.accentColor, 0.08)} 0%, transparent 100%)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <HistoryIcon size={22} color={activeConfig.accentColor} />
              <span style={{ fontSize: 18, color: activeConfig.accentColor, fontWeight: 600 }}>سجل التلاوات</span>
            </div>
            <button
              className="btn-modern btn-icon"
              onClick={() => setHistoryVisible(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: 'none',
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <XIcon size={18} color={textColor} />
            </button>
          </div>

          {/* Liste des sessions */}
          <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
            {savedSessions.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: isDark ? '#666' : '#999',
              }}>
                لا توجد جلسات محفوظة
              </div>
            ) : (
              savedSessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    padding: '12px 16px',
                    marginBottom: 8,
                    borderRadius: 12,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isDark ? '#333' : '#EEE'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <BookOpenIcon size={18} color={activeConfig.accentColor} />
                    <span style={{
                      marginRight: 8,
                      fontSize: 16,
                      fontWeight: 600,
                      color: textColor,
                      fontFamily: activeConfig.fontFamily,
                    }}>
                      الصفحة {session.currentPage + 1} - {session.surahName}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: isDark ? '#A0A0A0' : '#666',
                    marginBottom: 8,
                  }}>
                    الجزء {session.juz} | الحزب {session.hizb} | الثمن {session.thoumn}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: isDark ? '#666' : '#999',
                    marginBottom: 12,
                  }}>
                    {session.totalWordsRevealed} كلمة • {new Date(session.updatedAt).toLocaleDateString('ar-EG')}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn-modern"
                      onClick={() => resumeSession(session)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: `linear-gradient(135deg, ${activeConfig.accentColor} 0%, ${activeConfig.accentColorDark} 100%)`,
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      استئناف
                    </button>
                    <button
                      className="btn-modern"
                      onClick={() => deleteSessionFromHistory(session.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: `1px solid ${isDark ? '#555' : '#DDD'}`,
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrashIcon size={16} color={isDark ? '#999' : '#666'} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
