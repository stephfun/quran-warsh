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
}> = ({
  page,
  pageNumber,
  isDark,
  isFirstPageOfSurah,
  config,
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
                    {/* Basmala */}
                    {hasBasmala && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 4px',
                        fontFamily: config.fontFamily,
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

              // Si la ligne contient une basmala, l'afficher avec style Othmani
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
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [currentRiwaya, setCurrentRiwaya] = useState<RiwayaType>(DEFAULT_RIWAYA);
  const [hiddenMode, setHiddenMode] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const menuListRef = useRef<HTMLDivElement | null>(null);

  // Config dynamique basée sur la riwaya sélectionnée
  const activeConfig = getRiwayaConfig(currentRiwaya);

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
                  config={activeConfig}
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
              backgroundColor: hiddenMode ? activeConfig.accentColor : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
              border: hiddenMode ? `2px solid ${activeConfig.accentColorDark}` : 'none',
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
            fontFamily: activeConfig.fontFamily,
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
            background: `linear-gradient(135deg, ${activeConfig.accentColor} 0%, ${activeConfig.accentColorDark} 100%)`,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 15px ${activeConfig.accentColor}66`,
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
    </div>
  );
}

export default App;
