import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import ModalSheet from './ModalSheet';
import { COLOR_SCHEMES, DEFAULT_SCHEME } from '../../constants/colorSchemes';
import { useAppStore } from '../../store/appStore';
import {
  getCharacterBackups,
  getCampaignBackups,
  restoreCharacterBackup,
  restoreCampaignBackup,
} from '../../utils/storage';
import { Backup, Character, Campaign } from '../../types';
import GlassButton from '../ui/GlassButton';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: Props) {
  const scheme = COLOR_SCHEMES[DEFAULT_SCHEME];
  const {
    characters,
    campaigns,
    activeCharacterId,
    activeCampaignId,
    removeCharacter,
    removeCampaign,
    initialize,
  } = useAppStore();

  const [charBackups, setCharBackups] = useState<Backup<Character>[]>([]);
  const [campBackups, setCampBackups] = useState<Backup<Campaign>[]>([]);

  useEffect(() => {
    if (!visible) return;
    if (activeCharacterId) {
      getCharacterBackups(activeCharacterId).then(setCharBackups);
    } else {
      setCharBackups([]);
    }
    if (activeCampaignId) {
      getCampaignBackups(activeCampaignId).then(setCampBackups);
    } else {
      setCampBackups([]);
    }
  }, [visible, activeCharacterId, activeCampaignId]);

  const handleRestoreChar = (index: number) => {
    if (!activeCharacterId) return;
    Alert.alert(
      'Restore Backup',
      `Restore character to this backup? Your current data will become a new backup.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            await restoreCharacterBackup(activeCharacterId, index);
            await initialize();
            getCharacterBackups(activeCharacterId).then(setCharBackups);
          },
        },
      ]
    );
  };

  const handleRestoreCamp = (index: number) => {
    if (!activeCampaignId) return;
    Alert.alert(
      'Restore Backup',
      `Restore campaign to this backup? Your current data will become a new backup.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            await restoreCampaignBackup(activeCampaignId, index);
            await initialize();
            getCampaignBackups(activeCampaignId).then(setCampBackups);
          },
        },
      ]
    );
  };

  const handleDeleteChar = () => {
    if (!activeCharacterId) return;
    const char = characters[activeCharacterId];
    Alert.alert(
      'Delete Character',
      `Permanently delete "${char?.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeCharacter(activeCharacterId);
            onClose();
          },
        },
      ]
    );
  };

  const handleDeleteCamp = () => {
    if (!activeCampaignId) return;
    const camp = campaigns[activeCampaignId];
    Alert.alert(
      'Delete Campaign',
      `Permanently delete "${camp?.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeCampaign(activeCampaignId);
            onClose();
          },
        },
      ]
    );
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <ModalSheet visible={visible} onClose={onClose} maxHeight="80%">
      <View style={styles.header}>
              <Text style={styles.title}>Settings</Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.close, { color: scheme.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* ── Character Backups ──────────────── */}
              {activeCharacterId && characters[activeCharacterId] && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: scheme.text }]}>
                    Character Backups
                  </Text>
                  <Text style={[styles.sectionSub, { color: scheme.textSecondary }]}>
                    {characters[activeCharacterId].name} · up to 5 auto-saves
                  </Text>
                  {charBackups.length === 0 ? (
                    <Text style={[styles.empty, { color: scheme.textMuted }]}>
                      No backups yet.
                    </Text>
                  ) : null}
                  {charBackups.map((b, i) => (
                    <View
                      key={b.timestamp}
                      style={[
                        styles.backupRow,
                        { borderBottomColor: scheme.surfaceBorder },
                      ]}
                    >
                      <Text style={[styles.backupDate, { color: scheme.textSecondary }]}>
                        {formatDate(b.timestamp)}
                      </Text>
                      <GlassButton
                        label="Restore"
                        onPress={() => handleRestoreChar(i)}
                        scheme={scheme}
                        variant="secondary"
                        small
                      />
                    </View>
                  ))}
                </View>
              )}

              {/* ── Campaign Backups ───────────────── */}
              {activeCampaignId && campaigns[activeCampaignId] && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: scheme.text }]}>
                    Campaign Backups
                  </Text>
                  <Text style={[styles.sectionSub, { color: scheme.textSecondary }]}>
                    {campaigns[activeCampaignId].name} · up to 5 auto-saves
                  </Text>
                  {campBackups.length === 0 ? (
                    <Text style={[styles.empty, { color: scheme.textMuted }]}>
                      No backups yet.
                    </Text>
                  ) : null}
                  {campBackups.map((b, i) => (
                    <View
                      key={b.timestamp}
                      style={[
                        styles.backupRow,
                        { borderBottomColor: scheme.surfaceBorder },
                      ]}
                    >
                      <Text style={[styles.backupDate, { color: scheme.textSecondary }]}>
                        {formatDate(b.timestamp)}
                      </Text>
                      <GlassButton
                        label="Restore"
                        onPress={() => handleRestoreCamp(i)}
                        scheme={scheme}
                        variant="secondary"
                        small
                      />
                    </View>
                  ))}
                </View>
              )}

              {/* ── Danger Zone ────────────────────── */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: scheme.destructive }]}>
                  Danger Zone
                </Text>
                <View style={styles.dangerBtns}>
                  {activeCharacterId && characters[activeCharacterId] && (
                    <GlassButton
                      label={`Delete Character`}
                      onPress={handleDeleteChar}
                      scheme={scheme}
                      variant="destructive"
                    />
                  )}
                  {activeCampaignId && campaigns[activeCampaignId] && (
                    <GlassButton
                      label={`Delete Campaign`}
                      onPress={handleDeleteCamp}
                      scheme={scheme}
                      variant="destructive"
                    />
                  )}
                  {!activeCharacterId && !activeCampaignId && (
                    <Text style={[styles.empty, { color: scheme.textMuted }]}>
                      Open a character or campaign to see deletion options.
                    </Text>
                  )}
                </View>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#e8eeff',
  },
  close: {
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 12,
  },
  empty: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  backupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backupDate: {
    fontSize: 13,
    flex: 1,
  },
  dangerBtns: {
    gap: 10,
  },
});
