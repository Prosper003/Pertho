import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';

export default function AboutScreen({ navigation, route }) {
  const { darkMode } = route.params;
  const theme = darkMode ? dark : light;

  const founders = [
    {
      name: 'Oliyide Prosper Adedamola',
      role: 'Chief Executive Officer',
      focus: 'Products',
    },
    {
      name: 'Samson Peter Oluwadamilare',
      role: 'Chief Financial Officer',
      focus: 'Financials',
    },
    {
      name: 'Alamu Bartholomew Ayobukola',
      role: 'Chief Marketing Officer',
      focus: 'Marketing Strategy & User Acquisition',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />

      <View style={[styles.header, { backgroundColor: theme.bg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>About</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.companyName, { color: theme.text }]}>
            Steeplechase Group
          </Text>
          <Text style={[styles.year, { color: theme.subtext }]}>
            Founded 2026
          </Text>
          <Text style={[styles.description, { color: theme.text }]}>
            Steeplechase Group is a technology company building tools that bring intelligence directly to your documents. We believe reading and learning should be seamless — no uploading files to external tools, no switching between apps. The AI comes to you.
          </Text>
          <Text style={[styles.description, { color: theme.text }]}>
            Our products are built for students and professionals who demand clarity, speed, and simplicity from their tools.
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.subtext }]}>FOUNDERS</Text>

        {founders.map((founder, index) => (
          <View key={index} style={[styles.founderCard, { backgroundColor: theme.card }]}>
            <View style={styles.founderInitial}>
              <Text style={styles.initialText}>
                {founder.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.founderInfo}>
              <Text style={[styles.founderName, { color: theme.text }]}>
                {founder.name}
              </Text>
              <Text style={[styles.founderRole, { color: '#1558D6' }]}>
                {founder.role}
              </Text>
              <Text style={[styles.founderFocus, { color: theme.subtext }]}>
                {founder.focus}
              </Text>
            </View>
          </View>
        ))}

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.websiteLabel, { color: theme.subtext }]}>Website</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://steeplechasegroup.com')}>
            <Text style={styles.websiteLink}>steeplechasegroup.com</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: theme.subtext }]}>
          Pertho is a product of Steeplechase Group
        </Text>

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
    paddingBottom: 16,
    gap: 16,
  },
  back: { fontSize: 16, fontWeight: '600', color: '#1558D6' },
  title: { fontSize: 22, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  companyName: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  year: { fontSize: 13, marginBottom: 16 },
  description: { fontSize: 15, lineHeight: 24, marginBottom: 12 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  founderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  founderInitial: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1558D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: { color: 'white', fontSize: 18, fontWeight: '700' },
  founderInfo: { flex: 1 },
  founderName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  founderRole: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  founderFocus: { fontSize: 12 },
  websiteLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  websiteLink: { fontSize: 16, color: '#1558D6', fontWeight: '500' },
  footer: { textAlign: 'center', fontSize: 13, marginTop: 8 },
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
