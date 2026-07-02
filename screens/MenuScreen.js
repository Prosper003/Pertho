import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  StatusBar,
  ScrollView,
} from 'react-native';

export default function MenuScreen({ navigation, route }) {
  const { darkMode, setDarkMode } = route.params;
  const theme = darkMode ? dark : light;

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
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.subtext }]}>APPEARANCE</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={(value) => {
                setDarkMode(value);
                navigation.goBack();
              }}
              trackColor={{ false: '#E0E0E0', true: '#1558D6' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.subtext }]}>HOW TO USE</Text>
          <View style={styles.howToRow}>
            <Text style={[styles.howToStep, { color: theme.text }]}>1. Pertho scans your phone and lists all PDF files automatically.</Text>
          </View>
          <View style={styles.howToRow}>
            <Text style={[styles.howToStep, { color: theme.text }]}>2. Tap any PDF to open it and read normally.</Text>
          </View>
          <View style={styles.howToRow}>
            <Text style={[styles.howToStep, { color: theme.text }]}>3. While reading, highlight any text you want to understand.</Text>
          </View>
          <View style={styles.howToRow}>
            <Text style={[styles.howToStep, { color: theme.text }]}>4. A menu appears — tap Explain, Key Points, or Quiz Me.</Text>
          </View>
          <View style={styles.howToRow}>
            <Text style={[styles.howToStep, { color: theme.text }]}>5. A panel slides up with your result. Swipe down to close and continue reading.</Text>
          </View>
          <View style={styles.howToRow}>
            <Text style={[styles.howToStep, { color: theme.text }]}>6. You get 5 free AI actions daily. Watch a short ad to unlock more.</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.subtext }]}>ABOUT</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Version</Text>
            <Text style={{ color: theme.subtext }}>1.0.0</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>By</Text>
            <Text style={{ color: theme.subtext }}>Steeplechase Group</Text>
          </View>
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
    paddingHorizontal: 16,
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
    fontWeight: '600',
    letterSpacing: 1,
    paddingVertical: 10,
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
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  howToStep: {
    fontSize: 14,
    lineHeight: 22,
  },
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
