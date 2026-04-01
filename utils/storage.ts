import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, Campaign, Backup } from '../types';

const MAX_BACKUPS = 5;

// ─── Key Helpers ─────────────────────────────────────────────────────────────
const KEYS = {
  characters: 'viator:characters',
  campaigns: 'viator:campaigns',
  characterBackups: (id: string) => `viator:backups:char:${id}`,
  campaignBackups: (id: string) => `viator:backups:camp:${id}`,
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

// ─── Backup Management ───────────────────────────────────────────────────────
async function pushBackup<T>(backupKey: string, data: T): Promise<void> {
  const backups = await getJSON<Backup<T>[]>(backupKey, []);
  backups.unshift({ timestamp: Date.now(), data });
  if (backups.length > MAX_BACKUPS) backups.length = MAX_BACKUPS;
  await setJSON(backupKey, backups);
}

// ─── Characters ──────────────────────────────────────────────────────────────
export async function loadCharacters(): Promise<Record<string, Character>> {
  return getJSON<Record<string, Character>>(KEYS.characters, {});
}

export async function saveCharacter(character: Character): Promise<void> {
  const all = await loadCharacters();
  const existing = all[character.id];
  if (existing) {
    await pushBackup<Character>(KEYS.characterBackups(character.id), existing);
  }
  all[character.id] = { ...character, updatedAt: Date.now() };
  await setJSON(KEYS.characters, all);
}

export async function deleteCharacter(id: string): Promise<void> {
  const all = await loadCharacters();
  delete all[id];
  await setJSON(KEYS.characters, all);
}

export async function getCharacterBackups(
  id: string
): Promise<Backup<Character>[]> {
  return getJSON<Backup<Character>[]>(KEYS.characterBackups(id), []);
}

export async function restoreCharacterBackup(
  id: string,
  backupIndex: number
): Promise<Character | null> {
  const backups = await getCharacterBackups(id);
  const backup = backups[backupIndex];
  if (!backup) return null;
  await saveCharacter(backup.data);
  return backup.data;
}

// ─── Campaigns ───────────────────────────────────────────────────────────────
export async function loadCampaigns(): Promise<Record<string, Campaign>> {
  return getJSON<Record<string, Campaign>>(KEYS.campaigns, {});
}

export async function saveCampaign(campaign: Campaign): Promise<void> {
  const all = await loadCampaigns();
  const existing = all[campaign.id];
  if (existing) {
    await pushBackup<Campaign>(KEYS.campaignBackups(campaign.id), existing);
  }
  all[campaign.id] = { ...campaign, updatedAt: Date.now() };
  await setJSON(KEYS.campaigns, all);
}

export async function deleteCampaign(id: string): Promise<void> {
  const all = await loadCampaigns();
  delete all[id];
  await setJSON(KEYS.campaigns, all);
}

export async function getCampaignBackups(
  id: string
): Promise<Backup<Campaign>[]> {
  return getJSON<Backup<Campaign>[]>(KEYS.campaignBackups(id), []);
}

export async function restoreCampaignBackup(
  id: string,
  backupIndex: number
): Promise<Campaign | null> {
  const backups = await getCampaignBackups(id);
  const backup = backups[backupIndex];
  if (!backup) return null;
  await saveCampaign(backup.data);
  return backup.data;
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
