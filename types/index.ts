// ─── Color Schemes ──────────────────────────────────────────────────────────
export type ColorSchemeId =
  | 'midnight'
  | 'forest'
  | 'ember'
  | 'arctic'
  | 'amethyst'
  | 'obsidian';

// ─── Viator Character ────────────────────────────────────────────────────────
export interface Trait {
  id: string;
  name: string;
  level: number; // 1–6
}

export interface TextComponent {
  id: string;
  name: string;
  content: string;
}

export interface Character {
  id: string;
  name: string;
  xp: number;
  description: string;
  traits: Trait[];
  additionalComponents: TextComponent[];
  colorScheme: ColorSchemeId;
  campaignId: string | null;
  createdAt: number;
  updatedAt: number;
}

// ─── Campaign ────────────────────────────────────────────────────────────────
export interface NamedItem {
  id: string;
  name: string;
  description: string;
}

export type AdditionalComponentType = 'text' | 'list';

export interface AdditionalTextComponent {
  id: string;
  type: 'text';
  name: string;
  content: string;
}

export interface AdditionalListComponent {
  id: string;
  type: 'list';
  name: string;
  items: NamedItem[];
}

export type AdditionalCampaignComponent =
  | AdditionalTextComponent
  | AdditionalListComponent;

export interface Campaign {
  id: string;
  name: string;
  currentSceneEvents: NamedItem[];
  npcs: NamedItem[];
  locations: NamedItem[];
  scenes: NamedItem[];
  additionalComponents: AdditionalCampaignComponent[];
  colorScheme: ColorSchemeId;
  characterId: string | null;
  createdAt: number;
  updatedAt: number;
}

// ─── Backup ──────────────────────────────────────────────────────────────────
export interface Backup<T> {
  timestamp: number;
  data: T;
}

// ─── App State ───────────────────────────────────────────────────────────────
export interface ActiveEntry {
  characterId: string | null;
  campaignId: string | null;
}

// ─── Section Collapse State ──────────────────────────────────────────────────
export type CollapsedSections = Record<string, boolean>;
