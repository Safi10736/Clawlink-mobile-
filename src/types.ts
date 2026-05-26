/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameID = 'amongus' | 'pubg' | 'freefire' | 'minecraft' | 'roblox' | 'codm';

export interface GameProfile {
  id: GameID;
  name: string;
  category: string;
  icon: string;
  bannerColor: string;
  recommendedCodec: string;
  latencyOptimized: boolean;
  requiresOverlay: boolean;
  packageID: string;
  aliveDeadSupport: boolean;
}

export interface VoicePlayer {
  id: string;
  username: string;
  avatar: string;
  isAlive: boolean; // BetterCrewLink Proximity / Channel separating state
  isMuted: boolean;
  isSpeaking: boolean;
  volume: number; // 0 to 100
  pingMs: number;
  deviceBattery?: number;
  isHost?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface VoiceRoom {
  roomId: string;
  roomName: string;
  activeGameId: GameID;
  players: VoicePlayer[];
  serverRegion: string;
}

export interface PresetScreenshot {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  imageBase64: string; // pre-populated mock visual byte streams for user demo convenience
  simulatedIssue: string;
}
