/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameID, VoicePlayer } from './types';
import { INITIAL_ROOM_PLAYERS, GAME_PROFILES } from './data';
import PhoneEmulator from './components/PhoneEmulator';
import TelemetryConsole from './components/TelemetryConsole';
import AudioVisualizer from './components/AudioVisualizer';
import { 
  Sparkles, HelpCircle, Shield, Volume2, Cpu, Laptop, Phone, Gamepad2, Wifi, Layers, Flame, BookOpen, Clock, Zap, CheckCircle2 
} from 'lucide-react';

export default function App() {
  // Real-time voice room members state
  const [nodes, setNodes] = useState<VoicePlayer[]>(() => {
    const saved = localStorage.getItem('crewlink_room_gamers');
    return saved ? JSON.parse(saved) : INITIAL_ROOM_PLAYERS;
  });

  // Global settings synced across phone and telemetry center
  const [selectedGameId, setSelectedGameId] = useState<GameID>('amongus');
  const [serviceActive, setServiceActive] = useState<boolean>(true);
  const [showingSystemDoc, setShowingSystemDoc] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('crewlink_room_gamers', JSON.stringify(nodes));
  }, [nodes]);

  // Periodic simulated speaker indicator animations so the visual waves always appear alive
  useEffect(() => {
    const interval = setInterval(() => {
      if (!serviceActive) return;
      // Randomly pick a player to blink they are talking
      setNodes(prev => {
        const speakingIdIndex = Math.floor(Math.random() * prev.length);
        return prev.map((node, index) => ({
          ...node,
          isSpeaking: index === speakingIdIndex && !node.isMuted
        }));
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [serviceActive]);

  const currentProfile = GAME_PROFILES.find(p => p.id === selectedGameId) || GAME_PROFILES[0];
  const activeSpeakingStatus = nodes.some(n => n.isSpeaking);

  return (
    <div 
      id="crewlink-gaming-portal-root" 
      className="flex flex-col min-h-screen w-full bg-slate-950 text-slate-100 antialiased font-sans select-none"
    >
      
      {/* 1. Global Portal Navigation Header */}
      <header id="main-portal-header" className="h-16 border-b border-indigo-950/20 bg-slate-950/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-30 relative">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl shadow-xl shadow-indigo-950/30">
            <Gamepad2 className="w-5.5 h-5.5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-widest flex items-center gap-2 uppercase">
              <span>CrewLink Mobile</span>
              <span className="text-[9.5px] tracking-normal font-mono font-bold bg-[#a855f7]/15 text-[#c084fc] px-2 py-0.5 rounded border border-[#a855f7]/20 uppercase">
                V1.12 Release
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-sans tracking-wide">AI Spatial Voice Proximity Routing & Diagnostics Companion</p>
          </div>
        </div>

        {/* Global info indicators */}
        <div className="flex items-center gap-4">
          
          <button
            id="btn-global-docs-drawer"
            onClick={() => setShowingSystemDoc(!showingSystemDoc)}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-850 text-slate-300 hover:text-white transition-all flex items-center gap-2 hover:bg-slate-850 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>Setup Blueprints</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 bg-indigo-950/25 border border-indigo-900/30 px-3 py-1.5 rounded-xl shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10.5px] font-mono text-slate-300">SERVER AP-EAST-2</span>
          </div>

        </div>

      </header>

      {/* 2. Main Widescreen Cabin Split Dashboard */}
      <main id="main-split-cabin-mesh" className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Narrative details & game configurations */}
        <div id="col-narratives-and-docs" className="lg:col-span-3 space-y-6 flex flex-col justify-between self-stretch">
          
          <div className="space-y-6">
            
            {/* Startup Product introduction block */}
            <div id="product-overview-card" className="bg-slate-900 border border-slate-800 rounded-[30px] p-5 space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              </div>

              <span className="text-[9.5px] font-mono font-bold tracking-widest text-[#a855f7] uppercase block">
                Gaming Startup Companion
              </span>
              <h2 className="text-sm font-extrabold text-white tracking-wide leading-snug">
                Automatic Proximity voice matrix for match groups
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                CrewLink Mobile hooks directly into standard smartphone audio streams. It matches matching players using low-latency WebRTC and routes channels automatically based on game state events (Alive, Dead, Emergency Meetings) without any secondary manual clicking!
              </p>
            </div>

            {/* Quick Game Preset Selector details */}
            <div id="active-game-preset-dashboard" className="bg-slate-900 border border-slate-800 rounded-[30px] p-5 space-y-3">
              <span className="text-[9.5px] font-mono font-bold tracking-widest text-[#22d3ee] uppercase block">Active Profile Details</span>
              
              <div className="space-y-2 font-sans text-xs">
                <div className="flex justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-slate-500 font-medium">Selected Game:</span>
                  <strong className="text-white font-extrabold">{currentProfile.name}</strong>
                </div>

                <div className="flex justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-slate-500 font-medium">Proximity Hook:</span>
                  <strong className="text-slate-300">{currentProfile.category}</strong>
                </div>

                <div className="flex justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-slate-500 font-medium">Auto Alive/Dead Swap:</span>
                  <span className={`font-bold ${currentProfile.aliveDeadSupport ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {currentProfile.aliveDeadSupport ? 'SUPPORTED' : 'NOT SUPPORTED'}
                  </span>
                </div>

                <div className="flex justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-slate-500 font-medium">High Tech Codec:</span>
                  <span className="text-slate-400 font-mono text-[9px] font-bold">{currentProfile.recommendedCodec}</span>
                </div>
              </div>
            </div>

            {/* Simulated Live setup checklist */}
            <div id="live-setup-checklist-box" className="p-5 bg-slate-900 border border-slate-800 rounded-[30px] space-y-3">
              <span className="text-[9.5px] font-mono font-bold tracking-widest text-[#ec4899] uppercase block">One-Time Setup Status</span>
              
              <div className="space-y-2">
                {[
                  { text: 'Android Accessibility Hook Active', done: true },
                  { text: 'Draw-Over / Overlay Allow List', done: true },
                  { text: 'Background Battery Saver Bypass', done: false },
                  { text: 'Mic Shared OS Mutex Hook', done: true }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[8.5px] ${
                      item.done ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/40' : 'bg-red-950 text-red-400 border border-red-900/20'
                    }`}>
                      {item.done ? '✓' : '!'}
                    </div>
                    <span className={item.done ? 'text-slate-400' : 'text-slate-300 font-bold'}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div id="narrative-footer" className="mt-4">
            <span className="text-[9px] text-slate-500 font-mono block">
              © 2026 CrewLink Labs Inc. All server rights reserved. 
            </span>
          </div>

        </div>

        {/* CENTER COLUMN: The smartphone emulator simulator */}
        <div id="col-phone-simulation-frame" className="lg:col-span-4 flex justify-center">
          <PhoneEmulator 
            nodes={nodes}
            onUpdateNodes={setNodes}
            selectedGameId={selectedGameId}
            onSelectGame={setSelectedGameId}
            serviceActive={serviceActive}
            onToggleService={setServiceActive}
          />
        </div>

        {/* RIGHT COLUMN: Professional Audio visualizer spectrographs and Server Admin monitors */}
        <div id="col-server-voice-spectre" className="lg:col-span-5 space-y-6 flex flex-col justify-between self-stretch">
          
          <AudioVisualizer 
            isSpeaking={serviceActive && activeSpeakingStatus}
            suppressionLevel={85}
          />

          <TelemetryConsole 
            nodes={nodes}
            selectedGameId={selectedGameId}
            serviceActive={serviceActive}
          />

        </div>

      </main>

      {/* 3. System documentation drawer overlays */}
      {showingSystemDoc && (
        <div id="docs-drawer-backdrop" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div id="docs-drawer-content" className="bg-slate-900 border border-indigo-950 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            
            <div className="flex items-center gap-2.5 border-b border-indigo-950/30 pb-3">
              <Layers className="w-5 h-5 text-[#a855f7]" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">CREWLINK PROFESSIONAL SETUP BLUEPRINTS</h3>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans max-h-[380px] overflow-y-auto pr-1">
              
              <div className="space-y-1">
                <h4 className="text-white font-extrabold">1. Core Android Draw-Over Accessibility Instructions</h4>
                <p className="text-slate-400">
                  To overlay speaker bubbles on top of Roblox or Among Us gameplay without switching tabs:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-[11px] text-slate-400">
                  <li>Navigate to mobile system settings {`->`} Applications.</li>
                  <li>Locate 'CrewLink' and tap 'Display Over Other Apps'.</li>
                  <li>Toggle the accessibility switch to 'Allowed'.</li>
                </ol>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800">
                <h4 className="text-white font-extrabold">2. Intelligent Noise Cancellation specs (Opus 48kbps)</h4>
                <p className="text-slate-400">
                  The voice system clips noise parameters at selected decibel floors. Hand finger friction is analyzed on the client side using FFT (Fast Fourier Transform), dampening persistent non-vocal hums entirely.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800">
                <h4 className="text-white font-extrabold">3. Micro battery optimizations</h4>
                <p className="text-slate-400">
                  VoIP channels typically drain batteries rapidly. CrewLink bypasses continuous TCP handshakes using UDP peer signaling, shutting down non-essential audio sockets during inactive lobby transitions.
                </p>
              </div>

            </div>

            <button
              id="btn-close-docs-drawer"
              onClick={() => setShowingSystemDoc(false)}
              className="w-full py-2.5 bg-[#a855f7] hover:bg-[#a855f7]/90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#a855f7]/20"
            >
              Close Setup Blueprints
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
