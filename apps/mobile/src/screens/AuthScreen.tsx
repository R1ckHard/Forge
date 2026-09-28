import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getErrorMessage, useAuth } from '../auth/AuthContext';
import { Logo } from '../components/Logo';
import { Mascot } from '../components/Mascot';
import { colors, fonts, space } from '../theme/tokens';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.blob} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.hero}>
          <Mascot size={120} mood={loading ? 'charging' : 'idle'} animated={loading} />
          <Logo variant="wordmark" size={40} />
          <Text style={styles.tagline}>
            Meet Smithy — your forge companion for three focused sessions and a
            coach that stays on your plan.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={colors.textDim}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            secureTextEntry
            placeholder="At least 6 characters"
            placeholderTextColor={colors.textDim}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.primary, loading && styles.disabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryText}>
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
          >
            <Text style={styles.switch}>
              {mode === 'login'
                ? 'Need an account? Register'
                : 'Already training? Sign in'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  blob: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.bgWash,
  },
  flex: { flex: 1, paddingHorizontal: space.lg },
  hero: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: space.lg,
    alignItems: 'flex-start',
    gap: space.sm,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
    fontFamily: fonts.body,
  },
  form: { paddingBottom: space.xl },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
    marginTop: space.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    color: colors.text,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    fontSize: 16,
  },
  error: {
    color: colors.danger,
    marginTop: space.sm,
    marginBottom: space.xs,
  },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: space.lg,
  },
  primaryText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  switch: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: space.md,
    paddingVertical: space.sm,
  },
  disabled: { opacity: 0.7 },
});
