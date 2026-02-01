// Types pour l'app Quran Warsh

export interface Surah {
  no: number;
  name_ar: string;
  name_en: string;
  verses: number;
  type: string;
}

export interface Word {
  text: string;
  index: number;
}

export interface VerseEnd {
  type: 'verse_end';
  sura: number;
  aya: number;
}

export interface SurahStart {
  type: 'surah_start';
  sura_no: number;
  sura_name_ar: string;
  sura_name_en: string;
  verses_count: number;
  sura_type: string;
}

export interface Verse {
  aya: number;
  words: Word[];
  line_start: number;
  line_end: number;
}

export interface LineContent {
  line: number;
  content: (Word | VerseEnd | SurahStart)[];
}

export interface Page {
  page: number;
  juz: number;
  sura: Surah;
  suras?: Surah[];
  verses: Verse[];
  lines?: LineContent[];
  total_words: number;
  total_lines?: number;
}

export type ThemeMode = 'light' | 'dark';
