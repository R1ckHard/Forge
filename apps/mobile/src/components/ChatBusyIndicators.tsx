import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Mascot } from './Mascot';
import { colors, space } from '../theme/tokens';

function TypingDots({ color = colors.textMuted }: { color?: string }) {
  const a = useRef(new Animated.Value(0)).current;
  const b = useRef(new Animated.Value(0)).current;
  const c = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (v: Animated.Value, start: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(start),
          Animated.timing(v, { toValue: -5, duration: 280, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(320),
        ]),
      );
    const loops = [bounce(a, 0), bounce(b, 140), bounce(c, 280)];
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [a, b, c]);

  return (
    <View style={styles.dotsRow}>
      {[a, b, c].map((v, i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { backgroundColor: color, transform: [{ translateY: v }] }]}
        />
      ))}
    </View>
  );
}

export function ReplyTypingBubble() {
  return (
    <View style={styles.typingWrap}>
      <Mascot size={52} mood="thinking" animated />
      <View style={styles.typingBubble}>
        <Text style={styles.typingLabel}>Smithy is thinking</Text>
        <TypingDots />
      </View>
    </View>
  );
}

export function ChatBubble({
  role,
  content,
}: {
  role: 'user' | 'assistant';
  content: string;
}) {
  const isUser = role === 'user';
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fade]);

  return (
    <Animated.View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.aiBubble,
        { opacity: fade },
      ]}
    >
      <Text style={[styles.bubbleText, isUser && styles.userText]}>{content}</Text>
    </Animated.View>
  );
}

export function ChatScreenLoader() {
  return (
    <View style={styles.loader}>
      <Mascot size={96} mood="charging" animated />
      <TypingDots color={colors.accent} />
      <Text style={styles.loaderLabel}>Loading conversation…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    height: 14,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  typingWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    marginBottom: space.sm,
    alignSelf: 'flex-start',
  },
  typingBubble: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    gap: 8,
    minWidth: 120,
  },
  typingLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: 16,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    marginBottom: space.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.line,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: colors.text, lineHeight: 21, fontSize: 15 },
  userText: { color: colors.white },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
  },
  loaderLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
