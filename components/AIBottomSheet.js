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
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'https://pertho-backend.onrender.com';
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
      setResult('Unable to connect. Please check your internet connection and try again.');
    }
    setLoading(false);
  }

  function getModeTitle() {
    if (mode === 'explain') return 'Explanation';
    if (mode === 'keypoints') return 'Key Points';
    if (mode === 'quiz') return 'Quiz';
    return 'Pertho AI';
  }

  const remaining = DAILY_FREE_LIMIT - actionsUsed;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.card }]}>
        <View style={styles.handle} />

        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: theme.text }]}>
            {getModeTitle()}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: theme.subtext, fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        </View>

        {locked ? (
          <View style={styles.lockedContainer}>
            <Text style={[styles.lockedTitle, { color: theme.text }]}>
              Daily limit reached
            </Text>
            <Text style={[styles.lockedSub, { color: theme.subtext }]}>
              You have used your 5 free AI actions for today. Come back tomorrow or watch an ad to unlock more.
            </Text>
            <TouchableOpacity style={styles.adButton}>
              <Text style={styles.adButtonText}>Watch Ad to Unlock</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1558D6" />
            <Text style={[styles.loadingText, { color: theme.subtext }]}>
              Analyzing...
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.resultContainer} showsVerticalScrollIndicator={false}>
            <Text style={[styles.resultText, { color: theme.text }]}>
              {result}
            </Text>
          </ScrollView>
        )}

        {!locked && !loading && (
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Text style={[styles.footerText, { color: theme.subtext }]}>
              {remaining} of {DAILY_FREE_LIMIT} free actions remaining today
            </Text>
          </View>
        )}
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.75,
    minHeight: 300,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#DEDEDE',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', letterSpacing: 0.2 },
  closeBtn: { padding: 4 },
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, fontSize: 14 },
  resultContainer: { flex: 1 },
  resultText: { fontSize: 15, lineHeight: 26 },
  lockedContainer: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 10 },
  lockedTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  lockedSub: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  adButton: {
    backgroundColor: '#1558D6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  adButtonText: { color: 'white', fontWeight: '600', fontSize: 15 },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: { fontSize: 12 },
});

const light = {
  card: '#FFFFFF',
  text: '#1A1A1A',
  subtext: '#888888',
  border: '#F0F0F0',
};

const dark = {
  card: '#1A1A1A',
  text: '#F5F5F5',
  subtext: '#888888',
  border: '#2A2A2A',
};
