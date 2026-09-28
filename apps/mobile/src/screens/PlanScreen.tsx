import React, { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchPlan } from '../api/plan/planApi';
import type { PlanResponse, PlanSession } from '../api/plan/types';
import { getErrorMessage, useAuth } from '../auth/AuthContext';
import { Logo } from '../components/Logo';
import { Mascot } from '../components/Mascot';
import { PaywallModal } from '../components/PaywallModal';
import type { PlanStackParamList } from '../navigation/types';
import { colors, fonts, space } from '../theme/tokens';

type Props = NativeStackScreenProps<PlanStackParamList, 'PlanHome'>;

function premiumLabel(until: string | null | undefined) {
  if (!until) return 'Premium active';
  const mins = Math.max(
    0,
    Math.round((new Date(until).getTime() - Date.now()) / 60000),
  );
  if (mins >= 60) return `Premium · ~${Math.round(mins / 60)}h left`;
  return `Premium · ${mins}m left`;
}

export function PlanScreen({ navigation }: Props) {
  const { token, user, logout, isPremium, markSubscribed } = useAuth();
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const load = useCallback(
    async (soft = false) => {
      if (!token) return;
      if (!soft) setLoading(true);
      setError(null);
      try {
        const data = await fetchPlan(token);
        setPlan(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openSession = (session: PlanSession) => {
    if (session.status === 'locked') return;
    navigation.navigate('Session', { sessionId: session.id });
  };

  const onSubscribe = async () => {
    setSubscribing(true);
    try {
      await markSubscribed();
      setPaywall(false);
      await load(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubscribing(false);
    }
  };

  const next = plan?.sessions.find((s) => s.id === plan.nextSessionId);
  const freeSessions = plan?.sessions.filter((s) => s.tier === 'free') ?? [];
  const freeDone = freeSessions.length > 0 && freeSessions.every((s) => s.status === 'completed');
  const allDone =
    (plan?.sessions.length ?? 0) > 0 &&
    plan!.sessions.every((s) => s.status === 'completed');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load(true);
            }}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.topRow}>
          <View>
            <Logo variant="wordmark" size={32} />
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <Pressable onPress={logout} hitSlop={12}>
            <Text style={styles.logout}>Log out</Text>
          </Pressable>
        </View>

        {isPremium ? (
          <View style={styles.premiumChip}>
            <Ionicons name="sparkles" size={14} color={colors.premium} />
            <Text style={styles.premiumText}>
              {premiumLabel(user?.premiumUntil)}
            </Text>
          </View>
        ) : null}

        <Text style={styles.headline}>Your training plan</Text>
        <Text style={styles.sub}>
          Three free sessions forge your base. Premium unlocks three more
          advanced lessons with Smithy.
        </Text>

        {loading && !plan ? (
          <View style={styles.center}>
            <Mascot size={88} mood="charging" animated />
            <Text style={styles.muted}>Loading plan…</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {plan?.sessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            onPress={() => openSession(session)}
          />
        ))}

        {next ? (
          <Pressable style={styles.cta} onPress={() => openSession(next)}>
            <Text style={styles.ctaLabel}>Next Session</Text>
            <Text style={styles.ctaTitle}>
              {next.index}. {next.title}
            </Text>
          </Pressable>
        ) : freeDone && !isPremium ? (
          <View style={styles.doneBox}>
            <Mascot size={80} mood="celebrate" />
            <Text style={styles.doneTitle}>Free plan complete</Text>
            <Text style={styles.muted}>
              Unlock premium for 1 hour and get 3 more sessions: Strength,
              Conditioning, and Capstone.
            </Text>
            <Pressable style={styles.unlockBtn} onPress={() => setPaywall(true)}>
              <Text style={styles.unlockText}>Unlock premium (demo)</Text>
            </Pressable>
          </View>
        ) : allDone ? (
          <View style={styles.doneBox}>
            <Mascot size={80} mood="celebrate" />
            <Text style={styles.doneTitle}>Full forge complete</Text>
            <Text style={styles.muted}>
              All six sessions done. Keep the rhythm with Coach.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <PaywallModal
        visible={paywall}
        loading={subscribing}
        onClose={() => setPaywall(false)}
        onSubscribe={onSubscribe}
      />
    </SafeAreaView>
  );
}

function SessionRow({
  session,
  onPress,
}: {
  session: PlanSession;
  onPress: () => void;
}) {
  const locked = session.status === 'locked';
  const completed = session.status === 'completed';
  const open = session.status === 'open';

  return (
    <Pressable
      onPress={onPress}
      disabled={locked}
      style={[
        styles.row,
        locked && styles.rowLocked,
        open && styles.rowOpen,
        completed && styles.rowDone,
      ]}
    >
      <View style={styles.rowTop}>
        <Text style={[styles.index, locked && styles.dimText]}>
          Session {session.index}
          {session.tier === 'premium' ? ' · Premium' : ''}
        </Text>
        <StatusBadge status={session.status} />
      </View>
      <Text style={[styles.rowTitle, locked && styles.dimText]}>
        {session.title}
      </Text>
      <Text style={[styles.rowSummary, locked && styles.dimText]}>
        {locked
          ? `Complete session ${session.index - 1} to unlock`
          : session.summary}
      </Text>
      {!locked ? (
        <Text style={styles.openHint}>
          {open ? 'Tap to start workout →' : 'Tap to review →'}
        </Text>
      ) : null}
    </Pressable>
  );
}

function StatusBadge({ status }: { status: PlanSession['status'] }) {
  if (status === 'completed') {
    return (
      <View style={[styles.badge, styles.badgeDone]}>
        <Ionicons name="checkmark" size={14} color={colors.open} />
        <Text style={[styles.badgeText, { color: colors.open }]}>Done</Text>
      </View>
    );
  }
  if (status === 'locked') {
    return (
      <View style={[styles.badge, styles.badgeLocked]}>
        <Ionicons name="lock-closed" size={13} color={colors.locked} />
        <Text style={[styles.badgeText, { color: colors.locked }]}>Locked</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.badgeOpen]}>
      <Text style={[styles.badgeText, { color: colors.open }]}>Open</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: space.xxl },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space.md,
  },
  email: { color: colors.textDim, marginTop: 4, fontSize: 13 },
  logout: { color: colors.textMuted, fontSize: 14, marginTop: 8 },
  premiumChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.premiumSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: space.md,
  },
  premiumText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  headline: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: space.sm,
    fontFamily: fonts.display,
  },
  sub: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: space.lg,
  },
  center: { alignItems: 'center', paddingVertical: space.xl, gap: space.sm },
  muted: { color: colors.textMuted, lineHeight: 21 },
  error: { color: colors.danger, marginBottom: space.md },
  row: {
    borderLeftWidth: 3,
    borderLeftColor: colors.line,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    marginBottom: space.md,
    backgroundColor: colors.bgElevated,
    borderRadius: 14,
  },
  rowLocked: { opacity: 0.78 },
  rowOpen: { borderLeftColor: colors.open, backgroundColor: colors.openSoft },
  rowDone: { borderLeftColor: colors.accent },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  index: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  rowTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  rowSummary: { color: colors.textMuted, lineHeight: 20, fontSize: 14 },
  openHint: {
    marginTop: space.sm,
    color: colors.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  dimText: { color: colors.textDim },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeDone: { backgroundColor: 'rgba(43,165,106,0.12)' },
  badgeLocked: { backgroundColor: 'rgba(138,161,151,0.18)' },
  badgeOpen: { backgroundColor: 'rgba(43,165,106,0.16)' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cta: {
    marginTop: space.sm,
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
  doneBox: {
    marginTop: space.sm,
    padding: space.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgElevated,
    alignItems: 'flex-start',
    gap: space.sm,
  },
  doneTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
  },
  unlockBtn: {
    marginTop: space.xs,
    backgroundColor: colors.ember,
    borderRadius: 12,
    paddingHorizontal: space.md,
    paddingVertical: 12,
  },
  unlockText: { color: colors.white, fontWeight: '700' },
});
