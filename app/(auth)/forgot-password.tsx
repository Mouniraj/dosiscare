import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { AuthScreen, Button, Header, TextField } from '../../src/components';
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

  const titles: Record<Step, { title: string; subtitle: string }> = {
    email: { title: t('auth.recoverTitle'), subtitle: t('auth.recoverSub') },
    code: { title: t('auth.verifyTitle'), subtitle: t('auth.verifySub', { email }) },
    password: { title: t('auth.newPasswordTitle'), subtitle: t('auth.newPasswordSub') },
  };

  return (
    <>
      <Header title={titles[step].title} onBack={() => router.back()} />
      <AuthScreen>
        <Text style={[styles.subtitle, { color: theme.colors.textVar }]}>{titles[step].subtitle}</Text>

        {step === 'email' && (
          <View style={styles.form}>
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
            <Button
              label={t('auth.sendCode')}
              fullWidth
              loading={requestReset.isPending}
              onPress={emailForm.handleSubmit(submitEmail)}
            />
          </View>
        )}

        {step === 'code' && (
          <View style={styles.form}>
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
            <Text style={[styles.hint, { color: theme.colors.textVar }]}>{t('auth.codeDemo', { code: DEMO_RESET_CODE })}</Text>
            <Button label={t('auth.verify')} fullWidth onPress={codeForm.handleSubmit(submitCode)} />
          </View>
        )}

        {step === 'password' && (
          <View style={styles.form}>
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
            <Button
              label={t('auth.savePassword')}
              fullWidth
              loading={resetPassword.isPending}
              onPress={passwordForm.handleSubmit(submitPassword)}
            />
          </View>
        )}
      </AuthScreen>
    </>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, lineHeight: 20 },
  form: { gap: 14 },
  hint: { fontSize: 12 },
});
