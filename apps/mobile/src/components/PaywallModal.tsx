import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Logo } from './Logo';
import { Mascot } from './Mascot';
import { colors, fonts, space } from '../theme/tokens';

type Props = {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubscribe: () => void;
};

export function PaywallModal({
  visible,
  loading,
  onClose,
  onSubscribe,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {loading ? (
            <Mascot size={88} mood="charging" animated />
          ) : (
            <Logo variant="mark" size={72} />
          )}
          <Text style={styles.eyebrow}>Forge Premium</Text>
          <Text style={styles.title}>Unlock premium forge</Text>
          <Text style={styles.body}>
            Get 1 hour of premium plus 3 extra sessions (Strength, Conditioning,
            Capstone). Demo checkout — no App Store or RevenueCat.
          </Text>

          {loading ? (
            <View style={styles.progress}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.progressText}>Processing…</Text>
            </View>
          ) : (
            <>
              <Pressable style={styles.primary} onPress={onSubscribe}>
                <Text style={styles.primaryText}>Pay $0.00 (demo)</Text>
              </Pressable>
              <Pressable style={styles.secondary} onPress={onSubscribe}>
                <Text style={styles.secondaryText}>Restore purchases (demo)</Text>
              </Pressable>
              <Pressable onPress={onClose}>
                <Text style={styles.cancel}>Not now</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,46,40,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: space.lg,
    paddingBottom: space.xxl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  eyebrow: {
    marginTop: space.md,
    color: colors.ember,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
    fontFamily: fonts.body,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: space.xs,
    marginBottom: space.sm,
    textAlign: 'center',
    fontFamily: fonts.display,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: space.lg,
    textAlign: 'center',
  },
  primary: {
    alignSelf: 'stretch',
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: space.sm,
  },
  primaryText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  secondary: {
    alignSelf: 'stretch',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: space.md,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '600',
  },
  cancel: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: space.sm,
  },
  progress: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.lg,
  },
  progressText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
});
