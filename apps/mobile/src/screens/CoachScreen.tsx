import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiError } from '../api/client';
import { fetchCoachMessages, sendCoachMessage } from '../api/coach/coachApi';
import type { CoachMessage } from '../api/coach/types';
import { getErrorMessage, useAuth } from '../auth/AuthContext';
import {
  ChatBubble,
  ChatScreenLoader,
  ReplyTypingBubble,
} from '../components/ChatBusyIndicators';
import { Mascot } from '../components/Mascot';
import { Logo } from '../components/Logo';
import { PaywallModal } from '../components/PaywallModal';
import { colors, fonts, space } from '../theme/tokens';
import { delay, DEMO_DELAY_MS } from '../utils/delay';

export function CoachScreen() {
  const { token, user, isPremium, markSubscribed } = useAuth();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const listRef = useRef<FlatList>(null);

  const scrollEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const messages = await fetchCoachMessages(token);
      setMessages(messages);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (waiting) scrollEnd();
  }, [waiting, scrollEnd]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || !token || waiting) return;

    const optimistic: CoachMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setError(null);
    setText('');
    setMessages((prev) => [...prev, optimistic]);
    setWaiting(true);
    scrollEnd();

    try {
      const [data] = await Promise.all([
        sendCoachMessage(token, trimmed),
        delay(DEMO_DELAY_MS),
      ]);
      // Swap optimistic bubble for server user + assistant messages
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimistic.id),
        ...data.messages,
      ]);
      scrollEnd();
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      if (err instanceof ApiError && (err.status === 402 || err.code === 'PAYWALL')) {
        setPaywall(true);
        setText(trimmed);
      } else {
        setError(getErrorMessage(err));
        setText(trimmed);
      }
    } finally {
      setWaiting(false);
    }
  };

  const onSubscribe = async () => {
    setSubscribing(true);
    try {
      await markSubscribed();
      setPaywall(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Logo variant="mark" size={48} />
            <View style={styles.headerText}>
              <Text style={styles.title}>Coach</Text>
              {waiting ? (
                <Text style={styles.status}>Smithy is typing…</Text>
              ) : (
                <Text style={styles.statusMuted}>Smithy</Text>
              )}
            </View>
            <Mascot
              size={52}
              mood={waiting ? 'thinking' : isPremium ? 'celebrate' : 'idle'}
              animated={waiting}
            />
          </View>
          <Text style={styles.sub}>
            Smithy answers through your API.
            {isPremium
              ? ` Premium until ${
                  user?.premiumUntil
                    ? new Date(user.premiumUntil).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'soon'
                }.`
              : ' 3 free messages, then premium for 1 hour.'}
          </Text>
        </View>

        {loading ? (
          <ChatScreenLoader />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.list,
              messages.length === 0 && !waiting && styles.listEmpty,
            ]}
            onContentSizeChange={scrollEnd}
            ListEmptyComponent={
              waiting ? null : (
                <View style={styles.empty}>
                  <Mascot size={96} mood="idle" />
                  <Text style={styles.emptyTitle}>Write your coach</Text>
                  <Text style={styles.muted}>
                    Ask about intent, recovery, or what to prioritize on your open
                    session.
                  </Text>
                </View>
              )
            }
            ListFooterComponent={waiting ? <ReplyTypingBubble /> : null}
            renderItem={({ item }) => (
              <ChatBubble role={item.role} content={item.content} />
            )}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder={waiting ? 'Waiting for Smithy…' : 'Message Smithy…'}
            placeholderTextColor={colors.textDim}
            value={text}
            onChangeText={setText}
            multiline
            editable={!waiting}
          />
          <Pressable
            style={[styles.send, (!text.trim() || waiting) && styles.disabled]}
            onPress={send}
            disabled={!text.trim() || waiting}
          >
            <Text style={styles.sendText}>{waiting ? '…' : 'Send'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <PaywallModal
        visible={paywall}
        loading={subscribing}
        onClose={() => setPaywall(false)}
        onSubscribe={onSubscribe}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: { paddingHorizontal: space.lg, paddingTop: space.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  headerText: { flex: 1 },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    fontFamily: fonts.display,
  },
  status: {
    color: colors.ember,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  statusMuted: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sub: {
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: space.md,
    lineHeight: 20,
  },
  list: { paddingHorizontal: space.lg, paddingBottom: space.md },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  empty: {
    paddingVertical: space.xl,
    paddingHorizontal: space.sm,
    alignItems: 'flex-start',
    gap: space.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    fontFamily: fonts.display,
  },
  muted: { color: colors.textMuted, lineHeight: 21 },
  error: {
    color: colors.danger,
    paddingHorizontal: space.lg,
    marginBottom: space.xs,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bgElevated,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.text,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: 16,
  },
  send: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  sendText: { color: colors.white, fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
