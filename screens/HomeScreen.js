import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSettings();
    });
    return unsubscribe;
  }, [navigation]);

  async function loadSettings() {
    try {
      const savedDark = await AsyncStorage.getItem('pertho_darkmode');
      if (savedDark !== null) setDarkMode(JSON.parse(savedDark));
      const saved = await AsyncStorage.getItem('pertho_pdfs');
      if (saved) setPdfs(JSON.parse(saved));
    } catch (e) {}
    setLoading(false);
  }

  async function browsePDF() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const newFile = {
        id: file.uri,
        filename: file.name,
        uri: file.uri,
        size: file.size || 0,
        mimeType: file.mimeType || '',
        addedAt: new Date().toISOString(),
      };

      const existing = pdfs.filter(p => p.id !== newFile.id);
      const updated = [newFile, ...existing];
      setPdfs(updated);
      await AsyncStorage.setItem('pertho_pdfs', JSON.stringify(updated));
      navigation.navigate('Reader', { pdf: newFile, darkMode });
    } catch (e) {
      Alert.alert('Error', 'Could not open file picker.');
    }
  }

  async function removeFile(id) {
    Alert.alert('Remove', 'Remove this file from your list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = pdfs.filter(p => p.id !== id);
          setPdfs(updated);
          await AsyncStorage.setItem('pertho_pdfs', JSON.stringify(updated));
        },
      },
    ]);
  }

  function getFileType(file) {
    const name = file.filename.toLowerCase();
    const mime = file.mimeType || '';
    if (name.endsWith('.pdf') || mime.includes('pdf')) return 'PDF';
    if (name.endsWith('.docx') || mime.includes('wordprocessingml')) return 'DOCX';
    if (name.endsWith('.doc') || mime.includes('msword')) return 'DOC';
    return 'FILE';
  }

  function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const theme = darkMode ? dark : light;

  function renderFile({ item }) {
    const type = getFileType(item);
    return (
      <TouchableOpacity
        style={[styles.fileItem, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('Reader', { pdf: item, darkMode })}
        onLongPress={() => removeFile(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.fileTag, {
          backgroundColor: type === 'PDF' ? '#FF6B2C' : '#333',
        }]}>
          <Text style={styles.fileTagText}>{type}</Text>
        </View>
        <View style={styles.fileInfo}>
          <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>
            {item.filename}
          </Text>
          <Text style={[styles.fileMeta, { color: theme.subtext }]}>
            {formatSize(item.size)}  ·  {formatDate(item.addedAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />

      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('Menu', { darkMode })}
          style={styles.menuBtn}
        >
          <View style={[styles.menuLine, { backgroundColor: theme.text }]} />
          <View style={[styles.menuLineShort, { backgroundColor: '#FF6B2C' }]} />
          <View style={[styles.menuLine, { backgroundColor: theme.text }]} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B2C" style={{ marginTop: 40 }} />
      ) : pdfs.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📄</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No documents yet</Text>
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            Open a document and Pertho will bring the intelligence to it.
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.sectionLabel, { color: theme.subtext }]}>
            RECENT DOCUMENTS
          </Text>
          <FlatList
            data={pdfs}
            keyExtractor={item => item.id}
            renderItem={renderFile}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      <TouchableOpacity style={styles.openButton} onPress={browsePDF} activeOpacity={0.85}>
        <Text style={styles.openButtonText}>Open Document</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  logo: {
    width: 120,
    height: 36,
  },
  menuBtn: {
    gap: 5,
    padding: 4,
  },
  menuLine: {
    width: 24,
    height: 2,
    borderRadius: 2,
  },
  menuLineShort: {
    width: 16,
    height: 2,
    borderRadius: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  fileTag: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 14,
  },
  fileTagText: { color: 'white', fontWeight: '700', fontSize: 11, letterSpacing: 0.5 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 15, fontWeight: '500' },
  fileMeta: { fontSize: 12, marginTop: 3 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF6B2C20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 24 },
  openButton: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    backgroundColor: '#FF6B2C',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#FF6B2C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  openButtonText: { color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});

const light = {
  bg: '#F7F7F7',
  card: '#FFFFFF',
  text: '#1A1A1A',
  subtext: '#888888',
  border: '#EEEEEE',
};

const dark = {
  bg: '#0D0D0D',
  card: '#1A1A1A',
  text: '#F5F5F5',
  subtext: '#666666',
  border: '#222222',
};
