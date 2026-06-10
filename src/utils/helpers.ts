import type { SmellMemory, Season, SmellType, Emotion } from './constants';
import { SEASONS, SMELL_TYPES, EMOTIONS } from './constants';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${hh}:${mm}`;
}

export interface Filters {
  smellType: string;
  season: string;
  emotion: string;
}

export function filterMemories(memories: SmellMemory[], filters: Filters): SmellMemory[] {
  return memories.filter(m => {
    if (filters.smellType && m.smell_type !== filters.smellType) return false;
    if (filters.season && m.season !== filters.season) return false;
    if (filters.emotion && m.emotion !== filters.emotion) return false;
    return true;
  });
}

export interface IntensityDistribution {
  bucket: string;
  count: number;
  range: [number, number];
}

export function getIntensityDistribution(memories: SmellMemory[]): IntensityDistribution[] {
  const buckets = [
    { bucket: '1-2', range: [1, 2] as [number, number] },
    { bucket: '3-4', range: [3, 4] as [number, number] },
    { bucket: '5-6', range: [5, 6] as [number, number] },
    { bucket: '7-8', range: [7, 8] as [number, number] },
    { bucket: '9-10', range: [9, 10] as [number, number] },
  ];
  return buckets.map(b => ({
    ...b,
    count: memories.filter(m => m.intensity >= b.range[0] && m.intensity <= b.range[1]).length,
  }));
}

export function getAverageIntensity(memories: SmellMemory[]): number {
  if (!memories.length) return 0;
  const sum = memories.reduce((acc, m) => acc + m.intensity, 0);
  return Math.round((sum / memories.length) * 10) / 10;
}

export function getTopIntensityMemories(memories: SmellMemory[], n = 5): SmellMemory[] {
  return [...memories].sort((a, b) => b.intensity - a.intensity).slice(0, n);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

export function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

export function contrastTextColor(hex: string): string {
  return isLightColor(hex) ? '#2A2118' : '#FBF7EE';
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}.${day}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function getDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isSameDay(iso1: string, iso2: string): boolean {
  return getDateKey(iso1) === getDateKey(iso2);
}

export function isSameMonth(year: number, month: number, iso: string): boolean {
  const d = new Date(iso);
  return d.getFullYear() === year && d.getMonth() === month;
}

export function getMonthMatrix(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const matrix: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  for (let i = 0; i < startWeekday; i++) {
    week.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(new Date(year, month, day));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    matrix.push(week);
  }

  return matrix;
}

export function formatMonthLabel(year: number, month: number): string {
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return `${year}年 ${months[month]}`;
}

export interface ScentInspiration {
  season: Season;
  smell_type: SmellType;
  emotion: Emotion;
  intensity: number;
  humidity: number;
  prompt: string;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateScentInspiration(): ScentInspiration {
  const season = randomFrom(SEASONS);
  const smellType = randomFrom(SMELL_TYPES);
  const emotion = randomFrom(EMOTIONS);
  const intensity = randomInt(3, 9);
  const humidity = randomInt(2, 9);

  const prompts = [
    `想象一个${season.emoji}${season.label}日的午后，空气中弥漫着${smellType.emoji}${smellType.label}调的气息，让你感到${emotion.emoji}${emotion.label}……`,
    `某个${season.label}天的傍晚，一阵${smellType.label}袭来，${emotion.label}的情绪涌上心头，去记录下这个瞬间吧！`,
    `${season.emoji} 在${season.label}的街角，偶遇一缕${smellType.emoji}${smellType.label}，唤起了${emotion.label}的心情，这会是怎样的故事呢？`,
    `推开一扇${season.label}的窗，${smellType.emoji}${smellType.label}飘了进来，${emotion.label}的记忆就此开启……`,
    `记录一段${season.label}的${smellType.label}，强度${intensity}/10，搭配${emotion.label}的心情，会是什么味道？`,
  ];

  return {
    season: season.value,
    smell_type: smellType.value,
    emotion: emotion.value,
    intensity,
    humidity,
    prompt: randomFrom(prompts),
  };
}
