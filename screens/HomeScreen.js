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
    loadSavedPDFs();
  }, []);

  async function loadSavedPDFs() {
    try {
      const saved = await AsyncStorage.getItem('pertho_pdfs');
      if (saved) {
        setPdfs(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Error loading PDFs:', e);
    }
    setLoading(false);
  }

  async function browsePDF() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const newPDF = {
        id: file.uri,
        filename: file.name,
        uri: file.uri,
        size: file.size || 0,
        addedAt: new Date().toISOString(),
      };

      const existing = pdfs.filter(p => p.id !== newPDF.id);
      const updated = [newPDF, ...existing];
      setPdfs(updated);
      await AsyncStorage.setItem('pertho_pdfs', JSON.stringify(updated));

      navigation.navigate('Reader', { pdf: newPDF, darkMode, setDarkMode });
    } catch (e) {
      Alert.alert('Error', 'Could not open file picker.');
    }
  }

  async function removePDF(id) {
    Alert.alert(
      'Remove PDF',
      'Remove this PDF from your list?',
      [
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
      ]
    );
  }

  function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  const theme = darkMode ? dark : light;

  function renderPDF({ item }) {
    return (
      <TouchableOpacity
        style={[styles.pdfItem, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('Reader', { pdf: item, darkMode, setDarkMode })}
        onLongPress={() => removePDF(item.id)}
      >
        <View style={styles.pdfIcon}>
          <Text style={styles.pdfIconText}>PDF</Text>
        </View>
        <View style={styles.pdfInfo}>
          <Text style={[styles.pdfName, { color: theme.text }]} numberOfLines={2}>
            {item.filename}
          </Text>
          <Text style={[styles.pdfSize, { color: theme.subtext }]}>
            {formatSize(item.size)}
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
        <TouchableOpacity onPress={() => navigation.navigate('Menu', { darkMode, setDarkMode })}>
          <Text style={[styles.hamburger, { color: theme.text }]}>☰</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1558D6" style={{ marginTop: 40 }} />
      ) : pdfs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No PDFs yet</Text>
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            Tap the button below to open a PDF from your device.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pdfs}
          keyExtractor={item => item.id}
          renderItem={renderPDF}
          contentContainerStyle={styles.list}
          numColumns={2}
        />
      )}

      <TouchableOpacity style={styles.browseButton} onPress={browsePDF}>
        <Text style={styles.browseButtonText}>Open PDF</Text>
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
  list: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 100 },
  pdfItem: {
    flex: 1,
    margin: 6,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  pdfIcon: {
    backgroundColor: '#1558D6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  pdfIconText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  pdfInfo: { alignItems: 'center' },
  pdfName: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  pdfSize: { fontSize: 11, marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  browseButton: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    backgroundColor: '#1558D6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  browseButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
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
