import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthScreen, Icon, TextField, type IconName } from '../../src/components';
import { useToast } from '../../src/contexts/ToastContext';
import { useRequestPasswordReset, useResetPassword } from '../../src/hooks/useAuth';
import { authErrorMessage } from '../../src/i18n/authError';
import { useTranslation } from '../../src/i18n/useTranslation';
import { AuthError, DEMO_RESET_CODE } from '../../src/services/AuthService';
import { useTheme } from '../../src/theme/useTheme';
import {
  makeNewPasswordSchema,
  makeRecoverCodeSchema,
  makeRecoverEmailSchema,
  type NewPasswordForm,
  type RecoverCodeForm,
  type RecoverEmailForm,
} from '../../src/validations/authSchemas';

type Step = 'email' | 'code' | 'password';

const STEP_ICONS: Record<Step, IconName> = {
  email: 'lock-reset',
  code: 'mark-email-read',
  password: 'lock',
};

/** Password recovery: email → verification code → new password (Offline First). */
export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const requestReset = useRequestPasswordReset();
  const resetPassword = useResetPassword();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const emailForm = useForm<RecoverEmailForm>({
    resolver: zodResolver(useMemo(() => makeRecoverEmailSchema(t), [t])),
    defaultValues: { email: '' },
  });
  const codeForm = useForm<RecoverCodeForm>({
    resolver: zodResolver(useMemo(() => makeRecoverCodeSchema(t), [t])),
    defaultValues: { code: '' },
  });
  const passwordForm = useForm<NewPasswordForm>({
    resolver: zodResolver(useMemo(() => makeNewPasswordSchema(t), [t])),
    defaultValues: { password: '', confirm: '' },
  });

  // Track live form values to enable/disable the CTA without submitting.
  const emailValue = emailForm.watch('email');
  const codeValue = codeForm.watch('code');
  const pwValue = passwordForm.watch('password');
  const confirmValue = passwordForm.watch('confirm');

  const submitEmail = (values: RecoverEmailForm) => {
    requestReset.mutate(values.email, {
      onSuccess: () => {
        setEmail(values.email);
        setStep('code');
        showToast(t('auth.codeSent'), 'info');
      },
      onError: (error) => showToast(authErrorMessage(t, error), 'error'),
    });
  };

  const submitCode = (values: RecoverCodeForm) => {
    setCode(values.code);
    setStep('password');
  };

  const submitPassword = (values: NewPasswordForm) => {
    resetPassword.mutate(
      { email, code, password: values.password },
      {
        onSuccess: () => {
          showToast(t('auth.passwordUpdated'), 'success');
          router.replace('/(auth)/login');
        },
        onError: (error) => {
          showToast(authErrorMessage(t, error), 'error');
          if (error instanceof AuthError && error.code === 'invalidCode') setStep('code');
        },
      },
    );
  };

  const stepMeta: Record<Step, { title: string; subtitle: string; cta: string }> = {
    email: { title: t('auth.recoverTitle'), subtitle: t('auth.recoverSub'), cta: t('auth.sendCode') },
    code: { title: t('auth.verifyTitle'), subtitle: t('auth.verifySub', { email }), cta: t('auth.verify') },
    password: { title: t('auth.newPasswordTitle'), subtitle: t('auth.newPasswordSub'), cta: t('auth.savePassword') },
  };

  const isPending = requestReset.isPending || resetPassword.isPending;
  const canSubmit =
    (step === 'email' && emailValue?.length > 0) ||
    (step === 'code' && codeValue?.length > 0) ||
    (step === 'password' && pwValue?.length > 0 && confirmValue?.length > 0);
  const disabled = !canSubmit || isPending;

  const onBack = () => router.replace('/(auth)/login');

  const onSubmit = () => {
    if (step === 'email') return emailForm.handleSubmit(submitEmail)();
    if (step === 'code') return codeForm.handleSubmit(submitCode)();
    return passwordForm.handleSubmit(submitPassword)();
  };

  return (
    <AuthScreen>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Atrás"
        hitSlop={12}
        style={styles.back}
      >
        <Icon name="arrow-back" size={24} color={theme.colors.text} />
      </Pressable>

      <View style={styles.hero}>
        <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
          <Icon name={STEP_ICONS[step]} size={22} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>{stepMeta[step].title}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textVar }]}>{stepMeta[step].subtitle}</Text>
      </View>

      <View style={styles.form}>
        {step === 'email' && (
          <Controller
            control={emailForm.control}
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
        )}

        {step === 'code' && (
          <>
            <Controller
              control={codeForm.control}
              name="code"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <TextField
                  label={t('auth.code')}
                  placeholder={t('auth.codePlaceholder')}
                  icon="pin"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Text style={[styles.hint, { color: theme.colors.textVar }]}>
              {t('auth.codeDemo', { code: DEMO_RESET_CODE })}
            </Text>
          </>
        )}

        {step === 'password' && (
          <>
            <Controller
              control={passwordForm.control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <TextField
                  label={t('auth.newPasswordTitle')}
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
              control={passwordForm.control}
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
          </>
        )}
      </View>

      <Pressable
        onPress={onSubmit}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={stepMeta[step].cta}
        style={({ pressed }) => [
          styles.cta,
          {
            backgroundColor: disabled ? theme.colors.primaryContainer : theme.colors.primary,
            shadowColor: theme.colors.primary,
            shadowOpacity: disabled ? 0 : 0.28,
            opacity: disabled ? 1 : pressed ? 0.92 : 1,
          },
        ]}
      >
        {isPending ? (
          <ActivityIndicator color={disabled ? theme.colors.primary : '#ffffff'} />
        ) : (
          <Text
            style={[styles.ctaLabel, { color: disabled ? theme.colors.textVar : '#ffffff' }]}
          >
            {stepMeta[step].cta}
          </Text>
        )}
      </Pressable>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', minWidth: 44, minHeight: 44, alignItems: 'flex-start', justifyContent: 'center' },
  hero: { gap: 10 },
  badge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6, lineHeight: 32 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  form: { gap: 14 },
  hint: { fontSize: 12, textAlign: 'center' },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    paddingVertical: 16,
    minHeight: 54,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 4,
  },
  ctaLabel: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});
