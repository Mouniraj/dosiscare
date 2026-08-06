import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  ActionRow,
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  Chip,
  ConfirmDialog,
  Divider,
  EmptyState,
  Header,
  ListItem,
  Loader,
  SearchBar,
  SegmentedControl,
  Text,
  TextField,
  Toggle,
} from '../src/components';
import { useToast } from '../src/contexts/ToastContext';
import { useSettingsStore } from '../src/store/settingsStore';
import { useTheme } from '../src/theme/useTheme';

/**
 * Component catalog — a living reference of the Phase 2 UI library.
 * Also exercises theme switching and toasts end to end.
 */
export default function CatalogScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const setTheme = useSettingsStore((s) => s.setTheme);

  const [search, setSearch] = useState('');
  const [toggle, setToggle] = useState(true);
  const [segment, setSegment] = useState<'day' | 'week' | 'month'>('day');
  const [selectedChip, setSelectedChip] = useState('Fiebre');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top']}>
      <Header
        title="Catálogo de componentes"
        subtitle="Fase 2 · librería UI"
        onBack={() => router.back()}
        actions={[
          {
            icon: theme.mode === 'dark' ? 'light-mode' : 'dark-mode',
            accessibilityLabel: 'Cambiar tema',
            onPress: () => setTheme(theme.mode === 'dark' ? 'light' : 'dark'),
          },
        ]}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Botones">
          <View style={styles.rowWrap}>
            <Button label="Primary" onPress={() => showToast('Guardado ✓')} />
            <Button label="Secondary" variant="secondary" onPress={() => {}} />
            <Button label="Ghost" variant="ghost" onPress={() => {}} />
            <Button label="Danger" variant="danger" onPress={() => {}} />
          </View>
          <Button label="Con icono" icon="add" fullWidth onPress={() => {}} />
          <Button label="Cargando" loading fullWidth onPress={() => {}} />
        </Section>

        <Section title="Campos de texto">
          <TextField label="Correo" placeholder="ana@correo.com" icon="mail" keyboardType="email-address" />
          <TextField label="Contraseña" placeholder="••••••" icon="lock" secureTextEntry error="Campo obligatorio" />
          <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar medicamento" />
        </Section>

        <Section title="Selector segmentado">
          <SegmentedControl
            value={segment}
            onChange={setSegment}
            options={[
              { value: 'day', label: 'Día' },
              { value: 'week', label: 'Semana' },
              { value: 'month', label: 'Mes' },
            ]}
          />
        </Section>

        <Section title="Avatares y badges">
          <View style={styles.rowWrap}>
            <Avatar initial="S" color="#2f6bed" />
            <Avatar initial="M" color="#17a673" />
            <Avatar initial="R" color="#f5931f" />
          </View>
          <View style={styles.rowWrap}>
            <Badge label="Administrada" tone="ok" icon="check" />
            <Badge label="Pendiente" tone="warn" icon="schedule" />
            <Badge label="Programada" tone="info" icon="event" />
            <Badge label="Omitida" tone="danger" />
          </View>
        </Section>

        <Section title="Chips">
          <View style={styles.rowWrap}>
            {['Fiebre', 'Dolor de cabeza', 'Tos seca', 'Vómitos'].map((s) => (
              <Chip key={s} label={s} selected={selectedChip === s} onPress={() => setSelectedChip(s)} />
            ))}
          </View>
        </Section>

        <Section title="Tarjeta + acciones + toggle">
          <Card>
            <View style={styles.cardHead}>
              <Text variant="heading">Paracetamol Jarabe</Text>
              <Toggle value={toggle} onValueChange={setToggle} />
            </View>
            <Text muted style={{ marginTop: 4 }}>
              5 ml · cada 8 h · inicia 08:00
            </Text>
            <Divider spacing={14} />
            <ActionRow
              actions={['view', 'edit', 'duplicate', 'delete']}
              onAction={(a) => (a === 'delete' ? setConfirmOpen(true) : showToast(`Acción: ${a}`, 'info'))}
            />
          </Card>
        </Section>

        <Section title="List items">
          <ListItem title="Historial" subtitle="Dosis pasadas" leadingIcon="history" showChevron onPress={() => {}} />
          <ListItem title="Ajustes" subtitle="Idioma, tema, sonidos" leadingIcon="settings" showChevron onPress={() => {}} />
          <ListItem
            title="Ana Martínez"
            subtitle="Titular"
            leading={<Avatar initial="A" color="#7c5cff" size={40} />}
            showChevron
            onPress={() => {}}
          />
        </Section>

        <Section title="Overlays">
          <View style={styles.rowWrap}>
            <Button label="Bottom sheet" variant="secondary" onPress={() => setSheetOpen(true)} />
            <Button label="Confirmar borrado" variant="danger" onPress={() => setConfirmOpen(true)} />
          </View>
        </Section>

        <Section title="Estados">
          <Loader fill={false} />
          <EmptyState
            icon="medication"
            title="Sin medicamentos"
            message="Agrega el primer medicamento para ver sus alarmas aquí."
            actionLabel="Agregar"
            onAction={() => showToast('Nuevo medicamento', 'info')}
          />
        </Section>
      </ScrollView>

      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Detalle de dosis">
        <Text muted>Ejemplo de hoja inferior para detalles y formularios rápidos.</Text>
        <View style={{ height: 12 }} />
        <Button label="Cerrar" fullWidth onPress={() => setSheetOpen(false)} />
      </BottomSheet>

      <ConfirmDialog
        visible={confirmOpen}
        title="Eliminar medicamento"
        message="Esta acción no se puede deshacer. ¿Deseas continuar?"
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => {
          setConfirmOpen(false);
          showToast('Eliminado ✓', 'success');
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text variant="overline" color={theme.colors.textVar}>
        {title}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 8, paddingBottom: 48 },
  section: { marginTop: 18 },
  sectionBody: { marginTop: 10, gap: 12 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
