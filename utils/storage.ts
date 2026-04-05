import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, Campaign } from '../types';

// ─── Key Helpers ─────────────────────────────────────────────────────────────
const KEYS = {
  characters: 'viator:characters',
  campaigns: 'viator:campaigns',
  activeEntry: 'viator:activeEntry',
};

// ─── Generic Helpers ─────────────────────────────────────────────────────────
async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ─── Characters ──────────────────────────────────────────────────────────────
export async function loadCharacters(): Promise<Record<string, Character>> {
  return getJSON<Record<string, Character>>(KEYS.characters, {});
}

export async function saveCharacter(character: Character): Promise<void> {
  const all = await loadCharacters();
  all[character.id] = character;
  await setJSON(KEYS.characters, all);
}

export async function deleteCharacter(id: string): Promise<void> {
  const all = await loadCharacters();
  delete all[id];
  await setJSON(KEYS.characters, all);
}

// ─── Campaigns ───────────────────────────────────────────────────────────────
export async function loadCampaigns(): Promise<Record<string, Campaign>> {
  return getJSON<Record<string, Campaign>>(KEYS.campaigns, {});
}

export async function saveCampaign(campaign: Campaign): Promise<void> {
  const all = await loadCampaigns();
  all[campaign.id] = campaign;
  await setJSON(KEYS.campaigns, all);
}

export async function deleteCampaign(id: string): Promise<void> {
  const all = await loadCampaigns();
  delete all[id];
  await setJSON(KEYS.campaigns, all);
}

// ─── Active Entry ────────────────────────────────────────────────────────────
export async function loadActiveEntry(): Promise<{
  characterId: string | null;
  campaignId: string | null;
}> {
  return getJSON(KEYS.activeEntry, { characterId: null, campaignId: null });
}

export async function saveActiveEntry(
  characterId: string | null,
  campaignId: string | null
): Promise<void> {
  await setJSON(KEYS.activeEntry, { characterId, campaignId });
}
