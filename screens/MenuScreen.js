import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  StatusBar,
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

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.subtext }]}>APPEARANCE</Text>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: theme.text }]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#E0E0E0', true: '#1558D6' }}
            thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.subtext }]}>HELP</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('HowToUse')}
        >
          <Text style={[styles.rowLabel, { color: theme.text }]}>How to Use Pertho</Text>
          <Text style={{ color: '#1558D6' }}>→</Text>
        </TouchableOpacity>
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
