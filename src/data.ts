/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameProfile, VoicePlayer, PresetScreenshot } from './types';

export const GAME_PROFILES: GameProfile[] = [
  {
    id: 'amongus',
    name: 'Among Us Mobile',
    category: 'Social Deduction',
    icon: '🚀',
    bannerColor: 'from-red-600 to-amber-700',
    recommendedCodec: 'Opus 48kbps (Ultra Low Latency)',
    latencyOptimized: true,
    requiresOverlay: true,
    packageID: 'com.innersloth.spacemafia',
    aliveDeadSupport: true,
  },
  {
    id: 'pubg',
    name: 'PUBG Mobile',
    category: 'Battle Royale',
    icon: '🔫',
    bannerColor: 'from-yellow-600 to-slate-800',
    recommendedCodec: 'HD Audio 96kbps with spatialization',
    latencyOptimized: true,
    requiresOverlay: true,
    packageID: 'com.tencent.ig',
    aliveDeadSupport: true,
  },
  {
    id: 'roblox' as any,
    name: 'Roblox Multiplayer',
    category: 'Virtual Sandbox',
    icon: '📦',
    bannerColor: 'from-slate-750 to-indigo-850',
    recommendedCodec: 'Dynamic bandwidth codec',
    latencyOptimized: false,
    requiresOverlay: true,
    packageID: 'com.roblox.client',
    aliveDeadSupport: false,
  },
  {
    id: 'freefire',
    name: 'Garena Free Fire',
    category: 'Battle Royale',
    icon: '🔥',
    bannerColor: 'from-orange-600 to-amber-800',
    recommendedCodec: 'Spatially filtered Opus',
    latencyOptimized: true,
    requiresOverlay: true,
    packageID: 'com.dts.freefireth',
    aliveDeadSupport: true,
  },
  {
    id: 'minecraft',
    name: 'Minecraft Bedrock',
    category: 'Sandbox Adventure',
    icon: '⛏️',
    bannerColor: 'from-emerald-700 to-green-900',
    recommendedCodec: 'Eco Bandwidth 32kbps',
    latencyOptimized: false,
    requiresOverlay: false,
    packageID: 'com.mojang.minecraftpe',
    aliveDeadSupport: false,
  },
  {
    id: 'codm',
    name: 'Call of Duty: Mobile',
    category: 'Tactical Shooter',
    icon: '🎖️',
    bannerColor: 'from-zinc-800 to-amber-950',
    recommendedCodec: 'Opus Stereo 64kbps Pro Gaming',
    latencyOptimized: true,
    requiresOverlay: true,
    packageID: 'com.activision.callofduty.shooter',
    aliveDeadSupport: true,
  }
];

export const INITIAL_ROOM_PLAYERS: VoicePlayer[] = [
  {
    id: 'player-1',
    username: 'GhostRider_X',
    avatar: '🦊',
    isAlive: true,
    isMuted: false,
    isSpeaking: true,
    volume: 85,
    pingMs: 24,
    deviceBattery: 78,
    isHost: true,
  },
  {
    id: 'player-2',
    username: 'LunarPrincess',
    avatar: '🦄',
    isAlive: true,
    isMuted: false,
    isSpeaking: false,
    volume: 72,
    pingMs: 38,
    deviceBattery: 92,
  },
  {
    id: 'player-3',
    username: 'PixelDragon_07',
    avatar: '🐉',
    isAlive: false, // Dead state means simulated CrewLink mutes them to alive players
    isMuted: false,
    isSpeaking: true,
    volume: 60,
    pingMs: 45,
    deviceBattery: 45,
  },
  {
    id: 'player-4',
    username: 'ZuckTheImposter',
    avatar: '👽',
    isAlive: false, // Speaks inside dead channel securely
    isMuted: false,
    isSpeaking: false,
    volume: 50,
    pingMs: 32,
    deviceBattery: 61,
  },
  {
    id: 'player-5',
    username: 'ShadowSlayer',
    avatar: '🐺',
    isAlive: true,
    isMuted: true,
    isSpeaking: false,
    volume: 0,
    pingMs: 19,
    deviceBattery: 83,
  }
];

// Lightweight Base64 icons/diagrams representing common phone setup blockages.
// These are 1x1 or trivial pixel matrices blockages for fast transfer.
export const PRESET_SCREENSHOTS: PresetScreenshot[] = [
  {
    id: 'error-overlay',
    title: '⚠️ Overlay Draw-Over Blocked',
    description: 'System alert indicating "Display Over Other Apps Permission Denied". Prevents the floating game audio bubble.',
    category: 'System Permission Error',
    thumbnail: '🖼️',
    // 10x10 transparent orange pixel matrix representation
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAG0lEQVR42mP8z8BQD8REg4EBBvSg0vD3f7LBAEisCRWc4U+YAAAAAElFTkSuQmCC',
    simulatedIssue: 'Android Display Draw-Over permission conflict',
  },
  {
    id: 'error-mic',
    title: '🎙️ Mic In-Use Conflict',
    description: 'System notification stating "Microphone is already occupied by game client audio loop". Voice assistant is muted.',
    category: 'Hardware Shared Conflict',
    thumbnail: '🎤',
    // 10x10 transparent red pixel matrix representation
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAG0lEQVR42mP8z8BQD8REg4EBBvSg0vD3f7LBAEisCRWc4U+YAAAAAElFTkSuQmCC',
    simulatedIssue: 'OS Mic Mutex occupied by Roblox or Among Us game stream',
  },
  {
    id: 'error-battery',
    title: '🔋 Heavy Battery Restriction limit',
    description: 'App battery saver is configured to "Optimized (Deep sleep / Kill background tasks after 10 mins)". Breaks multi-game overlays.',
    category: 'OS Background Kill warning',
    thumbnail: '🔋',
    // 10x10 transparent green/yellow pixel matrix representation
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAG0lEQVR42mP8z8BQD8REg4EBBvSg0vD3f7LBAEisCRWc4U+YAAAAAElFTkSuQmCC',
    simulatedIssue: 'OS Doze battery optimization killing background WebRTC websocket connection',
  }
];
