import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  StatusBar,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MenuScreen({ navigation, route }) {
  const { darkMode: initialDarkMode } = route.params;
  const [darkMode, setDarkModeState] = useState(initialDarkMode);
  const theme = darkMode ? dark : light;

  async function toggleDarkMode(value) {
    setDarkModeState(value);
    await AsyncStorage.setItem('pertho_darkmode', JSON.stringify(value));
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.back, { color: '#FF6B2C' }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.subtext }]}>APPEARANCE</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#E0E0E0', true: '#FF6B2C' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.subtext }]}>HOW TO USE</Text>
          <View style={styles.howToRow}>
            <Text style={[styles.step, { color: theme.subtext }]}>01</Text>
            <Text style={[styles.howToText, { color: theme.text }]}>Open a document from your device using the button on the home screen.</Text>
          </View>
          <View style={styles.howToRow}>
            <Text style={[styles.step, { color: theme.subtext }]}>02</Text>
            <Text style={[styles.howToText, { color: theme.text }]}>Read normally. Scroll, zoom, and navigate pages as usual.</Text>
          </View>
          <View style={styles.howToRow}>
            <Text style={[styles.step, { color: theme.subtext }]}>03</Text>
            <Text style={[styles.howToText, { color: theme.text }]}>Long press any text to select it. Tap Explain, Key Points, or Quiz Me.</Text>
          </View>
          <View style={styles.howToRow}>
            <Text style={[styles.step, { color: theme.subtext }]}>04</Text>
            <Text style={[styles.howToText, { color: theme.text }]}>A panel slides up with your result. Dismiss it to continue reading.</Text>
          </View>
          <View style={styles.howToRow}>
            <Text style={[styles.step, { color: theme.subtext }]}>05</Text>
            <Text style={[styles.howToText, { color: theme.text }]}>You have 5 free AI actions per day. Watch an ad to unlock more.</Text>
          </View>
        </View>

       <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.subtext }]}>ABOUT</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Version</Text>
            <Text style={{ color: theme.subtext }}>1.0.0</Text>
          </View>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('About', { darkMode })}
          >
            <Text style={[styles.rowLabel, { color: theme.text }]}>Steeplechase Group</Text>
            <Text style={{ color: '#FF6B2C' }}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    gap: 16,
  },
  back: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold' },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  rowLabel: { fontSize: 16 },
  howToRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 14,
  },
  step: { fontSize: 12, fontWeight: '700', marginTop: 2, width: 20 },
  howToText: { flex: 1, fontSize: 14, lineHeight: 22 },
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
