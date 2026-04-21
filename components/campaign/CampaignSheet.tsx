import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NumberEditModal from '../ui/NumberEditModal';
import { COLOR_SCHEMES } from '../../constants/colorSchemes';
import {
  Campaign,
  AdditionalNumberComponent,
  AdditionalTextComponent,
  AdditionalNPCComponent,
  AdditionalTextListComponent,
  AdditionalNumberListComponent,
  AdditionalNPCListComponent,
  CollapsedSections,
  NamedItem,
  NPCTrait,
  NumberListItem,
  TextListItem,
} from '../../types';
import { useAppStore } from '../../store/appStore';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import GlassInput from '../ui/GlassInput';
import CollapsibleSection from '../ui/CollapsibleSection';
import ModalOverlay from '../ui/ModalOverlay';
import TextContentRow from '../ui/TextContentRow';
import ExpandableTextRow from '../ui/ExpandableTextRow';
import AddItemRow from '../ui/AddItemRow';
import NPCRow from '../ui/NPCRow';
import NumberListItemRow from '../ui/NumberListItemRow';
import AddSectionModal, { ComponentType } from '../ui/AddSectionModal';
import StandaloneNPC from '../ui/StandaloneNPC';

import EditControls from '../ui/EditControls';

type ListKey = 'npcs' | 'locations' | 'scenes';
type NamedListKey = 'locations' | 'scenes';

interface Props {
  campaign: Campaign;
  isStandalone?: boolean;
  schemeOverride?: import('../../constants/colorSchemes').ColorScheme;
}

type AddingKey = ListKey | '__npcs';
type AddingState = { key: AddingKey | null };

const LIST_CONFIG: Record<string, { key: NamedListKey; label: string; accentColorIdx: number }> = {
  __locations: { key: 'locations', label: 'Locations',  accentColorIdx: 1 },
  __scenes:    { key: 'scenes',    label: 'Scenes',     accentColorIdx: 4 },
};

export default function CampaignSheet({ campaign, isStandalone, schemeOverride }: Props) {
  const scheme = schemeOverride ?? COLOR_SCHEMES[campaign.colorScheme];
  const {
    updateCampaignField,
    addCampaignBuiltinNPC,
    updateCampaignBuiltinNPC,
    removeCampaignBuiltinNPC,
    reorderCampaignBuiltinNPCs,
    addCampaignBuiltinNPCTrait,
    updateCampaignBuiltinNPCTrait,
    removeCampaignBuiltinNPCTrait,
    addCampaignListItem,
    updateCampaignListItem,
    removeCampaignListItem,
    reorderCampaignListItems,
    updateCampaignComponentText,
    updateCampaignComponentNumber,
    updateCampaignNPCComponent,
    addCampaignNPCTrait,
    updateCampaignNPCTrait,
    removeCampaignNPCTrait,
    addCampaignTextListItem,
    updateCampaignTextListItem,
    removeCampaignTextListItem,
    reorderCampaignTextListItems,
    addCampaignNumberListItem,
    updateCampaignNumberListItemValue,
    removeCampaignNumberListItem,
    reorderCampaignNumberListItems,
    addCampaignNPCListItem,
    updateCampaignNPCListItem,
    removeCampaignNPCListItem,
    reorderCampaignNPCListItems,
    addCampaignNPCListItemTrait,
    updateCampaignNPCListItemTrait,
    removeCampaignNPCListItemTrait,
    reorderCampaignSection,
    removeCampaignSection,
    addCampaignComponent,
    isEditMode,
  } = useAppStore();

  const [collapsed, setCollapsed] = useState<CollapsedSections>({
    currentScene: false,
    __npcs: true,
    __locations: true,
    __scenes: true,
  });
  const toggle = (key: string) => setCollapsed((s) => ({ ...s, [key]: !s[key] }));

  // Built-in list adding (npcs/locations/scenes)
  const [adding, setAdding] = useState<AddingState>({ key: null });
  const startAdding = (key: AddingKey) => setAdding({ key });
  const stopAdding = () => setAdding({ key: null });


  // Section remove confirm
  const [confirmSectionId, setConfirmSectionId] = useState<string | null>(null);
  const handleRemoveSection = (sectionId: string) => {
    if (confirmSectionId === sectionId) { removeCampaignSection(campaign.id, sectionId); setConfirmSectionId(null); }
    else setConfirmSectionId(sectionId);
  };

  // Add Section modal
  const [addingComp, setAddingComp] = useState(false);
  const handleAddComp = (type: ComponentType, name: string) => {
    addCampaignComponent(campaign.id, type, name);
  };

  // Text-list add state
  const [addingTextListCompId, setAddingTextListCompId] = useState<string | null>(null);

  // Number-list add/edit state
  const [addingNumListCompId, setAddingNumListCompId] = useState<string | null>(null);
  const [addingNumListName, setAddingNumListName] = useState('');
  const [editingNumListItem, setEditingNumListItem] = useState<{ compId: string; item: NumberListItem } | null>(null);

  // NPC-list add state
  const [addingNPCListCompId, setAddingNPCListCompId] = useState<string | null>(null);

  const sectionOrder = campaign.sectionOrder ?? [
    '__currentScene', '__npcs', '__locations', '__scenes',
    ...campaign.additionalComponents.map((c) => c.id),
  ];

  if (sectionOrder.length === 0 && !isEditMode) return null;



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

      {/* ── Unified Section Rendering ─────────────── */}
      {sectionOrder.map((sectionId, idx) => {
        const totalSections = sectionOrder.length;
        const editControls = isEditMode ? (
          <EditControls
            scheme={scheme}
            onMoveUp={idx > 0 ? () => reorderCampaignSection(campaign.id, idx, idx - 1) : undefined}
            onMoveDown={idx < totalSections - 1 ? () => reorderCampaignSection(campaign.id, idx, idx + 1) : undefined}
            onRemove={() => handleRemoveSection(sectionId)}
            confirmRemove={confirmSectionId === sectionId}
          />
        ) : null;

        // ── Current Scene ──
        if (sectionId === '__currentScene') {
          return (
            <CollapsibleSection key="__currentScene" title="Current Scene" scheme={scheme} collapsed={collapsed.currentScene ?? false} onToggle={() => toggle('currentScene')} rightContent={editControls}>
              <TextContentRow content={campaign.currentScene} scheme={scheme} placeholder="Tap to describe the current scene..." title="Current Scene" onSave={(v) => updateCampaignField(campaign.id, 'currentScene', v)} />
            </CollapsibleSection>
          );
        }

        // ── Characters (NPC list) ──
        if (sectionId === '__npcs') {
          return (
            <CollapsibleSection
              key="__npcs"
              title="Characters"
              scheme={scheme}
              collapsed={collapsed.__npcs ?? true}
              onToggle={() => toggle('__npcs')}
              rightContent={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => adding.key === '__npcs' ? stopAdding() : startAdding('__npcs')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                  </TouchableOpacity>
                  {isEditMode && editControls}
                </View>
              }
            >
              {campaign.npcs.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>Nothing here yet. Tap + to add.</Text>}
              <View style={{ gap: 8 }}>
                {campaign.npcs.map((npc, npcIdx) => (
                  <NPCRow
                    key={npc.id}
                    item={npc}
                    scheme={scheme}
                    onUpdate={(name, desc) => updateCampaignBuiltinNPC(campaign.id, npc.id, name, desc)}
                    onRemove={() => removeCampaignBuiltinNPC(campaign.id, npc.id)}
                    onAddTrait={(name) => addCampaignBuiltinNPCTrait(campaign.id, npc.id, name)}
                    onUpdateTrait={(traitId, name, value) => updateCampaignBuiltinNPCTrait(campaign.id, npc.id, traitId, name, value)}
                    onRemoveTrait={(traitId) => removeCampaignBuiltinNPCTrait(campaign.id, npc.id, traitId)}
                    onMoveUp={npcIdx > 0 ? () => reorderCampaignBuiltinNPCs(campaign.id, npcIdx, npcIdx - 1) : undefined}
                    onMoveDown={npcIdx < campaign.npcs.length - 1 ? () => reorderCampaignBuiltinNPCs(campaign.id, npcIdx, npcIdx + 1) : undefined}
                  />
                ))}
              </View>
              <AddItemRow
                visible={adding.key === '__npcs'}
                scheme={scheme}
                title="Add Character"
                onAdd={(name, description) => { addCampaignBuiltinNPC(campaign.id, name, description); stopAdding(); }}
                onCancel={stopAdding}
              />
            </CollapsibleSection>
          );
        }

        // ── Standard Lists (locations / scenes) ──
        const listDef = LIST_CONFIG[sectionId];
        if (listDef && sectionId !== '__npcs') {
          const { key, label, accentColorIdx } = listDef;
          const namedKey = key as NamedListKey;
          const accentColor = scheme.levelColors[accentColorIdx];
          const items = campaign[namedKey] as NamedItem[];
          return (
            <CollapsibleSection
              key={sectionId}
              title={label}
              scheme={scheme}
              collapsed={collapsed[sectionId] ?? true}
              onToggle={() => toggle(sectionId)}
              rightContent={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => adding.key === key ? stopAdding() : startAdding(key)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                  </TouchableOpacity>
                  {isEditMode && editControls}
                </View>
              }
            >
              {items.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>Nothing here yet. Tap + to add.</Text>}
              <View style={{ gap: 8 }}>
                {items.map((item: NamedItem, itemIdx: number) => (
                  <ExpandableTextRow
                    key={item.id}
                    name={item.name}
                    content={item.description}
                    scheme={scheme}
                    accentColor={accentColor}
                    onUpdate={(name, description) => updateCampaignListItem(campaign.id, namedKey, item.id, name, description)}
                    onRemove={() => removeCampaignListItem(campaign.id, namedKey, item.id)}
                    onMoveUp={itemIdx > 0 ? () => reorderCampaignListItems(campaign.id, namedKey, itemIdx, itemIdx - 1) : undefined}
                    onMoveDown={itemIdx < items.length - 1 ? () => reorderCampaignListItems(campaign.id, namedKey, itemIdx, itemIdx + 1) : undefined}
                  />
                ))}
              </View>
              <AddItemRow
                visible={adding.key === namedKey}
                scheme={scheme}
                title={`Add to ${label}`}
                onAdd={(name, description) => { addCampaignListItem(campaign.id, namedKey, name, description); stopAdding(); }}
                onCancel={stopAdding}
              />
            </CollapsibleSection>
          );
        }

        // ── Custom Components ──
        const compIdx = campaign.additionalComponents.findIndex((c) => c.id === sectionId);
        if (compIdx === -1) return null;
        const comp = campaign.additionalComponents[compIdx];

        // ── Number (inline, no collapse) ──
        if (comp.type === 'number') {
          const numComp = comp as AdditionalNumberComponent;
          return (
            <View key={comp.id} style={{ marginTop: 12, marginBottom: 4 }}>
              <NumberListItemRow
                item={{ id: numComp.id, name: numComp.name, value: numComp.value }}
                scheme={scheme}
                onUpdateValue={(val) => updateCampaignComponentNumber(campaign.id, numComp.id, val)}
                onRemove={() => handleRemoveSection(comp.id)}
                confirmRemove={confirmSectionId === comp.id}
                onMoveUp={idx > 0 ? () => reorderCampaignSection(campaign.id, idx, idx - 1) : undefined}
                onMoveDown={idx < totalSections - 1 ? () => reorderCampaignSection(campaign.id, idx, idx + 1) : undefined}
              />
            </View>
          );
        }

        // ── NPC (standalone) ──
        if (comp.type === 'npc') {
          const npcComp = comp as AdditionalNPCComponent;
          return (
            <StandaloneNPC
              key={comp.id}
              comp={npcComp}
              scheme={scheme}
              collapsed={collapsed[comp.id] ?? true}
              onToggle={() => toggle(comp.id)}
              editControls={editControls}
              onUpdateDescription={(v) => updateCampaignNPCComponent(campaign.id, comp.id, comp.name, v)}
              onAddTrait={(name) => addCampaignNPCTrait(campaign.id, comp.id, name)}
              onUpdateTrait={(traitId, name, val) => updateCampaignNPCTrait(campaign.id, comp.id, traitId, name, val)}
              onRemoveTrait={(traitId) => removeCampaignNPCTrait(campaign.id, comp.id, traitId)}
            />
          );
        }

        // ── Text List ──
        if (comp.type === 'text-list') {
          const listComp = comp as AdditionalTextListComponent;
          return (
            <CollapsibleSection
              key={comp.id}
              title={comp.name}
              scheme={scheme}
              collapsed={collapsed[comp.id] ?? true}
              onToggle={() => toggle(comp.id)}
              rightContent={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => setAddingTextListCompId(comp.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                  </TouchableOpacity>
                  {isEditMode && editControls}
                </View>
              }
            >
              {listComp.items.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>No items yet. Tap + to add.</Text>}
              <View style={{ gap: 8 }}>
                {listComp.items.map((item, itemIdx) => (
                  <ExpandableTextRow
                    key={item.id}
                    name={item.name}
                    content={item.content}
                    scheme={scheme}
                    onUpdate={(name, content) => updateCampaignTextListItem(campaign.id, comp.id, item.id, name, content)}
                    onRemove={() => removeCampaignTextListItem(campaign.id, comp.id, item.id)}
                    onMoveUp={itemIdx > 0 ? () => reorderCampaignTextListItems(campaign.id, comp.id, itemIdx, itemIdx - 1) : undefined}
                    onMoveDown={itemIdx < listComp.items.length - 1 ? () => reorderCampaignTextListItems(campaign.id, comp.id, itemIdx, itemIdx + 1) : undefined}
                  />
                ))}
              </View>
              <AddItemRow
                visible={addingTextListCompId === comp.id}
                scheme={scheme}
                title={`Add to ${comp.name}`}
                namePlaceholder="Item Name"
                descPlaceholder="Content (optional)"
                onAdd={(name, content) => { addCampaignTextListItem(campaign.id, comp.id, name, content); setAddingTextListCompId(null); }}
                onCancel={() => setAddingTextListCompId(null)}
              />
            </CollapsibleSection>
          );
        }

        // ── Number List ──
        if (comp.type === 'number-list') {
          const listComp = comp as AdditionalNumberListComponent;
          return (
            <CollapsibleSection
              key={comp.id}
              title={comp.name}
              scheme={scheme}
              collapsed={collapsed[comp.id] ?? true}
              onToggle={() => toggle(comp.id)}
              rightContent={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => { setAddingNumListName(''); setAddingNumListCompId(comp.id); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                  </TouchableOpacity>
                  {isEditMode && editControls}
                </View>
              }
            >
              {listComp.items.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>No items yet. Tap + to add.</Text>}
              <View style={{ gap: 8 }}>
                {listComp.items.map((item, itemIdx) => (
                  <NumberListItemRow
                    key={item.id}
                    item={item}
                    scheme={scheme}
                    onUpdateValue={(n) => updateCampaignNumberListItemValue(campaign.id, comp.id, item.id, n)}
                    onRemove={() => removeCampaignNumberListItem(campaign.id, comp.id, item.id)}
                    onMoveUp={itemIdx > 0 ? () => reorderCampaignNumberListItems(campaign.id, comp.id, itemIdx, itemIdx - 1) : undefined}
                    onMoveDown={itemIdx < listComp.items.length - 1 ? () => reorderCampaignNumberListItems(campaign.id, comp.id, itemIdx, itemIdx + 1) : undefined}
                  />
                ))}
              </View>
            </CollapsibleSection>
          );
        }

        // ── NPC List ──
        if (comp.type === 'npc-list') {
          const listComp = comp as AdditionalNPCListComponent;
          return (
            <CollapsibleSection
              key={comp.id}
              title={comp.name}
              scheme={scheme}
              collapsed={collapsed[comp.id] ?? true}
              onToggle={() => toggle(comp.id)}
              rightContent={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => setAddingNPCListCompId(comp.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                  </TouchableOpacity>
                  {isEditMode && editControls}
                </View>
              }
            >
              {listComp.items.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>No items yet. Tap + to add.</Text>}
              <View style={{ gap: 8 }}>
                {listComp.items.map((item, itemIdx) => (
                  <NPCRow
                    key={item.id}
                    item={item}
                    scheme={scheme}
                    onUpdate={(name, desc) => updateCampaignNPCListItem(campaign.id, comp.id, item.id, name, desc)}
                    onRemove={() => removeCampaignNPCListItem(campaign.id, comp.id, item.id)}
                    onAddTrait={(name) => addCampaignNPCListItemTrait(campaign.id, comp.id, item.id, name)}
                    onUpdateTrait={(traitId, name, value) => updateCampaignNPCListItemTrait(campaign.id, comp.id, item.id, traitId, name, value)}
                    onRemoveTrait={(traitId) => removeCampaignNPCListItemTrait(campaign.id, comp.id, item.id, traitId)}
                    onMoveUp={itemIdx > 0 ? () => reorderCampaignNPCListItems(campaign.id, comp.id, itemIdx, itemIdx - 1) : undefined}
                    onMoveDown={itemIdx < listComp.items.length - 1 ? () => reorderCampaignNPCListItems(campaign.id, comp.id, itemIdx, itemIdx + 1) : undefined}
                  />
                ))}
              </View>
              <AddItemRow
                visible={addingNPCListCompId === comp.id}
                scheme={scheme}
                title={`Add to ${comp.name}`}
                onAdd={(name, desc) => { addCampaignNPCListItem(campaign.id, comp.id, name, desc); setAddingNPCListCompId(null); }}
                onCancel={() => setAddingNPCListCompId(null)}
              />
            </CollapsibleSection>
          );
        }

        // ── Text (default) ──
        return (
          <CollapsibleSection key={comp.id} title={comp.name} scheme={scheme} collapsed={collapsed[comp.id] ?? false} onToggle={() => toggle(comp.id)} rightContent={editControls}>
            <TextContentRow
              content={(comp as AdditionalTextComponent).content}
              scheme={scheme}
              placeholder={`Tap to add ${comp.name.toLowerCase()}...`}
              title={comp.name}
              onSave={(v) => updateCampaignComponentText(campaign.id, comp.id, comp.name, v)}
            />
          </CollapsibleSection>
        );
      })}

      {/* ── Add Section button (Edit Mode) ──────────── */}
      {isEditMode && (
        <TouchableOpacity onPress={() => setAddingComp(true)} style={[styles.addSectionBtn, { borderColor: scheme.surfaceBorder }]}>
          <Text style={[styles.addSectionText, { color: scheme.textSecondary }]}>+ Add Section</Text>
        </TouchableOpacity>
      )}


      {/* ── Number List Item Edit Modal ─────────────── */}
      <NumberEditModal
        visible={editingNumListItem !== null}
        title={editingNumListItem?.item.name ?? ''}
        initialValue={editingNumListItem?.item.value ?? 0}
        scheme={scheme}
        onSave={(n) => { if (editingNumListItem) updateCampaignNumberListItemValue(campaign.id, editingNumListItem.compId, editingNumListItem.item.id, n); }}
        onClose={() => setEditingNumListItem(null)}
      />

      {/* ── Add Number List Item Modal ───────────────── */}
      <ModalOverlay visible={addingNumListCompId !== null} onClose={() => setAddingNumListCompId(null)} scheme={scheme} title="Add Item">
        <GlassInput scheme={scheme} label="Name" value={addingNumListName} onChangeText={setAddingNumListName} placeholder="e.g. Gold" containerStyle={{ marginBottom: 20 }} autoFocus />
        <View style={styles.modalActions}>
          <GlassButton label="Cancel" onPress={() => { setAddingNumListCompId(null); setAddingNumListName(''); }} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
          <GlassButton
            label="Add"
            onPress={() => {
              if (addingNumListCompId && addingNumListName.trim()) {
                addCampaignNumberListItem(campaign.id, addingNumListCompId, addingNumListName.trim());
                setAddingNumListCompId(null);
                setAddingNumListName('');
              }
            }}
            scheme={scheme}
            variant="primary"
            small
            style={{ flex: 1 }}
            disabled={!addingNumListName.trim()}
          />
        </View>
      </ModalOverlay>

      {/* ── Add Section Modal ───────────────────────── */}
      <AddSectionModal
        visible={addingComp}
        onClose={() => setAddingComp(false)}
        onAdd={handleAddComp}
        scheme={scheme}
      />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  nameRow: { marginBottom: 8 },
  nameInput: { fontSize: 22, fontWeight: '700', letterSpacing: 0.3, paddingVertical: 4 },
  empty: { fontStyle: 'italic', fontSize: 13, paddingVertical: 8 },
  addBtn: { fontSize: 20, fontWeight: '700', lineHeight: 24, paddingHorizontal: 4 },
  editControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reorderArrow: { fontSize: 16, fontWeight: '700', lineHeight: 20 },
  addSectionBtn: { marginTop: 4, paddingVertical: 9, borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', alignItems: 'center' },
  addSectionText: { fontSize: 13, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalCard: { maxWidth: 400, alignSelf: 'center', width: '100%' },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  modalInput: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14, marginBottom: 10 },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: { width: '30%', flexGrow: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  typeBtnText: { fontSize: 12, fontWeight: '600' },
  // Text list items
  textListItem: { marginBottom: 4 },
  textListItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  textListItemName: { flex: 1, fontSize: 13, fontWeight: '600' },
  itemControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moveArrow: { fontSize: 13, fontWeight: '700', lineHeight: 16 },
  // Number list items
  numListItemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1 },
  numListItemName: { flex: 1, fontSize: 13, fontWeight: '600' },
  numListItemEditRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
