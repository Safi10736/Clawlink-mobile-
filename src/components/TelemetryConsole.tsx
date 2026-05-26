/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VoicePlayer, GameProfile, GameID } from '../types';
import { GAME_PROFILES } from '../data';
import { 
  Server, Cpu, Database, Network, TrendingUp, Shield, Zap, Sparkles, 
  Layers, Volume2, HelpCircle, Code, HelpCircle as HelpIcon, ArrowUpRight, CheckSquare, Bookmark, DollarSign
} from 'lucide-react';

interface TelemetryConsoleProps {
  nodes: VoicePlayer[];
  selectedGameId: GameID;
  serviceActive: boolean;
}

export default function TelemetryConsole({ nodes, selectedGameId, serviceActive }: TelemetryConsoleProps) {
  const currentProfile = GAME_PROFILES.find(g => g.id === selectedGameId) || GAME_PROFILES[0];
  const [techTab, setTechTab] = useState<'topology' | 'rules' | 'architect'>('topology');

  // Math totals
  const totalUsers = nodes.length;
  const activeSpeakers = nodes.filter(n => n.isSpeaking).length;
  const averageLatency = Math.round(nodes.reduce((acc, curr) => acc + curr.pingMs, 0) / (totalUsers || 1));
  const activeDeadPlayers = nodes.filter(n => !n.isAlive).length;
  const activeAlivePlayers = nodes.filter(n => n.isAlive).length;

  return (
    <div id="crewlink-telemetry-console-box" className="bg-slate-900 border border-slate-800 rounded-[30px] p-6 flex flex-col h-full space-y-6">
      
      {/* 1. Header with dynamic server status indicators */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-violet-400" />
            <h2 className="text-sm font-extrabold text-white tracking-widest font-mono uppercase">CrewLink Proximity Server Console</h2>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Real-time WebRTC room coordinator & routing matrix</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-mono font-bold text-slate-300">CLOUD DB STATE: SYNCED</span>
        </div>
      </div>

      {/* 2. Key server metric scorecards */}
      <div id="stats-ribbon" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850/50 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wide uppercase">Server Latency</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-cyan-400 font-sans">{serviceActive ? `${averageLatency} ms` : 'Offline'}</span>
            <span className="text-[9px] text-slate-600 font-mono">AVG</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850/50 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wide uppercase">Active Speakers</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-violet-400 font-sans">{serviceActive ? activeSpeakers : '0'}</span>
            <span className="text-[9px] text-slate-600 font-mono">/ {totalUsers}</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850/50 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wide uppercase">Active Dead Lobby</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-rose-400 font-sans">{serviceActive ? activeDeadPlayers : '0'}</span>
            <span className="text-[9px] text-slate-600 font-mono">MUTED</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850/50 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wide uppercase">Sync Profiles</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-emerald-400 font-sans">{GAME_PROFILES.length}</span>
            <span className="text-[9px] text-slate-600 font-mono">GAMES</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation between telemetry view, separating rules, and android optimization architect */}
      <div className="flex border-b border-slate-800 pb-2">
        {(['topology', 'rules', 'architect'] as const).map((tab) => (
          <button
            id={`btn-telemetry-view-tab-${tab}`}
            key={tab}
            onClick={() => setTechTab(tab)}
            className={`px-4 py-1.5 text-xs font-bold tracking-wide transition-all relative cursor-pointer uppercase font-mono ${
              techTab === tab ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
            {techTab === tab && (
              <div className="absolute bottom-[-9px] inset-x-0 h-0.5 bg-violet-400" />
            )}
          </button>
        ))}
      </div>

      {/* 4. Tab content area */}
      <div className="flex-1 overflow-y-auto max-h-[350px] pr-2 space-y-4">
        
        {/* VIEW A: Peer Topology Mapping */}
        {techTab === 'topology' && (
          <div id="tech-tab-topology" className="space-y-4 font-sans">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                <span className="text-xs font-extrabold text-slate-300">WebRTC Sigal Mesh Visualizer</span>
                <span className="text-[9.5px] text-violet-400 font-bold bg-violet-950/40 px-2 py-0.5 rounded border border-violet-900/30 font-mono uppercase">Full Mesh Connected</span>
              </div>

              {/* Topology structural drawing map */}
              <div className="relative h-44 bg-slate-900 rounded-xl overflow-hidden border border-slate-850 flex items-center justify-center p-4">
                
                {/* Visual mesh wire links inside background */}
                <div className="absolute inset-0 opacity-15">
                  <div className="absolute w-[60%] h-[1px] bg-cyan-400 top-1/2 left-1/4 transform -translate-y-1/2"></div>
                  <div className="absolute w-[1px] h-[50%] bg-violet-500 top-1/4 left-1/2 transform -translate-x-1/2"></div>
                  <div className="absolute w-[50%] h-[1px] bg-purple-400 top-1/3 left-1/3 transform rotate-45"></div>
                  <div className="absolute w-[50%] h-[1px] bg-cyan-300 top-1/4 right-1/4 transform -rotate-45"></div>
                </div>

                {/* Hub node center representative */}
                <div className="absolute z-10 w-20 h-20 bg-slate-950 border-2 border-dashed border-violet-500 rounded-full flex flex-col items-center justify-center p-1 shadow-lg shadow-violet-950/20 text-center animate-pulse">
                  <Cpu className="w-5 h-5 text-violet-400" />
                  <span className="text-[8.5px] font-mono text-slate-500 font-black mt-0.5">ROOM ADMIN</span>
                </div>

                {/* Peripheral peer dots */}
                {nodes.map((n, idx) => {
                  const angles = [0, 72, 144, 216, 288, 330];
                  const ang = angles[idx % angles.length] * (Math.PI / 180);
                  const radius = 62;
                  const x = Math.cos(ang) * radius;
                  const y = Math.sin(ang) * radius;

                  return (
                    <div 
                      key={n.id}
                      className="absolute z-20 flex flex-col items-center"
                      style={{
                        transform: `translate(${x}px, ${y}px)`
                      }}
                    >
                      <div className={`w-8 h-8 rounded-full bg-slate-950 border flex items-center justify-center text-sm shadow ${
                        n.isSpeaking ? 'border-cyan-400 scale-110 shadow-cyan-900/40' : 'border-slate-800'
                      }`}>
                        <span>{n.avatar}</span>
                      </div>
                      <span className="text-[8px] font-mono font-bold text-slate-400 mt-1 bg-slate-950/80 px-1 rounded truncate max-w-[55px]">
                        {n.username.split('_')[0]}
                      </span>
                    </div>
                  );
                })}

                {nodes.length === 0 && (
                  <div className="text-center text-xs text-slate-500 italic z-30">No active mesh nodes mapped. Join room.</div>
                )}
              </div>

              <p className="text-[10.5px] text-slate-400 leading-normal">
                🤖 **Topology Details:** Unlike conventional centralized VoIP servers which compress audio and lag during matches, CrewLink employs a localized WebRTC mesh combined with server-assisted signaling. No central server handles speech payloads directly, ensuring zero-latency soundcheck and total confidentiality.
              </p>
            </div>
          </div>
        )}

        {/* VIEW B: Alive / Dead Routing Logic */}
        {techTab === 'rules' && (
          <div id="tech-tab-rules" className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3 font-sans">
              <span className="text-xs font-extrabold text-slate-300 block border-b border-slate-900 pb-1.5">Alive / Dead Voice routing algorithm</span>
              
              <div id="rules-flowchart" className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>ALIVE CORE CHANNEL</span>
                  </div>
                  <p className="text-[9.5px] text-slate-400">
                    Spatially filtered. Players only hear members within proximity distance (configurable up to 25 meters). If player dies in-game, client packets of dead player are blocked to Alive receivers instantly.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-rose-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>DEAD/GHOST CHANNEL</span>
                  </div>
                  <p className="text-[9.5px] text-slate-400">
                    Once marked as dead, the server-side proxy reroutes peer audio feeds into a separate, non-proximity global channel. Dead players can talk to and hear all other ghosts without positional distance restrictions.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-violet-400">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>MEETING MODE OVERRIDE</span>
                  </div>
                  <p className="text-[9.5px] text-slate-400">
                    When an emergency meeting button is pressed in-game, the CrewLink client intercepts this event and opens microphone links across all channel restrictions instantly, letting dead & alive players converse.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW C: Game Overlay & Android Specifications */}
        {techTab === 'architect' && (
          <div id="tech-tab-architect" className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3.5 font-sans justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-300 block border-b border-slate-900 pb-1.5">Android Android-First specifications</span>
                <p className="text-[10.5px] text-slate-400 leading-normal mt-2">
                  Operating in the background on mobile devices requires robust optimization settings to prevent the Android OS from killing the real-time voice channel WebSocket connection.
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-900 pt-2.5">
                {[
                  { title: "SYSTEM DRAW OVERLAY", detail: "Provides the tiny circle speaking avatars on top of games. Requires Android Draw-Over Permission." },
                  { title: "WAKE LOCK WAKE_LOCK", detail: "Enables CPU to process real-time WebRTC audio streams without sleeping when the device screen dimms." },
                  { title: "LOW BATTERY (ECO) MODE", detail: "Throttles background frequency checks slightly from 60Hz to 20Hz when device volume level is static." },
                  { title: "ACCESSIBILITY HOOKS", detail: "Optionally intercepts game state change broadcasts (e.g. Among Us lobby transitions) for automated alive/dead switches." }
                ].map((spec, idx) => (
                  <div key={idx} className="flex flex-col text-[10.5px] pb-1.5 border-b border-slate-900/50">
                    <strong className="text-slate-300 tracking-wide">{spec.title}</strong>
                    <span className="text-slate-500 font-medium text-[9.5px]">{spec.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 5. Startups Breakdown & Business Roadmap Card Section */}
      <div id="biz-architecture-footer-box" className="p-4 bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-850 rounded-2xl space-y-3.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <h3 className="text-xs font-bold text-white tracking-widest font-mono uppercase">Monetization & Upgrade Roadmap</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10.5px] font-sans">
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-850 space-y-1">
            <span className="font-extrabold text-[#c084fc] flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Revenue Streams</span>
            </span>
            <ul className="list-disc pl-3 text-[9px] text-slate-400 space-y-1">
              <li>Premium server nodes selection</li>
              <li>Immersive Custom Voice effects</li>
              <li>Co-Op Team clan dashboards</li>
            </ul>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-850 space-y-1">
            <span className="font-extrabold text-[#22d3ee] flex items-center gap-1 font-sans">
              <Zap className="w-3.5 h-3.5" />
              <span>Future upgrades</span>
            </span>
            <ul className="list-disc pl-3 text-[9px] text-slate-400 space-y-1">
              <li>Automatic voice localization</li>
              <li>Discord voice room bridges</li>
              <li>Deep AI real-time translator</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
