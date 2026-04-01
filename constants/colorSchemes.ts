import { ColorSchemeId } from '../types';

export interface ColorScheme {
  id: ColorSchemeId;
  label: string;
  background: string;
  backgroundGradientStart: string;
  backgroundGradientEnd: string;
  surface: string;       // glass card base
  surfaceBorder: string; // glass card border
  primary: string;       // accent buttons, highlights
  primaryMuted: string;  // subtle tint
  text: string;
  textSecondary: string;
  textMuted: string;
  destructive: string;
  blurTint: 'light' | 'dark' | 'default';
  levelColors: string[]; // 6 level colors for trait pips
}

export const COLOR_SCHEMES: Record<ColorSchemeId, ColorScheme> = {
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    background: '#0a0e1a',
    backgroundGradientStart: '#0d1230',
    backgroundGradientEnd: '#050810',
    surface: 'rgba(30, 40, 80, 0.45)',
    surfaceBorder: 'rgba(100, 140, 255, 0.18)',
    primary: '#4f8ef7',
    primaryMuted: 'rgba(79, 142, 247, 0.15)',
    text: '#e8eeff',
    textSecondary: '#a0b4e0',
    textMuted: 'rgba(160, 180, 224, 0.5)',
    destructive: '#ff6b6b',
    blurTint: 'dark',
    levelColors: ['#334', '#2255aa', '#3377dd', '#44aaff', '#66ccff', '#88eeff'],
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    background: '#071210',
    backgroundGradientStart: '#0b1f18',
    backgroundGradientEnd: '#040c09',
    surface: 'rgba(20, 55, 40, 0.45)',
    surfaceBorder: 'rgba(80, 200, 130, 0.18)',
    primary: '#3ecf8e',
    primaryMuted: 'rgba(62, 207, 142, 0.15)',
    text: '#dffff0',
    textSecondary: '#8ecfaa',
    textMuted: 'rgba(142, 207, 170, 0.5)',
    destructive: '#ff6b6b',
    blurTint: 'dark',
    levelColors: ['#1a3322', '#1a5c38', '#22885a', '#2eb87a', '#44e89a', '#7fffc4'],
  },
  ember: {
    id: 'ember',
    label: 'Ember',
    background: '#140806',
    backgroundGradientStart: '#2a0f06',
    backgroundGradientEnd: '#0d0503',
    surface: 'rgba(80, 30, 20, 0.45)',
    surfaceBorder: 'rgba(255, 140, 80, 0.18)',
    primary: '#ff7a3d',
    primaryMuted: 'rgba(255, 122, 61, 0.15)',
    text: '#fff0e8',
    textSecondary: '#ffb08a',
    textMuted: 'rgba(255, 176, 138, 0.5)',
    destructive: '#ff4444',
    blurTint: 'dark',
    levelColors: ['#3a1500', '#6a2800', '#aa4400', '#dd6600', '#ff8844', '#ffbb88'],
  },
  arctic: {
    id: 'arctic',
    label: 'Arctic',
    background: '#f0f4fa',
    backgroundGradientStart: '#e8eeff',
    backgroundGradientEnd: '#d8e8f8',
    surface: 'rgba(255, 255, 255, 0.55)',
    surfaceBorder: 'rgba(100, 160, 255, 0.25)',
    primary: '#3a7fff',
    primaryMuted: 'rgba(58, 127, 255, 0.12)',
    text: '#0a1a3a',
    textSecondary: '#3a5a8a',
    textMuted: 'rgba(58, 90, 138, 0.5)',
    destructive: '#e03030',
    blurTint: 'light',
    levelColors: ['#c8d8ee', '#88aadd', '#4488cc', '#2266bb', '#1155aa', '#0044aa'],
  },
  amethyst: {
    id: 'amethyst',
    label: 'Amethyst',
    background: '#0e0814',
    backgroundGradientStart: '#1a0a2e',
    backgroundGradientEnd: '#080510',
    surface: 'rgba(60, 20, 80, 0.45)',
    surfaceBorder: 'rgba(180, 100, 255, 0.18)',
    primary: '#c06aff',
    primaryMuted: 'rgba(192, 106, 255, 0.15)',
    text: '#f8eeff',
    textSecondary: '#d0a0ff',
    textMuted: 'rgba(208, 160, 255, 0.5)',
    destructive: '#ff5577',
    blurTint: 'dark',
    levelColors: ['#2a1040', '#4a1880', '#7722bb', '#aa44ee', '#cc77ff', '#ee99ff'],
  },
  obsidian: {
    id: 'obsidian',
    label: 'Obsidian',
    background: '#050506',
    backgroundGradientStart: '#0e0e12',
    backgroundGradientEnd: '#020203',
    surface: 'rgba(30, 30, 36, 0.55)',
    surfaceBorder: 'rgba(180, 180, 200, 0.12)',
    primary: '#aaaacc',
    primaryMuted: 'rgba(170, 170, 204, 0.12)',
    text: '#eeeef8',
    textSecondary: '#9999bb',
    textMuted: 'rgba(153, 153, 187, 0.5)',
    destructive: '#ff5555',
    blurTint: 'dark',
    levelColors: ['#1a1a22', '#2a2a38', '#3a3a55', '#555577', '#7777aa', '#aaaadd'],
  },
};

export const DEFAULT_SCHEME: ColorSchemeId = 'midnight';
