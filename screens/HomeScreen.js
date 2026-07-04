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

  function getFileTypeColor(type) {
    if (type === 'PDF') return '#1558D6';
    if (type === 'DOCX' || type === 'DOC') return '#2B579A';
    return '#555';
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
    const color = getFileTypeColor(type);
    return (
      <TouchableOpacity
        style={[styles.fileItem, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('Reader', { pdf: item, darkMode })}
        onLongPress={() => removeFile(item.id)}
      >
        <View style={[styles.fileTag, { backgroundColor: color }]}>
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Pertho</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Menu', { darkMode })}>
          <Text style={[styles.hamburger, { color: theme.text }]}>☰</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1558D6" style={{ marginTop: 40 }} />
      ) : pdfs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No files yet</Text>
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            Tap the button below to open a document from your device.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pdfs}
          keyExtractor={item => item.id}
          renderItem={renderFile}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity style={styles.openButton} onPress={browsePDF}>
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
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  hamburger: { fontSize: 24 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  openButton: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    backgroundColor: '#1558D6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  openButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

const light = {
  bg: '#F5F5F5',
  card: '#FFFFFF',
  text: '#1A1A1A',
  subtext: '#888888',
};

const dark = {
  bg: '#0D0D0D',
  card: '#1A1A1A',
  text: '#F5F5F5',
  subtext: '#888888',
};
