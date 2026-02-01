import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import {Page} from '../types';

interface QuranPageProps {
  page: Page;
  pageNumber: number;
  theme: 'light' | 'dark';
}

// Conversion chiffres arabes
const toArabicNumerals = (num: number): string => {
  const arabicNums: {[key: string]: string} = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩',
  };
  return String(num).split('').map(d => arabicNums[d] || d).join('');
};

const QuranPage: React.FC<QuranPageProps> = ({page, pageNumber, theme}) => {
  const isDark = theme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1A1A1A' : '#FDFBF7',
      padding: 8,
    },
    pageFrame: {
      flex: 1,
      borderWidth: 2,
      borderColor: isDark ? '#333' : '#E8E4DD',
      borderRadius: 4,
      padding: 12,
    },
    surahHeader: {
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: isDark ? '#2D3436' : '#E8FBF3',
      borderWidth: 1,
      borderColor: isDark ? '#4A5568' : '#12D084',
      borderRadius: 6,
      marginBottom: 10,
    },
    surahName: {
      fontFamily: 'KFGQPC-Warsh',
      fontSize: 18,
      color: '#12D084',
    },
    surahInfo: {
      fontSize: 10,
      color: isDark ? '#A0A0A0' : '#666',
      marginTop: 2,
    },
    quranTextContainer: {
      flex: 1,
    },
    quranText: {
      fontFamily: 'KFGQPC-Warsh',
      fontSize: 22,
      lineHeight: 50,
      color: isDark ? '#F0EDE8' : '#1A1614',
      textAlign: 'justify',
      writingDirection: 'rtl',
    },
    word: {
      // Les mots sont inline dans le Text
    },
    verseEnd: {
      fontSize: 12,
      color: '#12D084',
      backgroundColor: isDark ? '#1E3D2F' : '#E8FBF3',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#12D084',
    },
    pageNumber: {
      textAlign: 'center',
      marginTop: 6,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#333' : '#E8E4DD',
      fontSize: 11,
      color: isDark ? '#A0A0A0' : '#666',
    },
  });

  // Render verses as text
  const renderVerses = () => {
    const elements: React.ReactNode[] = [];

    page.verses.forEach((verse) => {
      // Add all words
      verse.words.forEach((word) => {
        elements.push(
          <Text key={`word-${word.index}`} style={styles.quranText}>
            {word.text}{' '}
          </Text>
        );
      });

      // Add verse number
      elements.push(
        <Text key={`verse-${verse.aya}`} style={styles.verseEnd}>
          {toArabicNumerals(verse.aya)}
        </Text>
      );
      elements.push(<Text key={`space-${verse.aya}`}> </Text>);
    });

    return elements;
  };

  return (
    <View style={styles.container}>
      <View style={styles.pageFrame}>
        {/* Surah Header */}
        <View style={styles.surahHeader}>
          <Text style={styles.surahName}>سُورَةُ {page.sura.name_ar}</Text>
          <Text style={styles.surahInfo}>
            {page.sura.type} • {toArabicNumerals(page.sura.verses)} آيات
          </Text>
        </View>

        {/* Quran Text */}
        <ScrollView style={styles.quranTextContainer}>
          <Text style={styles.quranText}>{renderVerses()}</Text>
        </ScrollView>

        {/* Page Number */}
        <Text style={styles.pageNumber}>{toArabicNumerals(pageNumber)}</Text>
      </View>
    </View>
  );
};

export default QuranPage;
