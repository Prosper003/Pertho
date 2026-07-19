import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReaderScreen({ route, navigation }) {
  const { pdf, darkMode } = route.params;
  const [loading, setLoading] = useState(true);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [sheetState, setSheetState] = useState('hidden'); // hidden, pill, expanded
  const [selectedText, setSelectedText] = useState('');
  const [aiMode, setAiMode] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const webviewRef = useRef(null);
  const theme = darkMode ? dark : light;

  useEffect(() => {
    loadPDF();
  }, []);

  async function loadPDF() {
    try {
      const base64 = await FileSystem.readAsStringAsync(pdf.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setPdfBase64(base64);
    } catch (e) {
      Alert.alert('Error', 'Could not load this document.');
      setLoading(false);
    }
  }

  function showPill() {
    setSheetState('pill');
    Animated.spring(sheetAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }

  function expandSheet(mode) {
    setAiMode(mode);
    setAiResult('');
    setAiLoading(true);
    setSheetState('expanded');
    Animated.spring(sheetAnim, {
      toValue: 2,
      useNativeDriver: false,
      tension: 60,
      friction: 12,
    }).start();
    callAI(mode);
  }

  function hideSheet() {
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start(() => {
      setSheetState('hidden');
      setAiResult('');
      setSelectedText('');
    });
  }

  async function callAI(mode) {
    try {
      const response = await fetch('https://pertho-backend.onrender.com/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, mode }),
      });
      const data = await response.json();
      setAiResult(data.result);
    } catch (e) {
      setAiResult('Unable to connect. Please check your internet connection.');
    }
    setAiLoading(false);
  }

  function handleMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'loaded') {
        setLoading(false);
      } else if (data.type === 'selected') {
        setSelectedText(data.text);
        showPill();
      } else if (data.type === 'deselected') {
        if (sheetState === 'pill') hideSheet();
      } else if (data.type === 'error') {
        setLoading(false);
        Alert.alert('Error', 'Could not render this document.');
      }
    } catch (e) {}
  }

  function getModeTitle() {
    if (aiMode === 'explain') return 'Explanation';
    if (aiMode === 'keypoints') return 'Key Points';
    if (aiMode === 'quiz') return 'Quiz';
    return 'Pertho AI';
  }

  const pillTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
    extrapolate: 'clamp',
  });

  const sheetHeight = sheetAnim.interpolate({
    inputRange: [1, 2],
    outputRange: [60, SCREEN_HEIGHT * 0.65],
    extrapolate: 'clamp',
  });

  const htmlContent = pdfBase64 ? `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0">
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f7f7f7; font-family: sans-serif; -webkit-user-select: text; user-select: text; }
  #container { width: 100%; padding: 8px; }
  .page-wrap { position: relative; margin-bottom: 10px; }
  canvas { display: block; width: 100% !important; height: auto !important; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.12); border-radius: 2px; }
  .text-layer {
    position: absolute;
    top: 0; left: 8px; right: 8px; bottom: 0;
    overflow: hidden;
    line-height: 1;
    -webkit-user-select: text;
    user-select: text;
  }
  .text-layer span {
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
  }
  .text-layer span::selection { background: rgba(255, 107, 44, 0.3); }
  #loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 15px;
    color: #888;
    font-family: sans-serif;
  }
</style>
</head>
<body>
<div id="loading">Loading document...</div>
<div id="container"></div>
<script>
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const base64Data = '${pdfBase64}';
const byteCharacters = atob(base64Data);
const byteArray = new Uint8Array(byteCharacters.length);
for (let i = 0; i < byteCharacters.length; i++) {
  byteArray[i] = byteCharacters.charCodeAt(i);
}

async function loadPDF() {
  try {
    const pdf = await pdfjsLib.getDocument({ data: byteArray.buffer }).promise;
    document.getElementById('loading').style.display = 'none';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const scale = (window.innerWidth - 16) / page.getViewport({ scale: 1 }).width;
      const viewport = page.getViewport({ scale });

      const wrap = document.createElement('div');
      wrap.className = 'page-wrap';

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      wrap.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      const textLayer = document.createElement('div');
      textLayer.className = 'text-layer';
      textLayer.style.height = viewport.height + 'px';

      const textContent = await page.getTextContent();
      textContent.items.forEach(item => {
        if (!item.str.trim()) return;
        const span = document.createElement('span');
        span.textContent = item.str;
        const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
        span.style.left = tx[4] + 'px';
        span.style.top = (tx[5] - item.height * scale) + 'px';
        span.style.fontSize = Math.abs(tx[0]) + 'px';
        textLayer.appendChild(span);
      });

      wrap.appendChild(textLayer);
      document.getElementById('container').appendChild(wrap);
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
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'selected', text }));
  } else {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'deselected' }));
  }
});

loadPDF();
</script>
</body>
</html>
` : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />

      <View style={[styles.header, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {pdf.filename}
        </Text>
      </View>

      {(loading || !htmlContent) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B2C" />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>
            Loading document...
          </Text>
        </View>
      )}

      {htmlContent && (
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => { if (sheetState !== 'hidden') hideSheet(); }}
        >
          <WebView
            ref={webviewRef}
            source={{ html: htmlContent }}
            style={styles.webview}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
            mixedContentMode="always"
            originWhitelist={['*']}
            scrollEnabled={sheetState === 'hidden'}
            onError={() => {
              setLoading(false);
              Alert.alert('Error', 'Could not load this document.');
            }}
          />
        </TouchableOpacity>
      )}

      {sheetState !== 'hidden' && (
        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetState === 'pill' ? 60 : sheetHeight,
            }
          ]}
        >
          {sheetState === 'pill' && (
            <View style={styles.pill}>
              <TouchableOpacity style={styles.pillBtn} onPress={() => expandSheet('explain')}>
                <Text style={styles.pillBtnText}>Explain</Text>
              </TouchableOpacity>
              <View style={styles.pillDivider} />
              <TouchableOpacity style={styles.pillBtn} onPress={() => expandSheet('keypoints')}>
                <Text style={styles.pillBtnText}>Key Points</Text>
              </TouchableOpacity>
              <View style={styles.pillDivider} />
              <TouchableOpacity style={styles.pillBtn} onPress={() => expandSheet('quiz')}>
                <Text style={styles.pillBtnText}>Quiz Me</Text>
              </TouchableOpacity>
            </View>
          )}

          {sheetState === 'expanded' && (
            <View style={styles.expanded}>
              <View style={styles.expandedHeader}>
                <Text style={styles.expandedTitle}>{getModeTitle()}</Text>
                <TouchableOpacity onPress={hideSheet} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.handle} />
              {aiLoading ? (
                <View style={styles.aiLoading}>
                  <ActivityIndicator size="large" color="#FF6B2C" />
                  <Text style={styles.aiLoadingText}>Analyzing...</Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.resultScroll}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.resultText}>{aiResult}</Text>
                  <View style={{ height: 30 }} />
                </ScrollView>
              )}
            </View>
          )}
        </Animated.View>
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
    borderBottomWidth: 1,
  },
  back: { fontSize: 16, fontWeight: '600', color: '#FF6B2C' },
  title: { flex: 1, fontSize: 14, fontWeight: '500' },
  webview: { flex: 1 },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14 },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    overflow: 'hidden',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingHorizontal: 8,
  },
  pillBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  pillBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: 0.2,
  },
  pillDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EEEEEE',
  },
  expanded: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expandedTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  handle: {
    width: 36,
    height: 3,
    backgroundColor: '#EEEEEE',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  aiLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  aiLoadingText: {
    fontSize: 14,
    color: '#888',
  },
  resultScroll: { flex: 1 },
  resultText: {
    fontSize: 15,
    lineHeight: 26,
    color: '#1A1A1A',
  },
});

const light = {
  bg: '#F7F7F7',
  text: '#1A1A1A',
  subtext: '#888888',
  border: '#EEEEEE',
};

const dark = {
  bg: '#0D0D0D',
  text: '#F5F5F5',
  subtext: '#666666',
  border: '#222222',
};
