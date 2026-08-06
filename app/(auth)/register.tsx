import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthScreen, BrandMark, Button, Header, TextField } from '../../src/components';
import { useToast } from '../../src/contexts/ToastContext';
import { useRegister } from '../../src/hooks/useAuth';
import { authErrorMessage } from '../../src/i18n/authError';
import { useTranslation } from '../../src/i18n/useTranslation';
import { useTheme } from '../../src/theme/useTheme';
import { makeRegisterSchema, type RegisterForm } from '../../src/validations/authSchemas';

/** Account creation. On success we route to Onboarding, then into the app. */
export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const register = useRegister();

  const schema = useMemo(() => makeRegisterSchema(t), [t]);
  const { control, handleSubmit } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirm: '' },
  });

  const onSubmit = (values: RegisterForm) => {
    register.mutate(
      { name: values.name, email: values.email, password: values.password },
      {
        onSuccess: () => router.replace('/(auth)/onboarding'),
        onError: (error) => showToast(authErrorMessage(t, error), 'error'),
      },
    );
  };

  return (
    <>
      <Header title={t('auth.createAccount')} onBack={() => router.back()} />
      <AuthScreen>
        <View style={styles.hero}>
          <BrandMark size="sm" />
          <Text style={[styles.subtitle, { color: theme.colors.textVar }]}>{t('auth.registerSubtitle')}</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <TextField
                label={t('auth.name')}
                placeholder={t('auth.namePlaceholder')}
                icon="person"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
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
                placeholder={t('auth.minPassword')}
                icon="lock"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirm"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <TextField
                label={t('auth.confirmPassword')}
                placeholder={t('auth.confirmPlaceholder')}
                icon="lock"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message}
              />
            )}
          />

          <Button label={t('auth.register')} fullWidth loading={register.isPending} onPress={handleSubmit(onSubmit)} />
        </View>

        <View style={styles.footer}>
          <Text style={{ color: theme.colors.textVar }}>{t('auth.haveAccount')}</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>{t('auth.signinLink')}</Text>
            </Pressable>
          </Link>
        </View>
      </AuthScreen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 12 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  form: { gap: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerLink: { fontWeight: '700' },
});
