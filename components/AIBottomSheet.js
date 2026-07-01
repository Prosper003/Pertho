import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'https://your-backend-url.onrender.com';
const DAILY_FREE_LIMIT = 5;

export default function AIBottomSheet({ text, mode, darkMode, onClose }) {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionsUsed, setActionsUsed] = useState(0);
  const [locked, setLocked] = useState(false);
  const theme = darkMode ? dark : light;

  useEffect(() => {
    checkAndCallAI();
  }, []);

  async function checkAndCallAI() {
    try {
      const today = new Date().toDateString();
      const stored = await AsyncStorage.getItem('pertho_usage');
      const usage = stored ? JSON.parse(stored) : { date: today, count: 0 };

      if (usage.date !== today) {
        await AsyncStorage.setItem('pertho_usage', JSON.stringify({ date: today, count: 0 }));
        callAI();
        return;
      }

      if (usage.count >= DAILY_FREE_LIMIT) {
        setLocked(true);
        setLoading(false);
        return;
      }

      const newUsage = { date: today, count: usage.count + 1 };
      await AsyncStorage.setItem('pertho_usage', JSON.stringify(newUsage));
      setActionsUsed(newUsage.count);
      callAI();
    } catch (e) {
      callAI();
    }
  }

  async function callAI() {
    try {
      const response = await fetch(`${BACKEND_URL}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode }),
      });
      const data = await response.json();
      setResult(data.result);
    } catch (e) {
      setResult('Something went wrong. Please check your internet connection and try again.');
    }
    setLoading(false);
  }

  function getModeTitle() {
    if (mode === 'explain') return '💡 Explanation';
    if (mode === 'keypoints') return '📝 Key Points';
    if (mode === 'quiz') return '🎯 Quiz';
    return 'Pertho AI';
  }

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.card }]}>
        <View style={styles.handle} />

        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: theme.text }]}>
            {getModeTitle()}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: '#888', fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>

        {locked ? (
          <View style={styles.lockedContainer}>
            <Text style={[styles.lockedTitle, { color: theme.text }]}>
              Daily limit reached
            </Text>
            <Text style={[styles.lockedSub, { color: theme.subtext }]}>
              You've used your 5 free AI actions today. Watch an ad to unlock more or come back tomorrow.
            </Text>
            <TouchableOpacity style={styles.adButton}>
              <Text style={styles.adButtonText}>Watch Ad to Unlock</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1558D6" />
            <Text style={[styles.loadingText, { color: theme.subtext }]}>
              Pertho is thinking...
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.resultContainer}>
            <Text style={[styles.resultText, { color: theme.text }]}>
              {result}
            </Text>
          </ScrollView>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.subtext }]}>
            {DAILY_FREE_LIMIT - actionsUsed} free actions remaining today
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.75,
    minHeight: 300,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: 'bold' },
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, fontSize: 14 },
  resultContainer: { flex: 1 },
  resultText: { fontSize: 15, lineHeight: 24 },
  lockedContainer: { alignItems: 'center', paddingVertical: 30 },
  lockedTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  lockedSub: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  adButton: {
    backgroundColor: '#1558D6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  adButtonText: { color: 'white', fontWeight: '600', fontSize: 15 },
  footer: { marginTop: 16, alignItems: 'center' },
  footerText: { fontSize: 12 },
});

const light = {
  card: '#FFFFFF',
  text: '#1A1A1A',
  subtext: '#888888',
};

const dark = {
  card: '#1A1A1A',
  text: '#F5F5F5',
  subtext: '#888888',
};
