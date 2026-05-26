/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameProfile, VoicePlayer, ChatMessage, GameID, PresetScreenshot } from '../types';
import { GAME_PROFILES, PRESET_SCREENSHOTS } from '../data';
import { 
  Wifi, Battery, Volume2, ShieldAlert, Sparkles, Send, Upload, HelpCircle, 
  Settings, User, Phone, Play, Power, Plus, Trash2, ShieldCheck, Gamepad2, 
  Mic, MicOff, MessageSquare, AlertCircle, RefreshCw, Layers, Check, BatteryCharging,
  Sliders, ArrowUpRight, Copy
} from 'lucide-react';

interface PhoneEmulatorProps {
  nodes: VoicePlayer[];
  onUpdateNodes: (nodes: VoicePlayer[]) => void;
  selectedGameId: GameID;
  onSelectGame: (id: GameID) => void;
  serviceActive: boolean;
  onToggleService: (status: boolean) => void;
}

export default function PhoneEmulator({
  nodes,
  onUpdateNodes,
  selectedGameId,
  onSelectGame,
  serviceActive,
  onToggleService,
}: PhoneEmulatorProps) {
  // Mobile UI Tabs: 'home' | 'room' | 'ai' | 'settings' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'room' | 'ai' | 'settings' | 'profile'>('home');
  const [onboardStep, setOnboardStep] = useState<number>(1);
  const [showOnboard, setShowOnboard] = useState<boolean>(true);
  
  // Custom Room details
  const [roomInput, setRoomInput] = useState<string>('CREW-990-PROXIMITY');
  const [joinedRoom, setJoinedRoom] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [lobbyRooms, setLobbyRooms] = useState<GameProfile[]>(() => {
    const saved = localStorage.getItem('crewlink_lobby_rooms');
    return saved ? JSON.parse(saved) : GAME_PROFILES;
  });

  useEffect(() => {
    localStorage.setItem('crewlink_lobby_rooms', JSON.stringify(lobbyRooms));
  }, [lobbyRooms]);

  const handleCopyCode = () => {
    if (!roomInput) return;
    navigator.clipboard.writeText(roomInput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
    });
  };

  const generateCryptoRandomRoomCode = (prefix?: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(8);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < 8; i++) {
        code += chars[array[i] % chars.length];
      }
    } else {
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    return prefix ? `${prefix.slice(0, 4).toUpperCase()}-${code}` : code;
  };
  
  // UI State toggles inside phone
  const [overlayEnabled, setOverlayEnabled] = useState<boolean>(true);
  const [noiseReductionVal, setNoiseReductionVal] = useState<number>(85);
  const [voiceEnhancementMode, setVoiceEnhancementMode] = useState<string>('warm');
  const [highClarMode, setHighClarMode] = useState<boolean>(true);

  // AI Chat & Diagnostics state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'ai-welcome',
      sender: 'assistant',
      text: "🎮 Yo! I am **CrewLink Core AI**. I handle real-time spatial voice optimization. Ask me about in-game setups, Android overlay blockages, or background performance issues!",
      timestamp: '12:00 am',
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Floating widget state
  const [draggingOverlay, setDraggingOverlay] = useState(false);
  const [overlayPos, setOverlayPos] = useState({ x: 200, y: 150 });
  const [showMiniOverlayMenu, setShowMiniOverlayMenu] = useState(false);
  
  const currentProfile = lobbyRooms.find(g => g.id === selectedGameId) || GAME_PROFILES.find(g => g.id === selectedGameId) || GAME_PROFILES[0];

  // Auto scroll chat to bottom when message arrives
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle custom audio warning triggers
  const playInteractionSound = () => {
    // Subtle audio frequency synthesized through AudioContext for immersive gaming-vibe
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (_) {}
  };

  const handleToggleServiceTrigger = () => {
    playInteractionSound();
    onToggleService(!serviceActive);
  };

  // Add customized player to live room
  const handleAddLiveGamer = () => {
    const defaultAvatars = ['🐙', '🦊', '🐻', '🐼', '🐯', '🐸', '🐨'];
    const names = ['SpawnCamper', 'AmongImp_4', 'RobloxWiz', 'PubgSniperMaster', 'FreeFireRulz', 'BloxHero'];
    
    const newGamer: VoicePlayer = {
      id: `custom-g-${Date.now()}`,
      username: names[Math.floor(Math.random() * names.length)] + '_' + Math.floor(Math.random() * 90 + 10),
      avatar: defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
      isAlive: true,
      isMuted: false,
      isSpeaking: false,
      volume: 80,
      pingMs: Math.floor(Math.random() * 30 + 15),
      deviceBattery: Math.floor(Math.random() * 60 + 40),
    };

    onUpdateNodes([...nodes, newGamer]);
  };

  const handleSwitchPlayerAliveState = (playerId: string) => {
    playInteractionSound();
    onUpdateNodes(
      nodes.map(n => n.id === playerId ? { ...n, isAlive: !n.isAlive } : n)
    );
  };

  const handleSwitchPlayerMuteState = (playerId: string) => {
    onUpdateNodes(
      nodes.map(n => n.id === playerId ? { ...n, isMuted: !n.isMuted, isSpeaking: n.isMuted ? false : n.isSpeaking } : n)
    );
  };

  const handleAdjustPlayerVolume = (playerId: string, val: number) => {
    onUpdateNodes(
      nodes.map(n => n.id === playerId ? { ...n, volume: val } : n)
    );
  };

  const handleSpawnSimulationSpeech = () => {
    if (nodes.length === 0) return;
    // Choose random unmuted player to simulate live talking feedback
    const activeUnmuted = nodes.filter(n => !n.isMuted);
    if (activeUnmuted.length === 0) return;
    
    const speakIndex = Math.floor(Math.random() * activeUnmuted.length);
    const targetPlayer = activeUnmuted[speakIndex];

    onUpdateNodes(
      nodes.map(n => n.id === targetPlayer.id ? { ...n, isSpeaking: true } : { ...n, isSpeaking: false })
    );

    setTimeout(() => {
      onUpdateNodes(
        nodes.map(n => n.id === targetPlayer.id ? { ...n, isSpeaking: false } : n)
      );
    }, 1500);
  };

  // Chat message query to Express server side AI
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || aiLoading) return;

    const userText = chatInput;
    setChatInput('');
    
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setAiLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatMessages.slice(-5).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          }))
        })
      });

      if (!res.ok) throw new Error('Speech synthesis brain error.');
      const data = await res.json();
      
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: '⚠️ Communication delay with Gemini. Please check your **Settings > Secrets** panel or retry in a brief moment!',
        timestamp: 'Error',
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Launch AI screenshot analysis instantly
  const handleDiagnoseScreenshot = async (preset: PresetScreenshot) => {
    setAiLoading(true);
    
    // Inject alert to chatbot
    const diagnosticMessage: ChatMessage = {
      id: `user-diag-${Date.now()}`,
      sender: 'user',
      text: `🔄 *Initiating instant visual check on:* **"${preset.title}"**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, diagnosticMessage]);

    try {
      const res = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: preset.imageBase64,
          imageMimeType: 'image/png',
          customContext: preset.simulatedIssue,
        })
      });

      if (!res.ok) throw new Error('Visual cognitive engine rejected input.');
      const data = await res.json();

      setChatMessages(prev => [...prev, {
        id: `ai-diag-${Date.now()}`,
        sender: 'assistant',
        text: `🧠 **CrewLink Settings Diagnosis Completed:**\n\n${data.analysis}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        id: `ai-diag-err-${Date.now()}`,
        sender: 'assistant',
        text: '⚠️ Oh snap! The visual diagnostic analysis met with a server timeout. Please verify your internet router status.',
        timestamp: 'Error',
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Floating layout controls
  const handleDragOverlayEnd = () => {
    setDraggingOverlay(false);
  };

  return (
    <div id="phone-emulator-outer-viewport" className="relative flex flex-col items-center justify-center">
      
      {/* Outer smartphone container chassis */}
      <div 
        id="cyber-phone-frame" 
        className="w-[365px] h-[750px] bg-slate-900 rounded-[48px] border-4 border-slate-800 shadow-2xl overflow-hidden relative p-[10px] ring-2 ring-slate-800/60 ring-offset-4 ring-offset-slate-950 flex flex-col shadow-cyan-950/20"
      >
        {/* Dynamic Front camera notch */}
        <div id="phone-notch" className="absolute top-[14px] left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-full z-50 flex items-center justify-center border border-slate-850">
          <div className="w-3 h-3 bg-indigo-950 border border-indigo-900 rounded-full mr-2 shrink-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
          </div>
          <div className="text-[9.5px] font-bold text-slate-500 tracking-widest uppercase font-mono">CREWLINK</div>
        </div>

        {/* 1. Phone Top Status Bar */}
        <div id="phone-system-top-status" className="h-6 flex items-center justify-between px-6 pt-1 z-40 text-slate-400 text-[10px] font-bold select-none shrink-0 font-mono">
          <span className="text-white">12:07 am</span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <Layers className="w-3 h-3 text-violet-400" />
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-zinc-400">76%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400 rotate-90" />
            </div>
          </div>
        </div>

        {/* Inner Phone OS Stage Screen wrapper */}
        <div id="phone-os-screen-context" className="flex-1 bg-slate-950 rounded-[35px] overflow-hidden flex flex-col relative border border-slate-900 mt-1 select-none">
          
          {/* Onboarding Guide Carousel Overlay */}
          {showOnboard && (
            <div id="phone-onboarding-canvas" className="absolute inset-0 bg-slate-950 z-50 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <span className="text-[9px] font-bold tracking-widest text-[#a855f7] uppercase font-mono">CrewLink Smartphone Setup</span>
                <button 
                  id="btn-skip-onboarding"
                  onClick={() => setShowOnboard(false)}
                  className="text-[10px] font-semibold text-slate-500 hover:text-white"
                >
                  Skip
                </button>
              </div>

              <div className="space-y-4 my-auto">
                {onboardStep === 1 && (
                  <div id="onboard-s-1" className="text-center space-y-3.5">
                    <div className="w-16 h-16 rounded-2xl bg-violet-950/40 border border-violet-500/30 flex items-center justify-center mx-auto shadow-lg shadow-violet-950/20">
                      <Gamepad2 className="w-8 h-8 text-violet-400 animate-bounce" />
                    </div>
                    <h4 className="text-sm font-extrabold text-white tracking-wide">Intelligent Gaming Voice assistant</h4>
                    <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans">
                      Automatically coordinate Alive vs Dead hearing channels while playing popular multiplayer mobile projects.
                    </p>
                  </div>
                )}

                {onboardStep === 2 && (
                  <div id="onboard-s-2" className="text-center space-y-3.5">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mx-auto">
                      <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                    </div>
                    <h4 className="text-sm font-extrabold text-white tracking-wide">AI Noise-Limiter & Clarity</h4>
                    <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans">
                      Suppress fan motors, finger key friction, and mechanical sounds automatically using state-of-the-art filters.
                    </p>
                  </div>
                )}

                {onboardStep === 3 && (
                  <div id="onboard-s-3" className="text-center space-y-3.5">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-extrabold text-white tracking-wide">AI Diagnostics Screenshot Scan</h4>
                    <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans">
                      Encountering permissions lock? Simply feed a screenshot into Gemini for immediate step-by-step fix guides.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {/* Step indicator */}
                <div className="flex justify-center gap-1.5">
                  <div className={`w-3 h-1 rounded-full ${onboardStep === 1 ? 'bg-violet-500' : 'bg-slate-800'}`} />
                  <div className={`w-3 h-1 rounded-full ${onboardStep === 2 ? 'bg-cyan-500' : 'bg-slate-800'}`} />
                  <div className={`w-3 h-1 rounded-full ${onboardStep === 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                </div>
                
                <button
                  id="btn-onboard-next"
                  onClick={() => {
                    playInteractionSound();
                    if (onboardStep < 3) {
                      setOnboardStep(prev => prev + 1);
                    } else {
                      setShowOnboard(false);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-950/20"
                >
                  {onboardStep === 3 ? 'Finish & Launch Setup' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {/* 2. Floating Game Interactive Overlay System */}
          {serviceActive && overlayEnabled && (
            <div 
              id="android-floating-game-overlay-bubble"
              className="absolute z-40 bg-slate-900 border border-slate-755/90 rounded-2xl p-1.5 shadow-xl select-none cursor-move backdrop-blur-md"
              style={{
                left: `${overlayPos.x}px`,
                top: `${overlayPos.y}px`
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingOverlay(true);
              }}
              onClick={() => setShowMiniOverlayMenu(!showMiniOverlayMenu)}
            >
              {/* Outer speaking glowing bubble indicator */}
              <div className="relative">
                <div className={`w-11 h-11 rounded-xl bg-violet-600 border border-white flex items-center justify-center shadow-lg cursor-pointer ${nodes.some(n => n.isSpeaking) ? 'ring-2 ring-violet-400 animate-pulse' : ''}`}>
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border border-slate-900 flex items-center justify-center text-[8px] font-extrabold text-white">
                  {nodes.filter(n => !n.isMuted && n.isAlive).length}
                </span>
              </div>

              {/* Expandable Quick mini menu overlays */}
              {showMiniOverlayMenu && (
                <div id="quick-overlay-dropdown" className="absolute top-13 right-0 w-44 bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2.5 shadow-2xl z-50 text-left font-sans">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-[9.5px] font-bold text-white uppercase tracking-wider">CREWLINK VOICE</span>
                    <button onClick={() => setShowMiniOverlayMenu(false)} className="text-[10px] text-slate-500 hover:text-white">✕</button>
                  </div>
                  
                  {/* Speakers preview */}
                  <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {nodes.map(n => (
                      <div key={n.id} className="flex items-center justify-between text-[10px]">
                        <span className="truncate max-w-[90px] text-slate-300 font-medium">
                          {n.avatar} {n.username}
                        </span>
                        {n.isMuted ? (
                          <MicOff className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${n.isSpeaking ? 'bg-violet-400 animate-ping' : 'bg-emerald-500'}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    id="btn-drag-overlay-close-service"
                    onClick={() => {
                      onToggleService(false);
                      setShowMiniOverlayMenu(false);
                    }}
                    className="w-full text-center py-1 text-[9px] bg-red-950/50 border border-red-900/30 text-red-400 hover:text-red-200 rounded font-bold"
                  >
                    DISABLE OVERLAY
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================
              PHONE WEB TABS: CONTENT SWITCH HOOK
              ========================================= */}
          
          <div id="phone-tab-content-scroller" className="flex-1 overflow-y-auto p-5 pb-20 space-y-5">
            
            {/* T-1. HOME CONTROLLER */}
            {activeTab === 'home' && (
              <div id="phone-h-tab" className="space-y-4">
                
                {/* Main Power Master switch */}
                <div id="home-identity-card" className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-center relative overflow-hidden space-y-4">
                  <div className="absolute top-0 right-0 p-3">
                    <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded font-mono ${serviceActive ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/40' : 'bg-slate-800 text-slate-400'}`}>
                      {serviceActive ? '● STATUS: ONLINE' : '○ ASST: SLEEPING'}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <button
                      id="btn-main-power-service-toggle"
                      onClick={handleToggleServiceTrigger}
                      className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-300 shadow-xl border ${
                        serviceActive 
                          ? 'bg-violet-600/25 text-violet-400 border-violet-500 shadow-violet-500/10' 
                          : 'bg-slate-950 text-slate-500 border-slate-850'
                      }`}
                    >
                      <Power className={`w-8 h-8 ${serviceActive ? 'animate-pulse text-violet-300' : ''}`} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-white text-sm font-extrabold tracking-wide">
                      {serviceActive ? 'CrewLink Engine Enabled' : 'CrewLink Disabled'}
                    </h3>
                    <p className="text-[11px] text-slate-400 px-4">
                      {serviceActive 
                        ? 'Low-latency voice channels connected. Join game to overlay spatial audio!' 
                        : 'Tap the center core button to connect voice rooms and activate filters.'}
                    </p>
                  </div>
                </div>

                {/* Active Game auto-detection panel */}
                <div id="game-detector-panel" className="p-3.5 bg-slate-900 border border-slate-850 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-[9.5px] font-bold text-slate-400 font-mono tracking-wider uppercase">Auto Detected Game</span>
                    <span className="text-[8.5px] text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-850/40 font-mono">LIVE PROFILES</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl text-white shadow">
                        {currentProfile.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-white tracking-wide">{currentProfile.name}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">{currentProfile.category} • {currentProfile.packageID}</p>
                      </div>
                    </div>
                  </div>

                  {/* Configured game selector sliders list */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {GAME_PROFILES.slice(0, 3).map((gp) => (
                      <button
                        id={`btn-game-switcher-${gp.id}`}
                        key={gp.id}
                        onClick={() => {
                          playInteractionSound();
                          onSelectGame(gp.id);
                        }}
                        className={`text-[10.5px] p-2 rounded-xl text-center font-bold tracking-wide transition-all border ${
                          gp.id === selectedGameId 
                            ? 'bg-violet-950/50 text-violet-300 border-violet-500' 
                            : 'bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900'
                        }`}
                      >
                        <span className="block mb-0.5 text-xs">{gp.icon}</span>
                        <span className="truncate block font-sans text-[9px]">{gp.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proximity room connectors */}
                <div id="proximity-connectors" className="p-3.5 bg-slate-900 border border-slate-850 rounded-2xl space-y-3">
                  <span className="text-[9.5px] font-bold text-slate-400 font-mono tracking-wider uppercase block">Room Channel Link</span>

                  {joinedRoom ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-850 font-sans">
                        <div>
                          <p className="text-[11px] font-bold text-white tracking-wide">{roomInput}</p>
                          <p className="text-[9.5px] text-slate-500">{nodes.length} Gamers Connected • EU Central</p>
                        </div>
                        <button
                          id="btn-disconnect-active-room"
                          onClick={() => {
                            playInteractionSound();
                            setJoinedRoom(false);
                          }}
                          className="px-2.5 py-1 text-[10px] bg-red-950/40 text-red-400 hover:text-red-200 rounded-lg font-bold border border-red-900/30"
                        >
                          Leave
                        </button>
                      </div>

                      <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-dashed border-slate-800">
                        <span className="text-[10.5px] text-slate-400 font-medium">Connected Users status:</span>
                        <div className="flex -space-x-1.5 font-sans">
                          {nodes.map(n => (
                            <span key={n.id} className="text-sm shrink-0 bg-slate-900 rounded-full border border-slate-950" title={n.username}>
                              {n.avatar}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        id="input-create-custom-voice-room"
                        type="text"
                        placeholder="ENTER ROOM TOKEN CODE..."
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-850 rounded-lg text-white font-mono tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                      <button
                        id="btn-join-room-mesh-lobby"
                        onClick={() => {
                          playInteractionSound();
                          if (roomInput.trim()) setJoinedRoom(true);
                        }}
                        className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg tracking-wide transition-all"
                      >
                        Join Room Lobby
                      </button>
                    </div>
                  )}

                  {/* Random Room Creation and Direct Switching Buttons Row */}
                  <div className="space-y-2 border-t border-slate-850/60 pt-2.5">
                    <span id="quick-create-channels-title" className="text-[8.5px] font-bold text-violet-400 font-mono tracking-wider uppercase block">
                      ⚡ Quick Create & Switch Channels
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="btn-quick-create-random"
                        onClick={() => {
                          playInteractionSound();
                          const code = generateCryptoRandomRoomCode();
                          setRoomInput(code);
                          setJoinedRoom(true);
                        }}
                        className="p-2 rounded-xl bg-violet-950/40 hover:bg-violet-900/40 border border-violet-850 hover:border-violet-600/50 text-left space-y-1 group transition-all text-white font-sans cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-bold text-violet-300">Random Room</span>
                        </div>
                        <span className="text-[8px] text-slate-400 block font-mono">Auto random routing</span>
                      </button>

                      <button
                        id="btn-quick-create-squad"
                        onClick={() => {
                          playInteractionSound();
                          const code = generateCryptoRandomRoomCode('SQUAD');
                          setRoomInput(code);
                          setJoinedRoom(true);
                        }}
                        className="p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-850 hover:border-cyan-600/50 text-left space-y-1 group transition-all text-white font-sans cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-bold text-cyan-300">Squad Space</span>
                        </div>
                        <span className="text-[8px] text-slate-400 block font-mono">Generate squad code</span>
                      </button>

                      <button
                        id="btn-quick-create-among"
                        onClick={() => {
                          playInteractionSound();
                          const code = generateCryptoRandomRoomCode('AMONG');
                          setRoomInput(code);
                          setJoinedRoom(true);
                        }}
                        className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-850 hover:border-rose-600/50 text-left space-y-1 group transition-all text-white font-sans cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-bold text-rose-300">Among Us Co-Op</span>
                        </div>
                        <span className="text-[8px] text-slate-400 block font-mono">Alive/Dead auto proximity</span>
                      </button>

                      <button
                        id="btn-quick-create-roblox"
                        onClick={() => {
                          playInteractionSound();
                          const code = generateCryptoRandomRoomCode('ROBLO');
                          setRoomInput(code);
                          setJoinedRoom(true);
                        }}
                        className="p-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 border border-amber-850 hover:border-amber-600/50 text-left space-y-1 group transition-all text-white font-sans cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-bold text-amber-300">Roblox Match</span>
                        </div>
                        <span className="text-[8px] text-slate-400 block font-mono">Low latency sound link</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated quick sound check tool */}
                <div id="soundcheck-bar" className="p-3 bg-violet-950/20 border border-violet-900/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-violet-400 animate-pulse" />
                    <span className="text-[10.5px] font-bold text-violet-300">Run quick micro audio signal test</span>
                  </div>
                  <button
                    id="btn-home-sim-talk"
                    onClick={handleSpawnSimulationSpeech}
                    disabled={nodes.length === 0}
                    className="px-2.5 py-1 text-[9px] bg-violet-950/60 hover:bg-violet-900/60 rounded-md font-extrabold text-violet-300 border border-violet-850"
                  >
                    TRIGGER MIC
                  </button>
                </div>

              </div>
            )}

            {/* T-2. VOICE ROOM CONTROLLER / LOBBY */}
            {activeTab === 'room' && (
              <div id="phone-v-tab" className="space-y-4">
                
                {/* 1. Title/Header */}
                <div id="lobby-grid-header" className="border-b border-slate-850 pb-2">
                  <span className="text-[9.5px] font-bold text-violet-400 font-mono tracking-wider uppercase block">
                    🕹️ PROXIMITY LOBBY MANAGER
                  </span>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Select a mode to generate a secure 8-character alphanumeric room code.
                  </p>
                </div>

                {/* 2. Grid of "Create New Room" Buttons for Game Modes */}
                <div id="lobby-create-room-grid" className="grid grid-cols-2 gap-2">
                  {lobbyRooms.map((gp) => {
                    const isActiveGame = gp.id === selectedGameId;
                    return (
                      <button
                        id={`btn-lobby-create-${gp.id}`}
                        key={gp.id}
                        onClick={() => {
                          playInteractionSound();
                          // Generate unique 8-character alphanumeric code
                          const code = generateCryptoRandomRoomCode();
                          setRoomInput(code);
                          onSelectGame(gp.id);
                          setJoinedRoom(true);
                        }}
                        className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all group relative overflow-hidden cursor-pointer h-20 ${
                          gp.id === selectedGameId 
                            ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-500/60 shadow-md shadow-indigo-950/50' 
                            : 'bg-slate-900/65 hover:bg-slate-900 border-slate-850/60 hover:border-slate-700/60'
                        }`}
                      >
                        {/* Glowing accent visual element */}
                        <div className={`absolute top-0 right-0 w-12 h-12 opacity-10 bg-gradient-to-br ${gp.bannerColor || 'from-indigo-500 to-slate-500'}`} />

                        <div className="flex items-center justify-between z-10 w-full min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-base shrink-0 group-hover:scale-110 transition-transform">{gp.icon}</span>
                            <div className="min-w-0">
                              <h4 className="text-[10px] font-extrabold text-white tracking-wide truncate max-w-[65px] leading-tight select-none">
                                {gp.name.replace(' Multiplayer', '').replace(' Bedrock', '').replace(' Mobile', '')}
                              </h4>
                              <p className="text-[8px] text-slate-500 font-mono scale-95 origin-left truncate max-w-[60px]">
                                {gp.category}
                              </p>
                            </div>
                          </div>

                          {/* Trash button to delete from active template list */}
                          <button
                            id={`btn-delete-lobby-${gp.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              playInteractionSound();
                              setLobbyRooms(prev => prev.filter(item => item.id !== gp.id));
                            }}
                            className="p-1 rounded bg-slate-950/80 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800/80 hover:border-red-900 transition-all z-20 cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                            title="Remove Lobby Template"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between w-full mt-1.5 pt-1.5 border-t border-slate-850/40 z-10 select-none">
                          <span className="text-[7.5px] font-extrabold text-violet-400 font-mono tracking-wider flex items-center gap-1">
                            <Plus className="w-2 h-2 text-violet-400 group-hover:rotate-90 transition-transform" />
                            <span>CREATE ROOM</span>
                          </span>
                          {isActiveGame && joinedRoom && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {lobbyRooms.length === 0 && (
                    <div id="lobby-empty-slate" className="col-span-2 text-center py-4 bg-slate-950/40 border border-dashed border-slate-850 rounded-2xl p-3 space-y-2">
                      <p className="text-[10px] text-slate-500 italic">All lobby templates have been removed.</p>
                      <button
                        id="btn-restore-default-lobbies"
                        onClick={() => {
                          playInteractionSound();
                          setLobbyRooms(GAME_PROFILES);
                        }}
                        className="px-2.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-800/60 text-[9px] font-bold text-indigo-300 rounded-xl cursor-pointer transition-colors"
                      >
                        Restore Defaults
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Section Divider for Active Room */}
                <div id="voice-room-identity-section-divider" className="border-t border-slate-850 pt-2.5 space-y-3">
                  <div className="flex-col md:flex md:flex-row items-start md:items-center justify-between gap-1.5 space-y-1 md:space-y-0">
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 font-mono tracking-wide uppercase block">
                        Active Spatial Channel
                      </span>
                      <h3 className="text-xs font-black text-white tracking-widest font-mono uppercase mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{joinedRoom ? roomInput : 'NOT CONNECTED'}</span>
                        {joinedRoom && (
                          <span className="text-[7.5px] tracking-normal font-sans font-bold bg-emerald-950/60 text-emerald-400 px-1 py-0.5 rounded border border-emerald-900/30">
                            ACTIVE
                          </span>
                        )}
                        {joinedRoom && (
                          <button
                            id="btn-copy-room-code"
                            onClick={() => {
                              playInteractionSound();
                              handleCopyCode();
                            }}
                            className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Copy Room Code"
                          >
                            {copied ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                                <span className="text-[7.5px] font-mono tracking-normal text-emerald-400 font-bold">COPIED</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5 text-violet-400" />
                                <span className="text-[7.5px] font-mono tracking-normal text-slate-300 font-bold">COPY</span>
                              </>
                            )}
                          </button>
                        )}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end">
                      {joinedRoom && (
                        <button
                          id="btn-room-trigger-add-gamer"
                          onClick={handleAddLiveGamer}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-400 hover:text-white"
                          title="Add Virtual Gamer"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
                      
                      {joinedRoom && (
                        <button
                          id="btn-phone-disconnect-room"
                          onClick={() => {
                            playInteractionSound();
                            setJoinedRoom(false);
                          }}
                          className="px-2 py-1 bg-red-950/40 hover:bg-red-900/40 border border-red-900/40 text-[9px] font-bold text-red-100 rounded-lg"
                        >
                          Leave
                        </button>
                      )}
                    </div>
                  </div>

                  {joinedRoom ? (
                    <>
                      {/* Active Alive/Dead rule block */}
                      <div id="active-separated-modes-room" className="p-2 border border-slate-850/60 rounded-2xl space-y-1 bg-slate-950/40">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-yellow-400 flex items-center gap-1 font-mono">
                            <AlertCircle className="w-3 h-3 text-yellow-500" />
                            <span>VOICE MATRIX ENFORCED</span>
                          </span>
                          <span className="text-[8px] font-mono font-bold bg-violet-950/40 text-violet-300 px-1 border border-violet-850 rounded">
                            {currentProfile.name.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-normal font-sans">
                          {currentProfile.aliveDeadSupport ? (
                            <span>💀 Dead players auto-routed to Dead Chat channel. Alive players match distance-based spatial panning.</span>
                          ) : (
                            <span>🔒 Standard low-latency distance proximity voice filter is active for this sandbox ecosystem.</span>
                          )}
                        </p>
                      </div>

                      {/* Proximity voice participant grid lists */}
                      <div id="room-pariticipants-scroller" className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                        {nodes.map((player) => (
                          <div 
                            id={`phone-g-node-${player.id}`}
                            key={player.id} 
                            className={`p-2.5 rounded-2xl bg-slate-900 border transition-all ${
                              player.isSpeaking 
                                ? 'border-violet-500 shadow-sm shadow-violet-950/20' 
                                : 'border-slate-850/60'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-base shrink-0">{player.avatar}</span>
                                <div>
                                  <h4 className="text-[11px] font-extrabold text-white truncate max-w-[100px] leading-tight">{player.username}</h4>
                                  <div className="flex items-center gap-1 mt-0.5 text-[8px] font-mono text-slate-500 font-bold">
                                    <span>PING: {player.pingMs}ms</span>
                                    <span>•</span>
                                    <span>BAT: {player.deviceBattery}%</span>
                                  </div>
                                </div>
                              </div>

                              {/* Interactive Status switch elements */}
                              <div className="flex items-center gap-1">
                                <button
                                  id={`btn-toggle-dead-status-${player.id}`}
                                  onClick={() => handleSwitchPlayerAliveState(player.id)}
                                  className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded border transition-all ${
                                    player.isAlive 
                                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' 
                                      : 'bg-red-950/40 text-red-400 border-red-900/30'
                                  }`}
                                >
                                  {player.isAlive ? 'ALIVE' : '💀 DEAD'}
                                </button>

                                <button
                                  id={`btn-mute-toggle-${player.id}`}
                                  onClick={() => handleSwitchPlayerMuteState(player.id)}
                                  className={`p-1.5 rounded-lg border transition-all ${
                                    player.isMuted 
                                      ? 'bg-red-950/50 text-red-500 border-red-900/30' 
                                      : 'bg-slate-950 text-slate-500 border-slate-850 hover:text-white'
                                  }`}
                                >
                                  {player.isMuted ? <MicOff className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
                                </button>
                              </div>
                            </div>

                            {/* Interactive volume sliders */}
                            <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-slate-850/50">
                              <Volume2 className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                              <input
                                id={`volume-slider-${player.id}`}
                                type="range"
                                min="0"
                                max="100"
                                className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                value={player.volume}
                                onChange={(e) => handleAdjustPlayerVolume(player.id, Number(e.target.value))}
                              />
                              <span className="text-[8px] font-mono text-slate-500 font-bold w-6 text-right shrink-0">
                                {player.volume}%
                              </span>
                            </div>
                          </div>
                        ))}

                        {nodes.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-[10px] text-slate-500 italic">No participants found. Add custom members above.</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div id="lobby-offline-instructions" className="p-4 bg-slate-950 border border-slate-850 border-dashed rounded-2xl text-center space-y-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-850/60 flex items-center justify-center mx-auto text-yellow-400">
                        <AlertCircle className="w-4 h-4 animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-extrabold text-white font-sans uppercase">No Active Link Channel</h4>
                        <p className="text-[9.5px] text-slate-500 leading-normal font-sans">
                          Click any custom game mode in the grid above to instantly generate an 8-character token and establish routing.
                        </p>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <input
                          id="lobby-custom-code-input"
                          type="text"
                          maxLength={8}
                          placeholder="ENTER 8-CHAR CODE..."
                          value={roomInput}
                          onChange={(e) => setRoomInput(e.target.value.toUpperCase().slice(0, 8))}
                          className="flex-1 px-3 py-1.5 text-[10.5px] bg-slate-900 border border-slate-850 rounded-lg text-white font-mono tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                        <button
                          id="btn-lobby-manual-join"
                          onClick={() => {
                            playInteractionSound();
                            if (roomInput.trim()) setJoinedRoom(true);
                          }}
                          className="px-3 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-extrabold rounded-lg font-sans cursor-pointer"
                        >
                          JOIN
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* T-3. AI ASSISTANT DIAGNOSTIC CENTER */}
            {activeTab === 'ai' && (
              <div id="phone-ai-tab" className="space-y-4 flex flex-col h-full">
                
                {/* Visual Screenshot Troubleshooter drawer container */}
                <div id="visual-troubleshooter-scroller" className="p-3 bg-slate-900 border border-slate-850 rounded-2xl space-y-3 shrink-0">
                  <div className="flex items-center gap-1.5 border-b border-slate-850 pb-2">
                    <Layers className="w-4 h-4 text-violet-400" />
                    <span className="text-[10px] font-bold text-white tracking-wide uppercase">Screenshots Analyzer</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans pt-0.5">
                    Click any preloaded settings screen to let Gemini inspect system audio blocking configurations immediately!
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_SCREENSHOTS.map((ps) => (
                      <button
                        id={`btn-diagnose-screenshot-${ps.id}`}
                        key={ps.id}
                        disabled={aiLoading}
                        onClick={() => handleDiagnoseScreenshot(ps)}
                        className="p-2 bg-slate-950 border border-slate-850 hover:border-violet-500/60 hover:bg-slate-900 rounded-xl transition-all text-center space-y-1 group cursor-pointer"
                      >
                        <span className="block text-lg group-hover:scale-110 transition-transform">{ps.thumbnail}</span>
                        <span className="truncate block text-[8px] font-extrabold text-slate-400 tracking-wide uppercase">{ps.title.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Chat Area representing conversational help */}
                <div id="chat-scroller-holder" className="flex-1 min-h-[160px] max-h-[220px] rounded-2xl bg-slate-950 border border-slate-850 p-3 overflow-y-auto space-y-3 font-sans">
                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[85%] ${
                        msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div className={`p-2.5 rounded-2xl text-[10.5px] leading-relaxed select-text ${
                        msg.sender === 'user' 
                          ? 'bg-violet-600 text-white rounded-tr-none' 
                          : 'bg-slate-900 text-slate-300 border border-slate-850 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[7.5px] font-mono text-slate-600 mt-1 uppercase font-bold">{msg.timestamp}</span>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat text box */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2 shrink-0">
                  <input
                    id="input-chat-query"
                    type="text"
                    disabled={aiLoading}
                    placeholder="Ask AI Core or query issues..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-850 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-slate-950 transition-all font-sans"
                  />
                  <button
                    id="btn-publish-chat"
                    type="submit"
                    disabled={aiLoading}
                    className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all disabled:opacity-50"
                  >
                    {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </form>

              </div>
            )}

            {/* T-4. SETTINGS & FILTERS */}
            {activeTab === 'settings' && (
              <div id="phone-s-tab-details" className="space-y-4">
                
                {/* Advanced Noise cancellation sliders */}
                <div id="audio-settings-sliders" className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-[9.5px] font-bold text-white tracking-widest font-mono uppercase">AI Noise Reducer</span>
                    <Sliders className="w-3.5 h-3.5 text-violet-400" />
                  </div>

                  {/* Noise cancellation strength slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-sans">
                      <span className="text-slate-400">Filtering fan & motor hums:</span>
                      <strong className="text-violet-300">{noiseReductionVal}% suppression</strong>
                    </div>
                    <input
                      id="noise-reduc-strength-slider"
                      type="range"
                      min="0"
                      max="100"
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      value={noiseReductionVal}
                      onChange={(e) => setNoiseReductionVal(Number(e.target.value))}
                    />
                    <p className="text-[8px] text-slate-500 block italic leading-normal">
                      💡 Dynamically clips mechanical key friction or gaming fan vibration from gaming rigs.
                    </p>
                  </div>

                  {/* Voice correction types presets */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-sans block">Mic Enhancement equalizer:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {['warm', 'vibrant', 'crisp', 'raw'].map((mode) => (
                        <button
                          id={`btn-equalizer-mode-${mode}`}
                          key={mode}
                          onClick={() => setVoiceEnhancementMode(mode)}
                          className={`text-[9.5px] p-2 rounded-xl text-center font-bold tracking-wide transition-all border ${
                            voiceEnhancementMode === mode 
                              ? 'bg-violet-950/40 text-violet-300 border-violet-500' 
                              : 'bg-slate-950 text-slate-500 border-slate-850'
                          }`}
                        >
                          {mode.toUpperCase()} MODE
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Companion Overlay togglers */}
                <div id="companion-overlay-toggles" className="p-3.5 bg-slate-900 border border-slate-850 rounded-2xl space-y-3">
                  <span className="text-[9.5px] font-bold text-slate-400 font-mono tracking-wider uppercase block">Overlay & Performance</span>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[11.5px] font-bold text-white tracking-wide">Enable gaming overlay</h4>
                      <p className="text-[9.5px] text-slate-500">Enable floating widgets during games.</p>
                    </div>
                    <button
                      id="btn-toggle-floating-overlay"
                      onClick={() => setOverlayEnabled(!overlayEnabled)}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 ${
                        overlayEnabled ? 'bg-violet-600' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-300 ${
                        overlayEnabled ? 'transform translate-x-4.5' : ''
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-850/50 pt-3">
                    <div>
                      <h4 className="text-[11.5px] font-bold text-white tracking-wide">High audio priority</h4>
                      <p className="text-[9.5px] text-slate-500">Prevent OS doze mode background kills.</p>
                    </div>
                    <button
                      id="btn-toggle-audio-priority"
                      onClick={() => setHighClarMode(!highClarMode)}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 ${
                        highClarMode ? 'bg-cyan-600' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-300 ${
                        highClarMode ? 'transform translate-x-4.5' : ''
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Reset guidelines and licenses */}
                <div className="text-center pt-2">
                  <p className="text-[8.5px] text-slate-600 font-mono">
                    CREWLINK MOBILE COMPANION APP V1.12 • LICENSED APACHE 2.0
                  </p>
                </div>

              </div>
            )}

            {/* T-5. USER PROFILE PAGE */}
            {activeTab === 'profile' && (
              <div id="phone-p-tab-details" className="space-y-4">
                
                {/* Gamer Identity Card */}
                <div id="profile-identity" className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-violet-500/65 flex items-center justify-center text-3xl shadow-lg relative">
                    <span>🦊</span>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-white">GhostRider_X</h3>
                    <p className="text-[9px] text-violet-400 font-bold uppercase font-mono tracking-widest">CrewLink Admin Member</p>
                  </div>
                  <div className="flex items-center gap-3 w-full bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <div className="flex-1 text-center border-r border-slate-850">
                      <p className="text-[8px] text-slate-500 font-bold tracking-wide font-mono">FRIENDS</p>
                      <p className="text-xs font-extrabold text-white font-sans mt-0.5">24 Connected</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-[8px] text-slate-500 font-bold tracking-wide font-mono">STATION</p>
                      <p className="text-xs font-extrabold text-cyan-400 font-sans mt-0.5">EU Central-1</p>
                    </div>
                  </div>
                </div>

                {/* Friends List status registry */}
                <div id="gamer-friends-registry" className="p-3 bg-slate-900 border border-slate-850 rounded-2xl space-y-2.5">
                  <span className="text-[9.5px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Co-Op Gaming Buddies</span>
                  
                  <div className="space-y-2">
                    {[
                      { name: 'Raptor_Alpha', icon: '🦖', status: 'In Match Roblox' },
                      { name: 'SnowyWhale', icon: '🐳', status: 'Lobby Among Us' },
                      { name: 'ShadowPony_0', icon: '🦄', status: 'Offline' }
                    ].map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-slate-950/50 p-2 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span>{f.icon}</span>
                          <span className="font-bold text-slate-300 text-[11px]">{f.name}</span>
                        </div>
                        <span className={`text-[8.5px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                          f.status.includes('Match') ? 'bg-violet-950/50 text-violet-300' :
                          f.status.includes('Lobby') ? 'bg-cyan-950 text-cyan-400' :
                          'text-slate-600 bg-slate-900'
                        }`}>
                          {f.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* 3. Phone OS Bottom Navigation tabs bar */}
          <nav id="phone-nav-bar" className="absolute bottom-0 inset-x-0 h-16 bg-slate-950 border-t border-slate-900 px-4 flex items-center justify-between z-40 shrink-0">
            <button
              id="btn-nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${
                activeTab === 'home' ? 'text-violet-400 scale-105' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="text-[8.5px] font-bold font-mono tracking-wider uppercase">Console</span>
            </button>

            <button
              id="btn-nav-tab-room"
              onClick={() => setActiveTab('room')}
              className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${
                activeTab === 'room' ? 'text-violet-400 scale-105' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span className="text-[8.5px] font-bold font-mono tracking-wider uppercase">Lobby</span>
            </button>

            <button
              id="btn-nav-tab-ai"
              onClick={() => setActiveTab('ai')}
              className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${
                activeTab === 'ai' ? 'text-violet-400 scale-105' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <MessageSquare className="w-4 h-4 animate-pulse text-cyan-400" />
              <span className="text-[8.5px] font-bold font-mono tracking-wider uppercase">AI Asst</span>
            </button>

            <button
              id="btn-nav-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${
                activeTab === 'settings' ? 'text-violet-400 scale-105' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="text-[8.5px] font-bold font-mono tracking-wider uppercase">Filters</span>
            </button>

            <button
              id="btn-nav-tab-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${
                activeTab === 'profile' ? 'text-violet-400 scale-105' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="text-[8.5px] font-bold font-mono tracking-wider uppercase">Social</span>
            </button>
          </nav>

        </div>

      </div>

    </div>
  );
}
