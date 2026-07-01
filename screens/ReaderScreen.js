import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AIBottomSheet from '../components/AIBottomSheet';

export default function ReaderScreen({ route, navigation }) {
  const { pdf, darkMode } = route.params;
  const [selectedText, setSelectedText] = useState('');
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [aiMode, setAiMode] = useState('');
  const theme = darkMode ? dark : light;

  function handleTextSelection(text, mode) {
    if (!text || text.trim().length < 10) {
      Alert.alert('Select more text', 'Please highlight a longer passage to use AI.');
      return;
    }
    setSelectedText(text);
    setAiMode(mode);
    setBottomSheetVisible(true);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: '#1558D6' }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {pdf.filename}
        </Text>
      </View>

      <Pdf
        source={{ uri: pdf.uri, cache: true }}
        style={styles.pdf}
        onError={(error) => Alert.alert('Error', 'Could not open this PDF.')}
        enablePaging={false}
        horizontal={false}
      />

      <View style={styles.aiBar}>
        <Text style={styles.aiBarLabel}>Highlight text then tap:</Text>
        <View style={styles.aiButtons}>
          <TouchableOpacity
            style={styles.aiBtn}
            onPress={() => handleTextSelection(selectedText, 'explain')}
          >
            <Text style={styles.aiBtnText}>💡 Explain</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.aiBtn}
            onPress={() => handleTextSelection(selectedText, 'keypoints')}
          >
            <Text style={styles.aiBtnText}>📝 Key Points</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.aiBtn}
            onPress={() => handleTextSelection(selectedText, 'quiz')}
          >
            <Text style={styles.aiBtnText}>🎯 Quiz Me</Text>
          </TouchableOpacity>
        </View>
      </View>

      {bottomSheetVisible && (
        <AIBottomSheet
          text={selectedText}
          mode={aiMode}
          darkMode={darkMode}
          onClose={() => setBottomSheetVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    gap: 12,
  },
  back: { fontSize: 16, fontWeight: '600' },
  title: { flex: 1, fontSize: 15, fontWeight: '500' },
  pdf: { flex: 1, width: '100%' },
  aiBar: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  aiBarLabel: { fontSize: 12, color: '#888', marginBottom: 8 },
  aiButtons: { flexDirection: 'row', gap: 8 },
  aiBtn: {
    backgroundColor: '#1558D6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  aiBtnText: { color: 'white', fontSize: 13, fontWeight: '500' },
});

const light = {
  bg: '#F5F5F5',
  text: '#1A1A1A',
};

const dark = {
  bg: '#0D0D0D',
  text: '#F5F5F5',
};
