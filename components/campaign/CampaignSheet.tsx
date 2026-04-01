import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { COLOR_SCHEMES } from '../../constants/colorSchemes';
import { Campaign, AdditionalListComponent } from '../../types';
import { useAppStore } from '../../store/appStore';
import GlassCard from '../ui/GlassCard';
import CollapsibleSection from '../ui/CollapsibleSection';
import TextContentRow from '../ui/TextContentRow';
import NamedItemRow from './NamedItemRow';
import AddItemRow from './AddItemRow';

type ListKey = 'currentSceneEvents' | 'npcs' | 'locations' | 'scenes';

interface Props {
  campaign: Campaign;
  isStandalone?: boolean;
  schemeOverride?: import('../../constants/colorSchemes').ColorScheme;
}

interface CollapsedState {
  [key: string]: boolean;
}

type AddingState = {
  key: ListKey | string | null;
  isCustomList?: boolean;
};

export default function CampaignSheet({ campaign, isStandalone, schemeOverride }: Props) {
  const scheme = schemeOverride ?? COLOR_SCHEMES[campaign.colorScheme];
  const {
    updateCampaignField,
    addCampaignListItem,
    updateCampaignListItem,
    removeCampaignListItem,
    updateCampaignComponentText,
    addCampaignComponentListItem,
    updateCampaignComponentListItem,
    removeCampaignComponentListItem,
  } = useAppStore();

  const [collapsed, setCollapsed] = useState<CollapsedState>({
    currentSceneEvents: false,
    npcs: true,
    locations: true,
    scenes: true,
  });
  const [adding, setAdding] = useState<AddingState>({ key: null });

  const toggle = (key: string) =>
    setCollapsed((s) => ({ ...s, [key]: !s[key] }));

  const startAdding = (key: ListKey | string, isCustomList = false) => {
    setAdding({ key, isCustomList });
  };

  const stopAdding = () => setAdding({ key: null });

  const LISTS: { key: ListKey; label: string; accentColor?: string }[] = [
    { key: 'currentSceneEvents', label: 'Current Scene' },
    { key: 'npcs', label: 'Characters', accentColor: scheme.levelColors[3] },
    { key: 'locations', label: 'Locations', accentColor: scheme.levelColors[1] },
    { key: 'scenes', label: 'Scenes', accentColor: scheme.levelColors[4] },
  ];

  return (
    <GlassCard scheme={scheme} style={styles.card}>
      {/* Campaign name (standalone only) */}
      {isStandalone && (
        <View style={styles.nameRow}>
          <TextInput
            value={campaign.name}
            onChangeText={(v) => updateCampaignField(campaign.id, 'name', v)}
            style={[styles.nameInput, { color: scheme.text }]}
            placeholder="Campaign Name"
            placeholderTextColor={scheme.textMuted}
            selectionColor={scheme.primary}
          />
        </View>
      )}

      {/* ── Standard lists ──────────────────────── */}
      {LISTS.map(({ key, label, accentColor }) => (
        <CollapsibleSection
          key={key}
          title={label}
          scheme={scheme}
          collapsed={collapsed[key] ?? false}
          onToggle={() => toggle(key)}
          rightContent={
            <TouchableOpacity
              onPress={() =>
                adding.key === key ? stopAdding() : startAdding(key)
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
            </TouchableOpacity>
          }
        >
          {campaign[key].length === 0 ? (
            <Text style={[styles.empty, { color: scheme.textMuted }]}>
              Nothing here yet. Tap + to add.
            </Text>
          ) : null}

          {campaign[key].map((item) => (
            <NamedItemRow
              key={item.id}
              item={item}
              scheme={scheme}
              accentColor={accentColor}
              onUpdate={(name, description) =>
                updateCampaignListItem(campaign.id, key, item.id, name, description)
              }
              onRemove={() => removeCampaignListItem(campaign.id, key, item.id)}
            />
          ))}

          <AddItemRow
            visible={adding.key === key && !adding.isCustomList}
            scheme={scheme}
            title={`Add to ${label}`}
            onAdd={(name, description) => {
              addCampaignListItem(campaign.id, key, name, description);
              stopAdding();
            }}
            onCancel={stopAdding}
          />
        </CollapsibleSection>
      ))}

      {/* ── Additional Components ──────────────── */}
      {campaign.additionalComponents.map((comp) => (
        <CollapsibleSection
          key={comp.id}
          title={comp.name}
          scheme={scheme}
          collapsed={collapsed[comp.id] ?? false}
          onToggle={() => toggle(comp.id)}
          rightContent={
            comp.type === 'list' ? (
              <TouchableOpacity
                onPress={() =>
                  adding.key === comp.id
                    ? stopAdding()
                    : startAdding(comp.id, true)
                }
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
              </TouchableOpacity>
            ) : undefined
          }
        >
          {comp.type === 'text' ? (
            <TextContentRow
              content={comp.content}
              scheme={scheme}
              placeholder={`Tap to add ${comp.name.toLowerCase()}...`}
              title={comp.name}
              onSave={(v) =>
                updateCampaignComponentText(campaign.id, comp.id, comp.name, v)
              }
            />
          ) : (
            <>
              {(comp as AdditionalListComponent).items.length === 0 ? (
                <Text style={[styles.empty, { color: scheme.textMuted }]}>
                  Nothing here yet. Tap + to add.
                </Text>
              ) : null}

              {(comp as AdditionalListComponent).items.map((item) => (
                <NamedItemRow
                  key={item.id}
                  item={item}
                  scheme={scheme}
                  onUpdate={(name, description) =>
                    updateCampaignComponentListItem(
                      campaign.id,
                      comp.id,
                      item.id,
                      name,
                      description
                    )
                  }
                  onRemove={() =>
                    removeCampaignComponentListItem(campaign.id, comp.id, item.id)
                  }
                />
              ))}

              <AddItemRow
                visible={adding.key === comp.id}
                scheme={scheme}
                title={`Add to ${comp.name}`}
                onAdd={(name, description) => {
                  addCampaignComponentListItem(campaign.id, comp.id, name, description);
                  stopAdding();
                }}
                onCancel={stopAdding}
              />
            </>
          )}
        </CollapsibleSection>
      ))}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  nameRow: {
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
    paddingVertical: 4,
  },
  empty: {
    fontStyle: 'italic',
    fontSize: 13,
    paddingVertical: 8,
  },
  addBtn: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    paddingHorizontal: 4,
  },
});
