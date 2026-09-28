import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Logo } from './Logo';
import { Mascot } from './Mascot';
import { colors, fonts, space } from '../theme/tokens';
import { delay, DEMO_DELAY_MS } from '../utils/delay';

type Props = {
  onFinish: () => void;
};

/** In-app splash — fixed 2s, then fade out. */
export function SplashScreen({ onFinish }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [mood, setMood] = useState<'charging' | 'celebrate'>('charging');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await delay(DEMO_DELAY_MS / 2);
      if (cancelled) return;
      setMood('celebrate');
      await delay(DEMO_DELAY_MS / 2);
      if (cancelled) return;
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (!cancelled) onFinish();
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [onFinish, opacity]);

  return (
    <Animated.View style={[styles.root, { opacity }]}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />
      <Mascot size={148} mood={mood} animated />
      <Logo variant="wordmark" size={44} style={styles.brandRow} />
      <Text style={styles.tag}>Firing up the forge…</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  blobTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.bgWash,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -40,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.emberSoft,
    opacity: 0.55,
  },
  brandRow: {
    marginTop: space.lg,
  },
  tag: {
    marginTop: space.sm,
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 15,
  },
});
