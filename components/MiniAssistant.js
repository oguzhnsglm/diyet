import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'https://senin-backend-adresin.com/api/diet-ai';

const DEFAULT_PROMPTS = [
  'Bugünkü kalori durumum nasıl?',
  'Akşam için hafif bir öğün önerir misin?',
  'Şeker tüketimimi nasıl dengeleyebilirim?',
];

const initialAIMessage = {
  id: 'assistant-intro',
  sender: 'ai',
  text: 'Size nasıl yardımcı olabilirim? Hazır sorulardan birini seçebilir veya kendi sorunuzu yazabilirsiniz.',
};

const MiniAssistant = ({ visible, onClose, stats = { calories: 0, sugar: 0 }, prompts = DEFAULT_PROMPTS }) => {
  const [messages, setMessages] = useState([initialAIMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setMessages([initialAIMessage]);
      setInput('');
      setLoading(false);
    }
  }, [visible]);

  const pushMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const sendQuestion = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage = {
      id: `${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };
    pushMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          stats,
        }),
      });

      if (!response.ok) {
        throw new Error('AI yanıtı alınamadı');
      }

      const data = await response.json();
      const aiMessage = {
        id: `${Date.now()}-ai`,
        sender: 'ai',
        text:
          data?.answer ||
          'Şu an net bir cevap üretemedim, lütfen sorunu biraz daha farklı sorabilir misin? 🥺',
      };
      pushMessage(aiMessage);
    } catch (error) {
      console.error('MiniAssistant error', error);
      pushMessage({
        id: `${Date.now()}-error`,
        sender: 'ai',
        text: 'Sunucuya bağlanırken bir sorun oluştu, bağlantını veya daha sonra tekrar denemeyi düşünebilirsin.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    sendQuestion(input);
  };

  const handlePrompt = (prompt) => {
    sendQuestion(prompt);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>🤖 Mini Asistan</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityRole="button">
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.summaryText}>
            Bugünkü kalori: {stats.calories} kcal • Şeker: {stats.sugar} gr
          </Text>

          <View style={styles.promptRow}>
            {prompts.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={styles.promptChip}
                onPress={() => handlePrompt(prompt)}
                disabled={loading}
              >
                <Text style={styles.promptChipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.sender === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' ? styles.userText : styles.aiText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#22c55e" />
                <Text style={styles.loadingText}>Asistan düşünüyor...</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Sorunu buraya yaz"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, loading && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={loading}
            >
              <Text style={styles.sendText}>Gönder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: '#ecfdf5',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#166534',
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#166534',
  },
  summaryText: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  promptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  promptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#d1fae5',
  },
  promptChipText: {
    color: '#065f46',
    fontSize: 12,
    fontWeight: '600',
  },
  messages: {
    maxHeight: 280,
    marginTop: 12,
    marginBottom: 12,
  },
  messagesContent: {
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#22c55e',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
  },
  messageText: {
    fontSize: 14,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#0f172a',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6b7280',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderColor: '#d1d5db',
    paddingTop: 8,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#16a34a',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default MiniAssistant;
