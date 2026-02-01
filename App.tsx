/**
 * Quran Warsh App - React Native
 * Navigation par swipe natif avec PagerView
 */

import React, {useState, useRef, useCallback} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import {PAGES, SURAHS} from './src/data/quranData';
import QuranPage from './src/components/QuranPage';
import {Page, Surah, ThemeMode} from './src/types';

const {height} = Dimensions.get('window');

function App(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState(0);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [menuVisible, setMenuVisible] = useState(false);
  const pagerRef = useRef<PagerView>(null);

  const isDark = theme === 'dark';

  // Navigation vers une page
  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < PAGES.length) {
      pagerRef.current?.setPage(pageIndex);
      setCurrentPage(pageIndex);
      setMenuVisible(false);
    }
  }, []);

  // Navigation vers une sourate
  const goToSurah = useCallback((suraNo: number) => {
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
  }, [goToPage]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Current page data
  const pageData = PAGES[currentPage] as Page;

  // Styles dynamiques selon le thème
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1A1A1A' : '#FDFBF7',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: isDark ? '#252525' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333' : '#E8E4DD',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 16,
      color: isDark ? '#F0EDE8' : '#1A1614',
      fontWeight: '500',
    },
    headerSubtitle: {
      fontSize: 10,
      color: isDark ? '#A0A0A0' : '#666',
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: {
      fontSize: 18,
      color: isDark ? '#F0EDE8' : '#1A1614',
    },
    pagerView: {
      flex: 1,
    },
    bottomBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: isDark ? '#252525' : '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: isDark ? '#333' : '#E8E4DD',
      height: 70,
    },
    micButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: '#12D084',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#12D084',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    micIcon: {
      fontSize: 24,
      color: '#FFFFFF',
    },
    statsContainer: {
      alignItems: 'flex-end',
    },
    wordCount: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#F0EDE8' : '#1A1614',
    },
    timer: {
      fontSize: 14,
      color: isDark ? '#A0A0A0' : '#666',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    menuContainer: {
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: height * 0.7,
    },
    menuHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333' : '#E8E4DD',
    },
    menuTitle: {
      fontSize: 18,
      color: '#12D084',
      fontWeight: '600',
    },
    surahItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333' : '#EEE',
    },
    surahNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? '#1E3D2F' : '#E8FBF3',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    surahNumberText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#12D084',
    },
    surahInfo: {
      flex: 1,
    },
    surahNameAr: {
      fontSize: 16,
      color: isDark ? '#F0EDE8' : '#1A1614',
    },
    surahMeta: {
      fontSize: 11,
      color: isDark ? '#A0A0A0' : '#666',
    },
  });

  // Render surah item
  const renderSurahItem = ({item}: {item: Surah}) => (
    <TouchableOpacity
      style={styles.surahItem}
      onPress={() => goToSurah(item.no)}>
      <View style={styles.surahNumber}>
        <Text style={styles.surahNumberText}>{item.no}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={styles.surahNameAr}>{item.name_ar}</Text>
        <Text style={styles.surahMeta}>
          {item.name_en} • {item.verses} آيات • {item.type}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#252525' : '#FFFFFF'}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setMenuVisible(true)}>
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            سُورَةُ {pageData?.sura?.name_ar || 'الفَاتِحَة'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Page {currentPage + 1} • Juz {pageData?.juz || 1}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
            <Text style={styles.iconText}>{isDark ? '🌙' : '☀️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PagerView - Swipe natif */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={e => setCurrentPage(e.nativeEvent.position)}
        orientation="horizontal"
        overdrag={false}
        overScrollMode="never">
        {(PAGES as Page[]).map((page, index) => (
          <View key={index}>
            <QuranPage page={page} pageNumber={index + 1} theme={theme} />
          </View>
        ))}
      </PagerView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.micButton}>
          <Text style={styles.micIcon}>🎤</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <Text style={styles.wordCount}>
            0 / {pageData?.total_words || 0}
          </Text>
          <Text style={styles.timer}>00:00 ⏱</Text>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>📖 السور</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text style={styles.iconText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={SURAHS as Surah[]}
              renderItem={renderSurahItem}
              keyExtractor={item => String(item.no)}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export default App;
