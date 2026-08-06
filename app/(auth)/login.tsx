import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthScreen, BrandMark, Button, Divider, TextField } from '../../src/components';
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

        <Button label={t('auth.signin')} fullWidth loading={login.isPending} onPress={handleSubmit(onSubmit)} />

        <Text style={[styles.hint, { color: theme.colors.textVar }]}>{t('auth.demo', { email: DEMO_EMAIL })}</Text>
      </View>

      <View style={styles.dividerRow}>
        <Divider />
        <Text style={[styles.or, { color: theme.colors.textVar, backgroundColor: theme.colors.bg }]}>{t('auth.or')}</Text>
      </View>

      <View style={styles.form}>
        <Button
          label={t('auth.google')}
          variant="secondary"
          icon="login"
          fullWidth
          onPress={() => showToast(t('auth.googleSoon'), 'info')}
        />
        <Button label={t('auth.guest')} variant="ghost" fullWidth loading={guest.isPending} onPress={onGuest} />
      </View>

      <View style={styles.footer}>
        <Text style={{ color: theme.colors.textVar }}>{t('auth.noAccount')}</Text>
        <Link href="/(auth)/register" asChild>
          <Pressable>
            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>{t('auth.signup')}</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 14 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 },
  form: { gap: 14 },
  forgot: { alignSelf: 'flex-end', fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 12, textAlign: 'center' },
  dividerRow: { justifyContent: 'center', alignItems: 'center' },
  or: { position: 'absolute', paddingHorizontal: 10, fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerLink: { fontWeight: '700' },
});
