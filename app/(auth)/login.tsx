import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthScreen, BrandMark, TextField } from '../../src/components';
import { useToast } from '../../src/contexts/ToastContext';
import { useGuestLogin, useLogin } from '../../src/hooks/useAuth';
import { authErrorMessage } from '../../src/i18n/authError';
import { useTranslation } from '../../src/i18n/useTranslation';
import { DEMO_EMAIL } from '../../src/services/AuthService';
import { useTheme } from '../../src/theme/useTheme';
import { makeLoginSchema, type LoginForm } from '../../src/validations/authSchemas';

/** Login = the prototype's welcome screen: brand hero + credentials + guest/Google. */
export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const login = useLogin();
  const guest = useGuestLogin();

  const schema = useMemo(() => makeLoginSchema(t), [t]);
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginForm) => {
    login.mutate(values, {
      onSuccess: () => router.replace('/(app)'),
      onError: (error) => showToast(authErrorMessage(t, error), 'error'),
    });
  };

  const onGuest = () => {
    guest.mutate(undefined, {
      onSuccess: () => router.replace('/(app)'),
      onError: (error) => showToast(authErrorMessage(t, error), 'error'),
    });
  };

  return (
    <AuthScreen>
      <View style={styles.hero}>
        <BrandMark />
        <Text style={[styles.subtitle, { color: theme.colors.textVar }]}>{t('auth.subtitle')}</Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <TextField
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              icon="mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <TextField
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              icon="lock"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Link href="/(auth)/forgot-password" style={[styles.forgot, { color: theme.colors.primary }]}>
          {t('auth.forgot')}
        </Link>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('auth.signin')}
          onPress={handleSubmit(onSubmit)}
          disabled={login.isPending}
          style={({ pressed }) => [
            styles.primary,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
              opacity: login.isPending ? 0.7 : pressed ? 0.92 : 1,
              transform: pressed && !login.isPending ? [{ scale: 0.99 }] : undefined,
            },
          ]}
        >
          {login.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryLabel}>{t('auth.signin')}</Text>
          )}
        </Pressable>

        <Text style={[styles.hint, { color: theme.colors.textVar }]}>{t('auth.demo', { email: DEMO_EMAIL })}</Text>
      </View>

      <View style={styles.dot}>
        <View style={[styles.dotMark, { borderColor: theme.colors.outline }]} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('auth.google')}
        onPress={() => showToast(t('auth.googleSoon'), 'info')}
        style={({ pressed }) => [
          styles.google,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <Text style={[styles.googleG, { color: theme.colors.primary }]}>G</Text>
        <Text style={[styles.googleLabel, { color: theme.colors.text }]}>{t('auth.google')}</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={{ color: theme.colors.textVar }}>{t('auth.noAccount')} </Text>
        <Link href="/(auth)/register" asChild>
          <Pressable>
            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>{t('auth.signup')}</Text>
          </Pressable>
        </Link>
        <Text style={{ color: theme.colors.outline }}> · </Text>
        <Pressable onPress={onGuest} disabled={guest.isPending} accessibilityRole="button">
          <Text style={[styles.footerLink, { color: theme.colors.textVar, opacity: guest.isPending ? 0.5 : 1 }]}>
            {t('auth.guest')}
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 14 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 },
  form: { gap: 14 },
  forgot: { alignSelf: 'flex-end', fontSize: 13, fontWeight: '600' },
  primary: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    paddingVertical: 16,
    minHeight: 54,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 6,
  },
  primaryLabel: { color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  hint: { fontSize: 12, textAlign: 'center' },
  dot: { alignItems: 'center', paddingVertical: 8 },
  dotMark: { width: 8, height: 8, borderRadius: 8, borderWidth: 1.5 },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 100,
    paddingVertical: 15,
    minHeight: 52,
    borderWidth: 1,
  },
  googleG: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  googleLabel: { fontSize: 15, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 },
  footerLink: { fontWeight: '700' },
});
