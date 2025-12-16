export enum ArcanaType {
  MAJOR = '大阿卡纳',
  MINOR = '小阿卡纳'
}

export enum Suit {
  WANDS = '权杖',
  CUPS = '圣杯',
  SWORDS = '宝剑',
  PENTACLES = '星币',
  NONE = '无'
}

export interface TarotCard {
  id: number;
  name: string;
  englishName: string; // Added field for English display
  suit: Suit;
  number: number;
  arcana: ArcanaType;
  keywords: string[];
  element?: string;
  description: string;
}

export interface DrawnCard extends TarotCard {
  isReversed: boolean;
  spreadPositionIndex: number;
}

export interface SpreadPosition {
  index: number;
  name: string;
  description: string;
  x: number; // Relative x position (0 is center)
  y: number; // Relative y position (0 is center)
}

export interface Spread {
  id: string;
  name: string;
  description: string;
  positions: SpreadPosition[];
}

export type AppState = 
  | 'INPUT' 
  | 'ANALYZING_INTENT' 
  | 'SHUFFLING' 
  | 'DRAWING' 
  | 'READING';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}