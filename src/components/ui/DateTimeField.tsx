import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDateShort } from '../../utils/date';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../i18n/useTranslation';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

type Mode = 'date' | 'time';

interface DateTimeFieldProps {
  label?: string;
  mode: Mode;
  /** ISO date "YYYY-MM-DD" (date mode) or "HH:MM" (time mode). */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: IconName;
}

const pad = (n: number) => n.toString().padStart(2, '0');

function toDate(value: string, mode: Mode): Date {
  if (mode === 'date') {
    const [y, m, d] = value.split('-').map(Number);
    if (y && m && d) return new Date(y, m - 1, d);
    return new Date();
  }
  const [h, min] = value.split(':').map(Number);
  const base = new Date();
  base.setHours(Number.isNaN(h) ? 8 : h, Number.isNaN(min) ? 0 : min, 0, 0);
  return base;
}

function fromDate(date: Date, mode: Mode): string {
  return mode === 'date'
    ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Field that opens the native date/time picker and emits app-standard strings. */
export function DateTimeField({ label, mode, value, onChange, error, icon }: DateTimeFieldProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [iosOpen, setIosOpen] = useState(false);

  const display = mode === 'date' ? (value ? formatDateShort(value) : '—') : value || '—';
  const fieldIcon: IconName = icon ?? (mode === 'date' ? 'event' : 'schedule');

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: toDate(value, mode),
        mode,
        is24Hour: true,
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChange(fromDate(date, mode));
        },
      });
    } else {
      setIosOpen(true);
    }
  };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: theme.colors.textVar }]}>{label}</Text> : null}
      <Pressable
        onPress={open}
        accessibilityRole="button"
        style={[styles.field, { backgroundColor: theme.colors.surface, borderColor: error ? theme.status.danger : theme.colors.outline }]}
      >
        <Icon name={fieldIcon} size={19} color={theme.colors.textVar} />
        <Text style={[styles.value, { color: value ? theme.colors.text : theme.colors.textVar }]}>{display}</Text>
        <Icon name="expand-more" size={20} color={theme.colors.textVar} />
      </Pressable>
      {error ? <Text style={[styles.error, { color: theme.status.danger }]}>{error}</Text> : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={iosOpen} transparent animationType="fade" onRequestClose={() => setIosOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setIosOpen(false)}>
            <Pressable style={[styles.sheet, { backgroundColor: theme.colors.surface }]} onPress={(e) => e.stopPropagation()}>
              <DateTimePicker
                value={toDate(value, mode)}
                mode={mode}
                is24Hour
                display="spinner"
                onChange={(_e, date) => {
                  if (date) onChange(fromDate(date, mode));
                }}
              />
              <Button label={t('common.save')} fullWidth onPress={() => setIosOpen(false)} />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', marginLeft: 2 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  value: { flex: 1, fontSize: 15, textTransform: 'capitalize' },
  error: { fontSize: 12, marginLeft: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(6,10,16,0.45)', justifyContent: 'flex-end' },
  sheet: { padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, gap: 12 },
});
