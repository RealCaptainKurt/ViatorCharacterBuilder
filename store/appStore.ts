import { create } from 'zustand';
import {
  Character,
  Campaign,
  ColorSchemeId,
  Trait,
  TextComponent,
  NamedItem,
  AdditionalCampaignComponent,
} from '../types';
import {
  loadCharacters,
  saveCharacter,
  deleteCharacter,
  loadCampaigns,
  saveCampaign,
  deleteCampaign,
  loadActiveEntry,
  saveActiveEntry,
} from '../utils/storage';
import { generateId } from '../utils/id';
import { DEFAULT_SCHEME } from '../constants/colorSchemes';

interface AppState {
  // Data
  characters: Record<string, Character>;
  campaigns: Record<string, Campaign>;

  // Active view
  activeCharacterId: string | null;
  activeCampaignId: string | null;

  // UI
  isSidebarOpen: boolean;
  isLoaded: boolean;

  // Init
  initialize: () => Promise<void>;

  // Sidebar
  openSidebar: () => void;
  closeSidebar: () => void;

  // Active selection
  setActive: (characterId: string | null, campaignId: string | null) => void;

  // ─── Character CRUD ───────────────────────────────────────────────
  createCharacter: (
    name: string,
    description: string,
    traits: Omit<Trait, 'id'>[],
    colorScheme?: ColorSchemeId
  ) => Character;
  updateCharacterField: <K extends keyof Character>(
    id: string,
    field: K,
    value: Character[K]
  ) => void;

  // Traits
  addTrait: (characterId: string, name: string, level: number) => void;
  updateTrait: (
    characterId: string,
    traitId: string,
    name: string,
    level: number
  ) => void;
  removeTrait: (characterId: string, traitId: string) => void;

  // Additional text components on character
  addCharacterComponent: (characterId: string, name: string) => void;
  updateCharacterComponent: (
    characterId: string,
    componentId: string,
    name: string,
    content: string
  ) => void;
  removeCharacterComponent: (characterId: string, componentId: string) => void;

  removeCharacter: (id: string) => void;

  // ─── Campaign CRUD ────────────────────────────────────────────────
  createCampaign: (name: string, colorScheme?: ColorSchemeId) => Campaign;
  updateCampaignField: <K extends keyof Campaign>(
    id: string,
    field: K,
    value: Campaign[K]
  ) => void;

  // Named item lists
  addCampaignListItem: (
    campaignId: string,
    list: 'currentSceneEvents' | 'npcs' | 'locations' | 'scenes',
    name: string,
    description: string
  ) => void;
  updateCampaignListItem: (
    campaignId: string,
    list: 'currentSceneEvents' | 'npcs' | 'locations' | 'scenes',
    itemId: string,
    name: string,
    description: string
  ) => void;
  removeCampaignListItem: (
    campaignId: string,
    list: 'currentSceneEvents' | 'npcs' | 'locations' | 'scenes',
    itemId: string
  ) => void;

  // Additional components
  addCampaignComponent: (
    campaignId: string,
    type: 'text' | 'list',
    name: string
  ) => void;
  updateCampaignComponentText: (
    campaignId: string,
    componentId: string,
    name: string,
    content: string
  ) => void;
  addCampaignComponentListItem: (
    campaignId: string,
    componentId: string,
    name: string,
    description: string
  ) => void;
  updateCampaignComponentListItem: (
    campaignId: string,
    componentId: string,
    itemId: string,
    name: string,
    description: string
  ) => void;
  removeCampaignComponentListItem: (
    campaignId: string,
    componentId: string,
    itemId: string
  ) => void;
  removeCampaignComponent: (campaignId: string, componentId: string) => void;

  removeCampaign: (id: string) => void;

  // Link/unlink
  linkCharacterToCampaign: (characterId: string, campaignId: string) => void;
  unlinkCharacterFromCampaign: (characterId: string) => void;
}

// ─── Helper: persist character ───────────────────────────────────────────────
function persistChar(char: Character) {
  saveCharacter(char).catch(console.error);
}
function persistCamp(camp: Campaign) {
  saveCampaign(camp).catch(console.error);
}

export const useAppStore = create<AppState>((set, get) => ({
  characters: {},
  campaigns: {},
  activeCharacterId: null,
  activeCampaignId: null,
  isSidebarOpen: false,
  isLoaded: false,

  initialize: async () => {
    const [characters, campaigns, active] = await Promise.all([
      loadCharacters(),
      loadCampaigns(),
      loadActiveEntry(),
    ]);
    set({
      characters,
      campaigns,
      activeCharacterId: active.characterId,
      activeCampaignId: active.campaignId,
      isLoaded: true,
    });
  },

  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),

  setActive: (characterId, campaignId) => {
    set({ activeCharacterId: characterId, activeCampaignId: campaignId });
    saveActiveEntry(characterId, campaignId).catch(console.error);
  },

  // ─── Characters ────────────────────────────────────────────────────────────
  createCharacter: (name, description, traits, colorScheme = DEFAULT_SCHEME) => {
    const char: Character = {
      id: generateId(),
      name,
      xp: 0,
      description,
      traits: traits.map((t) => ({ ...t, id: generateId() })),
      additionalComponents: [],
      colorScheme,
      campaignId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ characters: { ...s.characters, [char.id]: char } }));
    persistChar(char);
    return char;
  },

  updateCharacterField: (id, field, value) => {
    set((s) => {
      const char = s.characters[id];
      if (!char) return s;
      const updated = { ...char, [field]: value, updatedAt: Date.now() };
      persistChar(updated);
      return { characters: { ...s.characters, [id]: updated } };
    });
  },

  addTrait: (characterId, name, level) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const trait: Trait = { id: generateId(), name, level };
      const updated = {
        ...char,
        traits: [...char.traits, trait],
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  updateTrait: (characterId, traitId, name, level) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        traits: char.traits.map((t) =>
          t.id === traitId ? { ...t, name, level } : t
        ),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeTrait: (characterId, traitId) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        traits: char.traits.filter((t) => t.id !== traitId),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  addCharacterComponent: (characterId, name) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const comp: TextComponent = { id: generateId(), name, content: '' };
      const updated = {
        ...char,
        additionalComponents: [...char.additionalComponents, comp],
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  updateCharacterComponent: (characterId, componentId, name, content) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: char.additionalComponents.map((c) =>
          c.id === componentId ? { ...c, name, content } : c
        ),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeCharacterComponent: (characterId, componentId) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: char.additionalComponents.filter(
          (c) => c.id !== componentId
        ),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeCharacter: (id) => {
    set((s) => {
      const { [id]: _, ...rest } = s.characters;
      const newActiveChar =
        s.activeCharacterId === id ? null : s.activeCharacterId;
      if (newActiveChar !== s.activeCharacterId) {
        saveActiveEntry(newActiveChar, s.activeCampaignId).catch(console.error);
      }
      deleteCharacter(id).catch(console.error);
      return { characters: rest, activeCharacterId: newActiveChar };
    });
  },

  // ─── Campaigns ─────────────────────────────────────────────────────────────
  createCampaign: (name, colorScheme = DEFAULT_SCHEME) => {
    const camp: Campaign = {
      id: generateId(),
      name,
      currentSceneEvents: [],
      npcs: [],
      locations: [],
      scenes: [],
      additionalComponents: [],
      colorScheme,
      characterId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ campaigns: { ...s.campaigns, [camp.id]: camp } }));
    persistCamp(camp);
    return camp;
  },

  updateCampaignField: (id, field, value) => {
    set((s) => {
      const camp = s.campaigns[id];
      if (!camp) return s;
      const updated = { ...camp, [field]: value, updatedAt: Date.now() };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [id]: updated } };
    });
  },

  addCampaignListItem: (campaignId, list, name, description) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const item: NamedItem = { id: generateId(), name, description };
      const updated = {
        ...camp,
        [list]: [...camp[list], item],
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignListItem: (campaignId, list, itemId, name, description) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        [list]: camp[list].map((i: NamedItem) =>
          i.id === itemId ? { ...i, name, description } : i
        ),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignListItem: (campaignId, list, itemId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        [list]: camp[list].filter((i: NamedItem) => i.id !== itemId),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  addCampaignComponent: (campaignId, type, name) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const comp: AdditionalCampaignComponent =
        type === 'text'
          ? { id: generateId(), type: 'text', name, content: '' }
          : { id: generateId(), type: 'list', name, items: [] };
      const updated = {
        ...camp,
        additionalComponents: [...camp.additionalComponents, comp],
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignComponentText: (campaignId, componentId, name, content) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: camp.additionalComponents.map((c) =>
          c.id === componentId && c.type === 'text'
            ? { ...c, name, content }
            : c
        ),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  addCampaignComponentListItem: (campaignId, componentId, name, description) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: camp.additionalComponents.map((c) => {
          if (c.id === componentId && c.type === 'list') {
            const item: NamedItem = { id: generateId(), name, description };
            return { ...c, items: [...c.items, item] };
          }
          return c;
        }),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignComponentListItem: (
    campaignId,
    componentId,
    itemId,
    name,
    description
  ) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: camp.additionalComponents.map((c) => {
          if (c.id === componentId && c.type === 'list') {
            return {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, name, description } : i
              ),
            };
          }
          return c;
        }),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignComponentListItem: (campaignId, componentId, itemId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: camp.additionalComponents.map((c) => {
          if (c.id === componentId && c.type === 'list') {
            return { ...c, items: c.items.filter((i) => i.id !== itemId) };
          }
          return c;
        }),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignComponent: (campaignId, componentId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: camp.additionalComponents.filter(
          (c) => c.id !== componentId
        ),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaign: (id) => {
    set((s) => {
      const { [id]: _, ...rest } = s.campaigns;
      const newActiveCamp =
        s.activeCampaignId === id ? null : s.activeCampaignId;
      if (newActiveCamp !== s.activeCampaignId) {
        saveActiveEntry(s.activeCharacterId, newActiveCamp).catch(console.error);
      }
      deleteCampaign(id).catch(console.error);
      return { campaigns: rest, activeCampaignId: newActiveCamp };
    });
  },

  linkCharacterToCampaign: (characterId, campaignId) => {
    set((s) => {
      const char = s.characters[characterId];
      const camp = s.campaigns[campaignId];
      if (!char || !camp) return s;
      const updatedChar = { ...char, campaignId, updatedAt: Date.now() };
      const updatedCamp = { ...camp, characterId, updatedAt: Date.now() };
      persistChar(updatedChar);
      persistCamp(updatedCamp);
      return {
        characters: { ...s.characters, [characterId]: updatedChar },
        campaigns: { ...s.campaigns, [campaignId]: updatedCamp },
      };
    });
  },

  unlinkCharacterFromCampaign: (characterId) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char || !char.campaignId) return s;
      const camp = s.campaigns[char.campaignId];
      const updatedChar = { ...char, campaignId: null, updatedAt: Date.now() };
      persistChar(updatedChar);
      const updates: Partial<AppState> = {
        characters: { ...s.characters, [characterId]: updatedChar },
      };
      if (camp) {
        const updatedCamp = { ...camp, characterId: null, updatedAt: Date.now() };
        persistCamp(updatedCamp);
        updates.campaigns = { ...s.campaigns, [camp.id]: updatedCamp };
      }
      return updates;
    });
  },
}));
