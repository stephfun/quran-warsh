/**
 * Quran Warsh App - Web Version
 * Navigation par Swiper.js
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';

import { PAGES, SURAHS } from './src/data/quranData';
import { Page, Surah, ThemeMode } from './src/types';

// ============================================
// HELPER: Calculate Hizb and Thoumn from page
// ============================================

// Structure du Coran :
// - 30 Juz (جزء)
// - 60 Hizb (حزب) - 2 par Juz
// - 240 Rub' (ربع) - 4 par Hizb
// - Thoumn (ثمن) = 1/8 de Hizb = 1/2 Rub'

interface QuranPosition {
  juz: number;        // 1-30
  hizb: number;       // 1-60
  thoumn: number;     // 1-8 (position dans le hizb actuel)
}

// Table des débuts de Hizb (page approximative pour chaque Hizb 1-60)
// Source: Mushaf Warsh KFGQPC standard
const HIZB_START_PAGES: number[] = [
  1,    // Hizb 1
  11,   // Hizb 2
  22,   // Hizb 3
  32,   // Hizb 4
  42,   // Hizb 5
  51,   // Hizb 6
  62,   // Hizb 7
  72,   // Hizb 8
  82,   // Hizb 9
  92,   // Hizb 10
  102,  // Hizb 11
  112,  // Hizb 12
  122,  // Hizb 13
  132,  // Hizb 14
  142,  // Hizb 15
  151,  // Hizb 16
  162,  // Hizb 17
  173,  // Hizb 18
  182,  // Hizb 19
  192,  // Hizb 20
  201,  // Hizb 21
  212,  // Hizb 22
  222,  // Hizb 23
  231,  // Hizb 24
  242,  // Hizb 25
  252,  // Hizb 26
  262,  // Hizb 27
  272,  // Hizb 28
  282,  // Hizb 29
  292,  // Hizb 30
  302,  // Hizb 31
  312,  // Hizb 32
  322,  // Hizb 33
  332,  // Hizb 34
  342,  // Hizb 35
  352,  // Hizb 36
  362,  // Hizb 37
  371,  // Hizb 38
  382,  // Hizb 39
  392,  // Hizb 40
  402,  // Hizb 41
  413,  // Hizb 42
  422,  // Hizb 43
  431,  // Hizb 44
  442,  // Hizb 45
  451,  // Hizb 46
  462,  // Hizb 47
  472,  // Hizb 48
  482,  // Hizb 49
  491,  // Hizb 50
  502,  // Hizb 51
  513,  // Hizb 52
  522,  // Hizb 53
  531,  // Hizb 54
  542,  // Hizb 55
  553,  // Hizb 56
  562,  // Hizb 57
  572,  // Hizb 58
  582,  // Hizb 59
  591,  // Hizb 60
];

function getQuranPosition(pageNumber: number): QuranPosition {
  // Trouver le Hizb actuel
  let hizb = 1;
  for (let i = HIZB_START_PAGES.length - 1; i >= 0; i--) {
    if (pageNumber >= HIZB_START_PAGES[i]) {
      hizb = i + 1;
      break;
    }
  }

  // Calculer le Juz (2 Hizb par Juz)
  const juz = Math.ceil(hizb / 2);

  // Calculer le Thoumn (1-8) dans le Hizb actuel
  const hizbStartPage = HIZB_START_PAGES[hizb - 1];
  const hizbEndPage = hizb < 60 ? HIZB_START_PAGES[hizb] - 1 : 604;
  const hizbPages = hizbEndPage - hizbStartPage + 1;
  const pageInHizb = pageNumber - hizbStartPage;
  const thoumn = Math.min(8, Math.floor((pageInHizb / hizbPages) * 8) + 1);

  return { juz, hizb, thoumn };
}

// Marqueurs de Thoumn (ثمن) pour Mushaf Warsh
// 434 marqueurs extraits des données KFGQPC Warsh (symbole ۞)
// Source: warshData_v10.json - données officielles KFGQPC
const THOUMN_MARKERS_WARSH = new Set([
  "2:15", "2:24", "2:32", "2:40", "2:52", "2:58", "2:65", "2:74", "2:83", "2:90",
  "2:99", "2:104", "2:112", "2:122", "2:131", "2:140", "2:146", "2:156", "2:164", "2:175",
  "2:183", "2:187", "2:194", "2:200", "2:210", "2:216", "2:225", "2:230", "2:232", "2:240",
  "2:245", "2:250", "2:256", "2:261", "2:265", "2:270", "2:278", "2:281", "3:4", "3:14",
  "3:22", "3:32", "3:41", "3:50", "3:62", "3:73", "3:79", "3:90", "3:102", "3:112",
  "3:120", "3:132", "3:143", "3:152", "3:159", "3:170", "3:180", "3:185", "3:195", "4:5",
  "4:10", "4:12", "4:18", "4:23", "4:28", "4:35", "4:44", "4:56", "4:63", "4:72",
  "4:77", "4:85", "4:90", "4:98", "4:103", "4:112", "4:122", "4:128", "4:138", "4:146",
  "4:155", "4:164", "4:172", "5:3", "5:6", "5:12", "5:18", "5:24", "5:33", "5:42",
  "5:46", "5:50", "5:59", "5:68", "5:74", "5:83", "5:91", "5:98", "5:107", "5:112",
  "6:13", "6:26", "6:36", "6:48", "6:59", "6:69", "6:80", "6:91", "6:95", "6:103",
  "6:111", "6:120", "6:127", "6:135", "6:140", "6:145", "6:151", "6:158", "7:3", "7:19",
  "7:29", "7:37", "7:45", "7:55", "7:67", "7:75", "7:86", "7:98", "7:115", "7:130",
  "7:141", "7:148", "7:155", "7:162", "7:170", "7:178", "7:187", "7:199", "8:4", "8:14",
  "8:21", "8:30", "8:40", "8:48", "8:60", "8:71", "9:4", "9:11", "9:18", "9:27",
  "9:33", "9:39", "9:45", "9:54", "9:60", "9:69", "9:75", "9:85", "9:93", "9:101",
  "9:111", "9:117", "9:123", "10:2", "10:10", "10:18", "10:25", "10:36", "10:48", "10:60",
  "10:70", "10:82", "10:92", "10:103", "11:5", "11:14", "11:23", "11:31", "11:40", "11:52",
  "11:60", "11:71", "11:82", "11:92", "11:104", "11:116", "12:9", "12:22", "12:32", "12:41",
  "12:52", "12:65", "12:76", "12:87", "12:100", "12:110", "13:4", "13:14", "13:20", "13:30",
  "13:35", "14:12", "14:21", "14:29", "14:40", "15:48", "15:77", "16:14", "16:29", "16:37",
  "16:50", "16:62", "16:70", "16:78", "16:89", "16:97", "16:110", "16:119", "17:10", "17:22",
  "17:35", "17:49", "17:60", "17:69", "17:84", "17:98", "18:16", "18:22", "18:29", "18:40",
  "18:48", "18:57", "18:73", "18:84", "18:97", "19:5", "19:20", "19:39", "19:58", "19:74",
  "20:34", "20:53", "20:70", "20:80", "20:94", "20:107", "20:123", "21:14", "21:29", "21:41",
  "21:50", "21:71", "21:85", "21:99", "22:10", "22:18", "22:27", "22:35", "22:46", "22:57",
  "22:69", "23:23", "23:38", "23:57", "23:75", "23:93", "23:115", "24:10", "24:20", "24:29",
  "24:34", "24:41", "24:50", "24:57", "24:60", "25:9", "25:20", "25:34", "25:44", "25:60",
  "26:23", "26:49", "26:81", "26:110", "26:145", "26:180", "26:209", "27:5", "27:16", "27:26",
  "27:41", "27:57", "27:67", "27:83", "28:10", "28:20", "28:28", "28:38", "28:50", "28:62",
  "28:75", "28:82", "29:6", "29:15", "29:24", "29:35", "29:45", "29:59", "30:7", "30:20",
  "30:28", "30:39", "30:52", "31:9", "31:20", "31:31", "32:10", "32:20", "33:8", "33:17",
  "33:24", "33:30", "33:36", "33:48", "33:52", "33:59", "34:9", "34:17", "34:23", "34:36",
  "34:45", "35:7", "35:14", "35:30", "35:40", "36:5", "36:26", "36:44", "36:58", "36:78",
  "37:21", "37:50", "37:82", "37:113", "37:144", "38:19", "38:29", "38:50", "38:82", "39:8",
  "39:19", "39:30", "39:39", "39:50", "39:63", "40:9", "40:20", "40:29", "40:40", "40:52",
  "40:65", "40:77", "41:7", "41:15", "41:23", "41:36", "41:45", "42:2", "42:10", "42:17",
  "42:24", "42:38", "42:47", "43:9", "43:22", "43:41", "43:62", "43:84", "44:23", "45:12",
  "45:23", "46:13", "46:19", "46:31", "47:10", "47:20", "47:33", "48:7", "48:17", "48:25",
  "49:8", "49:13", "50:8", "50:26", "51:30", "51:55", "52:21", "52:41", "53:25", "53:45",
  "54:9", "54:36", "55:39", "56:51", "56:77", "57:6", "57:14", "57:20", "58:7", "58:13",
  "59:1", "59:10", "60:6", "63:8", "64:6", "65:5", "66:7", "67:19", "68:18", "68:47",
  "69:17", "70:39", "71:14", "72:22", "73:17", "74:30", "76:18", "77:15", "79:40", "83:13",
  "84:15", "85:11", "88:16", "100:8",
]);

// Vérifier si un verset est un marqueur de Thoumn Warsh
function isThoumnMarker(sura: number, aya: number): boolean {
  return THOUMN_MARKERS_WARSH.has(`${sura}:${aya}`);
}

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

// ============================================
// CSS ANIMATIONS (injected once)
// ============================================
const injectStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('quran-app-styles')) {
    const style = document.createElement('style');
    style.id = 'quran-app-styles';
    style.textContent = `
      @keyframes pulse-green {
        0%, 100% { box-shadow: 0 0 0 0 rgba(18, 208, 132, 0.4); }
        50% { box-shadow: 0 0 0 12px rgba(18, 208, 132, 0); }
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
const SurahOrnament: React.FC<{ isDark: boolean; surahName: string; surahNo: number; versesCount: number }> = ({
  isDark,
  surahName,
  surahNo,
  versesCount,
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
            fontFamily: 'KFGQPC-Warsh, Traditional Arabic, serif',
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
const QuranPageWeb: React.FC<{ page: Page; pageNumber: number; isDark: boolean; isFirstPageOfSurah: boolean }> = ({
  page,
  pageNumber,
  isDark,
  isFirstPageOfSurah,
}) => {
  const bgColor = isDark ? '#1A1A1A' : '#FDFBF7';
  const textColor = isDark ? '#F0EDE8' : '#1A1614';
  const borderColor = isDark ? '#333' : '#E8E4DD';
  const accentLight = isDark ? '#1E3D2F' : '#E8FBF3';

  // Couleur du cadre ornemental (vert foncé style bois peint)
  const frameColor = isDark ? '#1E5631' : '#2D5A3D';
  const frameLightColor = isDark ? '#2E8B57' : '#3CB371';

  // Pages 1-2 ont un layout spécial (Al-Fatiha et début Al-Baqara)
  const isSpecialPage = pageNumber === 1 || pageNumber === 2;

  // Taille de police adaptative pour remplir la page
  // Pages 1-2: police grande (ornement + basmala + 6 lignes de texte)
  const fontSize = isSpecialPage
    ? 'clamp(22px, 5vw, 36px)'
    : getFontSizeForWords(page.total_words);

  // Line-height adaptative
  // Pages 1-2: espacement pour que tout rentre
  const lineHeight = isSpecialPage ? 1.8 : getLineHeightForWords(page.total_words);

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
                const LINES_COUNT = 6;
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
                        />
                      </div>
                    )}
                    {/* Basmala */}
                    {hasBasmala && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 4px',
                        fontFamily: 'KFGQPC-Warsh, Traditional Arabic, serif',
                        fontSize: fontSize,
                        color: textColor,
                      }}>
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                      </div>
                    )}
                    {/* 6 lignes de texte */}
                    {combinedLines.map((lineItems, lineIdx) => (
                      <div
                        key={lineIdx}
                        style={{
                          fontFamily: 'KFGQPC-Warsh, Traditional Arabic, serif',
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
                                  color: '#12D084',
                                  backgroundColor: accentLight,
                                  border: '1.5px solid #12D084',
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                  lineHeight: 1,
                                }}
                              >
                                {item.aya || 0}
                              </span>
                            )
                          ) : (
                            <span key={item.index ?? `word-${idx}`} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              {item.text}
                            </span>
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
                      maxHeight: `${100 / (page.total_lines || 15)}%`,
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
                    />
                  </div>
                );
              }

              // Si la ligne contient une basmala, l'afficher avec style Othmani
              if (basmala) {
                return (
                  <div
                    key={line.line}
                    style={{
                      flex: 1,
                      minHeight: 0,
                      maxHeight: `${100 / (page.total_lines || 15)}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      fontFamily: 'KFGQPC-Warsh, Traditional Arabic, serif',
                      fontSize: 'clamp(16px, 2.5vw, 24px)',
                      color: textColor,
                    }}
                  >
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
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
                    fontFamily: 'KFGQPC-Warsh, Traditional Arabic, serif',
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
                    maxHeight: `${100 / (page.total_lines || 15)}%`,
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
                            color: '#12D084',
                            backgroundColor: accentLight,
                            border: '1.5px solid #12D084',
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
                      <span
                        key={item.index ?? `word-${idx}`}
                        style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        {item.text}
                      </span>
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

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [menuVisible, setMenuVisible] = useState(false);
  const [hiddenMode, setHiddenMode] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const menuListRef = useRef<HTMLDivElement | null>(null);

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
            fontFamily: 'KFGQPC-Warsh, Traditional Arabic, serif',
          }}>
            {pageData?.sura?.name_ar || 'الفَاتِحَة'}
          </div>
          <div style={{ fontSize: 10, color: isDark ? '#A0A0A0' : '#666', direction: 'rtl' }}>
            {(() => {
              const pos = getQuranPosition(currentPage + 1);
              return `الجزء ${pos.juz} | الحزب ${pos.hizb} | الثمن ${pos.thoumn}`;
            })()}
          </div>
        </div>

        {/* In RTL: Theme toggle on LEFT (last in JSX) */}
        <button
          className="btn-modern btn-icon"
          onClick={toggleTheme}
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
          {isDark ? <MoonIcon size={20} color={textColor} /> : <SunIcon size={20} color={textColor} />}
        </button>
      </div>

      {/* Swiper */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
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
          style={{ height: '100%' }}
        >
          {(PAGES as Page[]).map((page, index) => {
            // Déterminer si c'est la première page de la sourate
            const prevPage = index > 0 ? (PAGES as Page[])[index - 1] : null;
            const isFirstPageOfSurah = !prevPage || prevPage.sura.no !== page.sura.no;
            return (
              <SwiperSlide key={index} virtualIndex={index}>
                <QuranPageWeb
                  page={page}
                  pageNumber={index + 1}
                  isDark={isDark}
                  isFirstPageOfSurah={isFirstPageOfSurah}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Bottom Bar - Modern style avec animations */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          borderTop: `1px solid ${borderColor}`,
          height: 70,
          minHeight: 70,
          flexShrink: 0,
        }}
      >
        {/* Bouton Settings */}
        <button
          className="btn-modern btn-icon"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Paramètres"
        >
          <SettingsIcon size={22} color={isDark ? '#A0A0A0' : '#666'} />
        </button>

        {/* Centre: Contrôles de récitation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Peek mot précédent */}
          <button
            className="btn-modern btn-icon"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Peek mot précédent"
          >
            <ChevronLeftIcon size={20} color={isDark ? '#A0A0A0' : '#666'} />
          </button>

          {/* Toggle masquer/afficher */}
          <button
            className="btn-modern btn-icon"
            onClick={toggleHiddenMode}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: hiddenMode ? '#12D084' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
              border: hiddenMode ? '2px solid #0BA968' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Masquer/Afficher (H)"
          >
            {hiddenMode
              ? <EyeOffIcon size={18} color="#FFFFFF" />
              : <EyeIcon size={18} color={isDark ? '#A0A0A0' : '#666'} />
            }
          </button>

          {/* Peek mot suivant */}
          <button
            className="btn-modern btn-icon"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Peek mot suivant"
          >
            <ChevronRightIcon size={20} color={isDark ? '#A0A0A0' : '#666'} />
          </button>

          {/* Nom récitateur */}
          <span style={{
            fontSize: 13,
            color: isDark ? '#A0A0A0' : '#666',
            fontFamily: 'KFGQPC-Warsh, Traditional Arabic, serif',
            marginLeft: 8,
          }}>
            عبد الباسط
          </span>
        </div>

        {/* Bouton Play principal avec animation pulse */}
        <button
          className="btn-modern btn-play"
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            background: 'linear-gradient(135deg, #12D084 0%, #0BA968 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(18, 208, 132, 0.4)',
          }}
          title="Lancer la récitation"
        >
          <PlayIcon size={24} color="#FFFFFF" />
        </button>
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
                  ? 'linear-gradient(135deg, rgba(18, 208, 132, 0.1) 0%, transparent 100%)'
                  : 'linear-gradient(135deg, rgba(18, 208, 132, 0.08) 0%, transparent 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BookOpenIcon size={22} color="#12D084" />
                <span style={{ fontSize: 18, color: '#12D084', fontWeight: 600 }}>السور</span>
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
                        ? (isDark ? '#1E3D2F' : '#E8FBF3')
                        : 'transparent',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: isCurrentSurah
                          ? '#12D084'
                          : (isDark ? '#1E3D2F' : '#E8FBF3'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        color: isCurrentSurah ? '#FFFFFF' : '#12D084',
                      }}
                    >
                      {surah.no}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 16,
                        color: isCurrentSurah ? '#12D084' : textColor,
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
    </div>
  );
}

export default App;
