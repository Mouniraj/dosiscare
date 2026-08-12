import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  AuthScreen,
  DateTimeField,
  Icon,
  TextField,
  type IconName,
} from '../../src/components';
import { COMMON_ALLERGIES, NO_ALLERGIES_LABEL } from '../../src/constants/allergies';
import { profileColors } from '../../src/theme/colors';
import { useToast } from '../../src/contexts/ToastContext';
import { useRegister } from '../../src/hooks/useAuth';
import { authErrorMessage } from '../../src/i18n/authError';
import { useTranslation } from '../../src/i18n/useTranslation';
import { useTheme } from '../../src/theme/useTheme';
import { ageFromBirthDate } from '../../src/utils/date';
import { makeRegisterSchema, type RegisterForm } from '../../src/validations/authSchemas';

const COMMON_LABELS = new Set(COMMON_ALLERGIES.map((a) => a.label));

/** Account + titular-profile creation. Required: name, DOB, email, password, confirm. */
export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const register = useRegister();

  const schema = useMemo(() => makeRegisterSchema(t), [t]);
  const { control, handleSubmit, watch, setValue } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      birthDate: '',
      weight: '',
      height: '',
      allergies: [],
      email: '',
      password: '',
      confirm: '',
    },
  });

  const [customAllergy, setCustomAllergy] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const w = watch();
  const age = w.birthDate ? ageFromBirthDate(w.birthDate) : null;
  const requiredOk =
    w.name?.trim().length >= 2 &&
    !!w.birthDate &&
    !!w.email &&
    (w.password?.length ?? 0) >= 6 &&
    w.password === w.confirm;
  const disabled = !requiredOk || register.isPending;

  const toggleAllergy = (label: string) => {
    const current = w.allergies ?? [];
    if (label === NO_ALLERGIES_LABEL) {
      setValue('allergies', current.includes(label) ? [] : [NO_ALLERGIES_LABEL], { shouldValidate: true });
      return;
    }
    const withoutNone = current.filter((a) => a !== NO_ALLERGIES_LABEL);
    setValue(
      'allergies',
      current.includes(label) ? withoutNone.filter((a) => a !== label) : [...withoutNone, label],
      { shouldValidate: true },
    );
  };

  const addCustomAllergy = () => {
    const value = customAllergy.trim();
    if (!value) return;
    const current = (w.allergies ?? []).filter((a) => a !== NO_ALLERGIES_LABEL);
    if (current.includes(value)) return;
    setValue('allergies', [...current, value]);
    setCustomAllergy('');
  };

  const removeCustomAllergy = (label: string) => {
    setValue('allergies', (w.allergies ?? []).filter((a) => a !== label));
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showToast('Permite el acceso a fotos', 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const onSubmit = (values: RegisterForm) => {
    const allergies = values.allergies ?? [];
    const noAllergies = allergies.includes(NO_ALLERGIES_LABEL);
    register.mutate(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        holder: {
          birthDate: values.birthDate,
          weight: values.weight ? Number(values.weight) : null,
          height: values.height ? Number(values.height) : null,
          allergy: noAllergies ? null : allergies.length > 0 ? allergies.join(', ') : null,
          photo: photoUri,
        },
      },
      {
        onSuccess: () => router.replace('/(app)'),
        onError: (error) => showToast(authErrorMessage(t, error), 'error'),
      },
    );
  };

  const selected = w.allergies ?? [];
  const initial = w.name?.trim()?.[0]?.toUpperCase() ?? '';
  const customSelected = selected.filter((a) => a !== NO_ALLERGIES_LABEL && !COMMON_LABELS.has(a));

  return (
    <AuthScreen>
      <Pressable
        onPress={() => router.replace('/(auth)/login')}
        accessibilityRole="button"
        accessibilityLabel="Atrás"
        hitSlop={12}
        style={styles.back}
      >
        <Icon name="arrow-back" size={24} color={theme.colors.text} />
      </Pressable>

      <View style={styles.hero}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('auth.createAccount')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textVar }]}>{t('auth.registerSubtitle')}</Text>
      </View>

      <PhotoTile photoUri={photoUri} initial={initial} onPress={pickPhoto} onRemove={() => setPhotoUri(null)} />

      <View style={styles.form}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <TextField
              label={`${t('auth.name')} *`}
              placeholder={t('auth.namePlaceholder')}
              icon="person"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <View style={styles.row}>
          <View style={styles.rowGrow}>
            <Controller
              control={control}
              name="birthDate"
              render={({ field: { onChange, value }, fieldState }) => (
                <DateTimeField
                  label={`${t('auth.birthDate')} *`}
                  mode="date"
                  value={value}
                  onChange={onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>
          <View style={styles.ageBox}>
            <Text style={[styles.miniLabel, { color: theme.colors.textVar }]}>{t('auth.age')}</Text>
            <View style={[styles.ageValue, { borderColor: theme.colors.outline, backgroundColor: theme.colors.bg }]}>
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '700' }}>
                {age !== null ? String(age) : '—'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowGrow}>
            <Controller
              control={control}
              name="weight"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label={t('auth.weight')}
                  placeholder="0"
                  suffix="kg"
                  keyboardType="numeric"
                  value={value ?? ''}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
          <View style={styles.rowGrow}>
            <Controller
              control={control}
              name="height"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label={t('auth.height')}
                  placeholder="0"
                  suffix="cm"
                  keyboardType="numeric"
                  value={value ?? ''}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('auth.allergiesQ')}</Text>
          <Text style={[styles.sectionSub, { color: theme.colors.textVar }]}>{t('auth.allergiesSub')}</Text>
          <View style={styles.chips}>
            {COMMON_ALLERGIES.map((a) => (
              <AllergyChip
                key={a.id}
                label={a.label}
                icon={a.icon}
                selected={selected.includes(a.label)}
                onPress={() => toggleAllergy(a.label)}
              />
            ))}
            <AllergyChip
              label={NO_ALLERGIES_LABEL}
              icon="check-circle"
              selected={selected.includes(NO_ALLERGIES_LABEL)}
              onPress={() => toggleAllergy(NO_ALLERGIES_LABEL)}
            />
            {customSelected.map((label, i) => (
              <CustomChip
                key={label}
                label={label}
                color={profileColors[i % profileColors.length]}
                onRemove={() => removeCustomAllergy(label)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionSub, { color: theme.colors.text, fontWeight: '600' }]}>
            {t('auth.allergyOther')}
          </Text>
          <View style={styles.customRow}>
            <View style={[styles.customInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
              <TextInput
                style={{ color: theme.colors.text, fontSize: 14, paddingVertical: 0 }}
                placeholder={t('auth.allergyOtherPh')}
                placeholderTextColor={theme.colors.textVar}
                value={customAllergy}
                onChangeText={setCustomAllergy}
                onSubmitEditing={addCustomAllergy}
                returnKeyType="done"
              />
            </View>
            <Pressable
              onPress={addCustomAllergy}
              disabled={!customAllergy.trim()}
              style={({ pressed }) => [
                styles.addBtn,
                {
                  backgroundColor: customAllergy.trim() ? '#2f394a' : theme.colors.bg,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={{ color: customAllergy.trim() ? '#fff' : theme.colors.textVar, fontWeight: '700', fontSize: 13 }}>
                {t('auth.addChip')}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

        <Text style={[styles.title, { color: theme.colors.text, fontSize: 20, marginTop: -6 }]}>
          {t('auth.accessData')}
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <TextField
              label={`${t('auth.email')} *`}
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
              label={`${t('auth.password')} *`}
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
              label={`${t('auth.confirmPassword')} *`}
              placeholder={t('auth.confirmPlaceholder')}
              icon="lock-reset"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t('auth.register')}
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
          {register.isPending ? (
            <ActivityIndicator color={disabled ? theme.colors.primary : '#ffffff'} />
          ) : (
            <Text style={[styles.ctaLabel, { color: disabled ? theme.colors.textVar : '#ffffff' }]}>
              {t('auth.register')}
            </Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={{ color: theme.colors.textVar }}>{t('auth.haveAccount')}</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>{t('auth.signinLink')}</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </AuthScreen>
  );
}

function PhotoTile({
  photoUri,
  initial,
  onPress,
  onRemove,
}: {
  photoUri: string | null;
  initial: string;
  onPress: () => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('auth.photoTapAdd')}
      style={styles.photoRow}
    >
      <View style={styles.photoWrap}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoTileImage} />
        ) : initial ? (
          <View style={[styles.photoTile, { backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800' }}>{initial}</Text>
          </View>
        ) : (
          <View style={[styles.photoTile, { backgroundColor: theme.colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }]}>
            <Icon name="add-a-photo" size={26} color={theme.colors.primary} />
          </View>
        )}
        <View style={[styles.photoBadge, { backgroundColor: theme.colors.primary }]}>
          <Icon name={photoUri ? 'edit' : 'photo-camera'} size={12} color="#ffffff" />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '700' }}>{t('auth.photoTapAdd')}</Text>
        <Text style={{ color: theme.colors.textVar, fontSize: 12, marginTop: 4, lineHeight: 16 }}>
          {t('auth.photoHint')}
        </Text>
        {photoUri ? (
          <Pressable onPress={onRemove} hitSlop={8} style={{ marginTop: 6 }}>
            <Text style={{ color: theme.status.danger, fontSize: 12, fontWeight: '700' }}>Quitar foto</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

function AllergyChip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.aChip,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
        },
      ]}
    >
      <Icon name={icon} size={14} color={selected ? '#ffffff' : theme.colors.text} />
      <Text style={{ color: selected ? '#ffffff' : theme.colors.text, fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

function CustomChip({ label, color, onRemove }: { label: string; color: string; onRemove: () => void }) {
  return (
    <View style={[styles.aChip, { backgroundColor: color, borderColor: color }]}>
      <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700' }}>{label}</Text>
      <Pressable onPress={onRemove} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Quitar ${label}`}>
        <Icon name="close" size={14} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', minWidth: 44, minHeight: 44, alignItems: 'flex-start', justifyContent: 'center' },
  hero: { gap: 8 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6, lineHeight: 32 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  form: { gap: 14 },
  row: { flexDirection: 'row', gap: 12 },
  rowGrow: { flex: 1 },
  ageBox: { width: 84 },
  miniLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  ageValue: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  photoWrap: { position: 'relative', width: 72, height: 72 },
  photoTile: { width: 72, height: 72, borderRadius: 18 },
  photoTileImage: { width: 72, height: 72, borderRadius: 18 },
  photoBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  section: { gap: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '700' },
  sectionSub: { fontSize: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  aChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1,
  },
  customRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  customInput: { flex: 1, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, justifyContent: 'center', minHeight: 50 },
  addBtn: {
    borderRadius: 14,
    minHeight: 50,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, marginVertical: 8 },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    paddingVertical: 16,
    minHeight: 54,
    marginTop: 6,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 4,
  },
  ctaLabel: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerLink: { fontWeight: '700' },
});
