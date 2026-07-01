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
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export default function HomeScreen({ navigation }) {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    requestPermissionAndLoadPDFs();
  }, []);

  async function requestPermissionAndLoadPDFs() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Pertho needs access to your storage to find your PDF files.',
        [{ text: 'OK' }]
      );
      setLoading(false);
      return;
    }
    loadPDFs();
  }

  async function loadPDFs() {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'unknown',
        first: 200,
      });

      const pdfFiles = media.assets.filter(asset =>
        asset.filename.toLowerCase().endsWith('.pdf')
      );

      setPdfs(pdfFiles);
    } catch (error) {
      Alert.alert('Error', 'Could not load PDF files.');
    }
    setLoading(false);
  }

  const theme = darkMode ? dark : light;

  function renderPDF({ item }) {
    return (
      <TouchableOpacity
        style={[styles.pdfItem, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('Reader', { pdf: item, darkMode })}
      >
        <View style={styles.pdfIcon}>
          <Text style={styles.pdfIconText}>PDF</Text>
        </View>
        <View style={styles.pdfInfo}>
          <Text style={[styles.pdfName, { color: theme.text }]} numberOfLines={1}>
            {item.filename}
          </Text>
          <Text style={[styles.pdfSize, { color: theme.subtext }]}>
            {(item.duration / 1024).toFixed(1)} KB
          </Text>
        </View>
        <TouchableOpacity style={styles.threeDots}>
          <Text style={{ color: theme.subtext, fontSize: 20 }}>⋮</Text>
        </TouchableOpacity>
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
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            No PDF files found on your device.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pdfs}
          keyExtractor={item => item.id}
          renderItem={renderPDF}
          contentContainerStyle={styles.list}
        />
      )}
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
  list: { paddingHorizontal: 16, paddingTop: 8 },
  pdfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  pdfIcon: {
    backgroundColor: '#1558D6',
    borderRadius: 6,
    padding: 8,
    marginRight: 12,
  },
  pdfIconText: { color: 'white', fontWeight: 'bold', fontSize: 11 },
  pdfInfo: { flex: 1 },
  pdfName: { fontSize: 15, fontWeight: '500' },
  pdfSize: { fontSize: 12, marginTop: 2 },
  threeDots: { padding: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center', paddingHorizontal: 40 },
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
