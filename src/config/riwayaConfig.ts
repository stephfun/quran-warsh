/**
 * Configuration dynamique pour les différentes Riwayat (Warsh, Hafs, etc.)
 * Ce fichier centralise toutes les valeurs spécifiques à chaque riwaya
 */

export type RiwayaType = 'warsh' | 'hafs';

export interface RiwayaConfig {
  id: RiwayaType;
  name: string;
  nameAr: string;

  // Pagination
  totalPages: number;
  linesPerPage: number;
  specialPages: number[]; // Pages avec layout spécial (ex: 1, 2 pour Al-Fatiha)
  specialPagesLineCount: number; // Nombre de lignes pour pages spéciales

  // Police
  fontFamily: string;
  fontCdn: string;

  // Marqueurs Thoumn (divisions 1/8 de Hizb)
  thoumnMarkers: Set<string>;

  // Table des débuts de Hizb (60 Hizb)
  hizbStartPages: number[];

  // Couleurs (optionnel, pour différencier visuellement)
  accentColor: string;
  accentColorLight: string;
  accentColorLightDark: string; // Version sombre de accentColorLight (mode dark)
  accentColorDark: string;

  // Support Tajweed (couleurs des règles)
  supportsTajweedColors: boolean;
}

// ============================================
// WARSH CONFIGURATION
// ============================================

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

const HIZB_START_PAGES_WARSH: number[] = [
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

export const WARSH_CONFIG: RiwayaConfig = {
  id: 'warsh',
  name: 'Warsh',
  nameAr: 'ورش',

  totalPages: 604,
  linesPerPage: 15,
  specialPages: [1, 2],
  specialPagesLineCount: 6,

  fontFamily: 'KFGQPC-Warsh, Traditional Arabic, serif',
  fontCdn: 'https://cdn.jsdelivr.net/gh/AliMustafa731/quran-data-kfgqpc@main/warsh/font/warsh.10.woff2',

  thoumnMarkers: THOUMN_MARKERS_WARSH,
  hizbStartPages: HIZB_START_PAGES_WARSH,

  accentColor: '#12D084',
  accentColorLight: '#E8FBF3',
  accentColorLightDark: '#1E3D2F', // Version sombre pour mode dark
  accentColorDark: '#0BA968',

  supportsTajweedColors: false,
};

// ============================================
// HAFS CONFIGURATION (placeholder pour futur support)
// ============================================

// TODO: Remplir avec les vraies données Hafs
const THOUMN_MARKERS_HAFS = new Set<string>([
  // À compléter avec les marqueurs Hafs
]);

const HIZB_START_PAGES_HAFS: number[] = [
  // À compléter avec les pages Hafs (pagination différente)
  1, 6, 11, 17, 22, 27, 32, 37, 42, 47,
  52, 57, 62, 67, 72, 77, 82, 87, 92, 97,
  102, 107, 112, 117, 122, 127, 132, 137, 142, 147,
  152, 157, 162, 167, 172, 177, 182, 187, 192, 197,
  202, 207, 212, 217, 222, 227, 232, 237, 242, 247,
  252, 257, 262, 267, 272, 277, 282, 287, 292, 297,
];

export const HAFS_CONFIG: RiwayaConfig = {
  id: 'hafs',
  name: 'Hafs',
  nameAr: 'حفص',

  totalPages: 604, // Standard Madina Mushaf (à ajuster si différent)
  linesPerPage: 15,
  specialPages: [1, 2],
  specialPagesLineCount: 6,

  fontFamily: 'KFGQPC-Hafs, Traditional Arabic, serif',
  fontCdn: 'https://cdn.jsdelivr.net/gh/AliMustafa731/quran-data-kfgqpc@main/hafs/font/hafs.woff2',

  thoumnMarkers: THOUMN_MARKERS_HAFS,
  hizbStartPages: HIZB_START_PAGES_HAFS,

  accentColor: '#12D084',
  accentColorLight: '#E8FBF3',
  accentColorLightDark: '#1E3D2F', // Version sombre pour mode dark
  accentColorDark: '#0BA968',

  supportsTajweedColors: true, // Hafs supporte les couleurs Tajweed
};

// ============================================
// CONFIGURATION ACTIVE
// ============================================

// Map des configurations disponibles
export const RIWAYA_CONFIGS: Record<RiwayaType, RiwayaConfig> = {
  warsh: WARSH_CONFIG,
  hafs: HAFS_CONFIG,
};

// Riwaya active par défaut
export const DEFAULT_RIWAYA: RiwayaType = 'warsh';

// Fonction pour obtenir la config active
export function getRiwayaConfig(riwaya: RiwayaType = DEFAULT_RIWAYA): RiwayaConfig {
  return RIWAYA_CONFIGS[riwaya];
}

// Fonction helper pour vérifier si un verset est un marqueur Thoumn
export function isThoumnMarker(sura: number, aya: number, riwaya: RiwayaType = DEFAULT_RIWAYA): boolean {
  const config = getRiwayaConfig(riwaya);
  return config.thoumnMarkers.has(`${sura}:${aya}`);
}

// Fonction pour calculer la position dans le Coran
export function getQuranPosition(pageNumber: number, riwaya: RiwayaType = DEFAULT_RIWAYA) {
  const config = getRiwayaConfig(riwaya);
  const hizbStartPages = config.hizbStartPages;
  const totalPages = config.totalPages;

  // Trouver le Hizb actuel
  let hizb = 1;
  for (let i = hizbStartPages.length - 1; i >= 0; i--) {
    if (pageNumber >= hizbStartPages[i]) {
      hizb = i + 1;
      break;
    }
  }

  // Calculer le Juz (2 Hizb par Juz)
  const juz = Math.ceil(hizb / 2);

  // Calculer le Thoumn (1-8) dans le Hizb actuel
  const hizbStartPage = hizbStartPages[hizb - 1];
  const hizbEndPage = hizb < 60 ? hizbStartPages[hizb] - 1 : totalPages;
  const hizbPages = hizbEndPage - hizbStartPage + 1;
  const pageInHizb = pageNumber - hizbStartPage;
  const thoumn = Math.min(8, Math.floor((pageInHizb / hizbPages) * 8) + 1);

  return { juz, hizb, thoumn };
}
