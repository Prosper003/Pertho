import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AIBottomSheet from '../components/AIBottomSheet';

const PDFJS_HTML = (pdfUri) => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f5f5f5; font-family: sans-serif; }
  #container { width: 100%; }
  canvas { display: block; width: 100% !important; height: auto !important; margin-bottom: 8px; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
  #loading { display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 16px; color: #888; }
  #popup {
    display: none;
    position: fixed;
    background: #1A1A1A;
    border-radius: 8px;
    padding: 6px 4px;
    flex-direction: row;
    gap: 2px;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  #popup button {
    background: transparent;
    border: none;
    color: white;
    font-size: 13px;
    font-weight: 600;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    letter-spacing: 0.3px;
  }
  #popup button:hover { background: rgba(255,255,255,0.1); }
  .divider { width: 1px; background: rgba(255,255,255,0.2); margin: 4px 0; }
</style>
</head>
<body>
<div id="loading">Loading document...</div>
<div id="container"></div>
<div id="popup">
  <button onclick="sendAction('explain')">Explain</button>
  <div class="divider"></div>
  <button onclick="sendAction('keypoints')">Key Points</button>
  <div class="divider"></div>
  <button onclick="sendAction('quiz')">Quiz Me</button>
</div>

<script>
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const popup = document.getElementById('popup');
const container = document.getElementById('container');
let selectedText = '';

async function loadPDF() {
  try {
    const pdf = await pdfjsLib.getDocument('${pdfUri}').promise;
    document.getElementById('loading').style.display = 'none';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: window.innerWidth / page.getViewport({ scale: 1 }).width });
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      container.appendChild(canvas);
      
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      
      const textLayer = document.createElement('div');
      textLayer.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;';
      
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:relative;margin-bottom:8px;';
      wrapper.appendChild(canvas);
      container.removeChild(canvas);
      container.appendChild(wrapper);
    }
    
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'loaded' }));
  } catch(e) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: e.message }));
  }
}

document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  const text = selection ? selection.toString().trim() : '';
  
  if (text.length > 3) {
    selectedText = text;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    popup.style.display = 'flex';
    popup.style.left = Math.max(4, rect.left) + 'px';
    popup.style.top = (rect.top - 48 + window.scrollY) + 'px';
  } else {
    selectedText = '';
    popup.style.display = 'none';
  }
});

document.addEventListener('click', (e) => {
  if (!popup.contains(e.target)) {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      popup.style.display = 'none';
    }
  }
});

function sendAction(mode) {
  if (selectedText) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'ai',
      mode: mode,
      text: selectedText,
    }));
    popup.style.display = 'none';
    window.getSelection().removeAllRanges();
  }
}

loadPDF();
</script>
</body>
</html>
`;

export default function ReaderScreen({ route, navigation }) {
  const { pdf, darkMode } = route.params;
  const [loading, setLoading] = useState(true);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [aiMode, setAiMode] = useState('');
  const webviewRef = useRef(null);
  const theme = darkMode ? dark : light;

  function handleMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'loaded') {
        setLoading(false);
      } else if (data.type === 'ai') {
        setSelectedText(data.text);
        setAiMode(data.mode);
        setBottomSheetVisible(true);
      } else if (data.type === 'error') {
        setLoading(false);
        Alert.alert('Error', 'Could not load this document.');
      }
    } catch (e) {}
  }

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
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {pdf.filename}
        </Text>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1558D6" />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>
            Loading document...
          </Text>
        </View>
      )}

      <WebView
        ref={webviewRef}
        source={{ html: PDFJS_HTML(pdf.uri) }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        originWhitelist={['*']}
        onError={() => {
          setLoading(false);
          Alert.alert('Error', 'Could not load this document.');
        }}
      />

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
  back: { fontSize: 16, fontWeight: '600', color: '#1558D6' },
  title: { flex: 1, fontSize: 15, fontWeight: '500' },
  webview: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: { marginTop: 12, fontSize: 14 },
});

const light = {
  bg: '#F5F5F5',
  text: '#1A1A1A',
  subtext: '#888888',
};

const dark = {
  bg: '#0D0D0D',
  text: '#F5F5F5',
  subtext: '#888888',
};
