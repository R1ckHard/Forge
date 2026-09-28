import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { completeSession, fetchSession } from '../api/plan/planApi';
import type { PlanSession, Workout } from '../api/plan/types';
import { getErrorMessage, useAuth } from '../auth/AuthContext';
import { Mascot } from '../components/Mascot';
import { PaywallModal } from '../components/PaywallModal';
import type { PlanStackParamList } from '../navigation/types';
import { colors, fonts, space } from '../theme/tokens';

type Props = NativeStackScreenProps<PlanStackParamList, 'Session'>;

export function SessionScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const { token, isPremium, markSubscribed } = useAuth();
  const [session, setSession] = useState<PlanSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const sessionData = await fetchSession(token, sessionId);
      setSession(sessionData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token, sessionId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onComplete = async () => {
    if (!token || !session || session.status !== 'open' || completing) return;
    setCompleting(true);
    setError(null);
    try {
      const data = await completeSession(token, session.id);
      setSession(data.session);
      // Paywall after free block (session 3), before premium lessons
      if (session.index === 3 && !isPremium) {
        setPaywall(true);
      } else {
        navigation.goBack();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCompleting(false);
    }
  };

  const onSubscribe = async () => {
    setSubscribing(true);
    try {
      await markSubscribed();
      setPaywall(false);
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubscribing(false);
    }
  };

  const workout = session?.workout;
  const canComplete = session?.status === 'open';
  const locked = session?.status === 'locked';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
          <Text style={styles.backText}>Plan</Text>
        </Pressable>
        {session ? (
          <Text style={styles.topMeta}>Session {session.index}</Text>
        ) : null}
      </View>

      {loading && !session ? (
        <View style={styles.center}>
          <Mascot size={96} mood="charging" animated />
          <Text style={styles.muted}>Loading workout…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <Mascot
              size={88}
              mood={completing ? 'charging' : session?.status === 'completed' ? 'celebrate' : 'idle'}
              animated={completing}
            />
            <Text style={styles.title}>{session?.title}</Text>
            <Text style={styles.summary}>{session?.summary}</Text>
            {workout ? (
              <View style={styles.metaRow}>
                <View style={styles.chip}>
                  <Ionicons name="time-outline" size={14} color={colors.accent} />
                  <Text style={styles.chipText}>{workout.durationMin} min</Text>
                </View>
                <View style={[styles.chip, styles.chipSoft]}>
                  <Text style={styles.chipText}>{workout.focus}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {locked ? (
            <View style={styles.lockBox}>
              <Ionicons name="lock-closed" size={20} color={colors.locked} />
              <Text style={styles.lockTitle}>Still locked</Text>
              <Text style={styles.muted}>
                Finish the previous session to unlock this workout.
              </Text>
            </View>
          ) : null}

          {workout && !locked ? <WorkoutBlock workout={workout} /> : null}

          {session?.status === 'completed' ? (
            <View style={styles.doneBanner}>
              <Ionicons name="checkmark-circle" size={20} color={colors.open} />
              <Text style={styles.doneText}>Session completed</Text>
            </View>
          ) : null}

          {canComplete ? (
            <Pressable
              style={[styles.cta, completing && styles.disabled]}
              onPress={onComplete}
              disabled={completing}
            >
              {completing ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.ctaLabel}>Finish session</Text>
                  <Text style={styles.ctaTitle}>Mark as complete</Text>
                </>
              )}
            </Pressable>
          ) : null}
        </ScrollView>
      )}

      <PaywallModal
        visible={paywall}
        loading={subscribing}
        onClose={() => {
          setPaywall(false);
          navigation.goBack();
        }}
        onSubscribe={onSubscribe}
      />
    </SafeAreaView>
  );
}

function WorkoutBlock({ workout }: { workout: Workout }) {
  return (
    <View style={styles.block}>
      <Text style={styles.sectionLabel}>Warm-up</Text>
      <Text style={styles.sectionBody}>{workout.warmup}</Text>

      <Text style={[styles.sectionLabel, styles.sectionSpaced]}>Workout</Text>
      {workout.exercises.map((ex, i) => (
        <View key={ex.name} style={styles.exercise}>
          <View style={styles.exIndex}>
            <Text style={styles.exIndexText}>{i + 1}</Text>
          </View>
          <View style={styles.exBody}>
            <View style={styles.exTop}>
              <Text style={styles.exName}>{ex.name}</Text>
              <Text style={styles.exDetail}>{ex.detail}</Text>
            </View>
            <Text style={styles.exCue}>{ex.cue}</Text>
          </View>
        </View>
      ))}

      <Text style={[styles.sectionLabel, styles.sectionSpaced]}>Cool-down</Text>
      <Text style={styles.sectionBody}>{workout.cooldown}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { color: colors.text, fontWeight: '600', fontSize: 16 },
  topMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  content: { padding: space.lg, paddingBottom: space.xxl },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  hero: { alignItems: 'flex-start', marginBottom: space.lg, gap: space.sm },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    fontFamily: fonts.display,
  },
  summary: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipSoft: { backgroundColor: colors.bgSoft, maxWidth: '100%' },
  chipText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  muted: { color: colors.textMuted, lineHeight: 21 },
  error: { color: colors.danger, marginBottom: space.md },
  lockBox: {
    padding: space.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgElevated,
    gap: space.sm,
    marginBottom: space.lg,
  },
  lockTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  block: {
    backgroundColor: colors.bgElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    marginBottom: space.lg,
  },
  sectionLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionSpaced: { marginTop: space.lg },
  sectionBody: { color: colors.textMuted, lineHeight: 21, fontSize: 14 },
  exercise: {
    flexDirection: 'row',
    gap: space.sm,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSoft,
  },
  exIndex: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  exIndexText: { color: colors.accent, fontWeight: '800', fontSize: 13 },
  exBody: { flex: 1 },
  exTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.sm,
    marginBottom: 4,
  },
  exName: { color: colors.text, fontWeight: '700', fontSize: 16, flex: 1 },
  exDetail: { color: colors.ember, fontWeight: '700', fontSize: 13 },
  exCue: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  doneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.openSoft,
    padding: space.md,
    borderRadius: 14,
    marginBottom: space.md,
  },
  doneText: { color: colors.open, fontWeight: '700' },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: space.md,
    minHeight: 72,
    justifyContent: 'center',
  },
  ctaLabel: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  ctaTitle: { color: colors.white, fontSize: 18, fontWeight: '700' },
  disabled: { opacity: 0.7 },
});
