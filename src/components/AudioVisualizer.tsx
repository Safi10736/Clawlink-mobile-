/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Volume2, Sliders, Waves, Activity } from 'lucide-react';

interface AudioVisualizerProps {
  isSpeaking: boolean;
  suppressionLevel: number;
}

export default function AudioVisualizer({ isSpeaking, suppressionLevel }: AudioVisualizerProps) {
  const [phase, setPhase] = useState(0);

  // Drive animation clock loop
  useEffect(() => {
    let animId: number;
    const update = () => {
      setPhase(p => (p + 0.12) % (Math.PI * 2));
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Compute SVG sine paths with noise distortion scaled by suppression Level
  const generateSineWavePath = (
    amplitude: number, 
    frequency: number, 
    noiseLevel: number, 
    wavePhase: number
  ) => {
    const points = [];
    const width = 360;
    const height = 100;
    const midY = height / 2;

    for (let x = 0; x <= width; x += 4) {
      // Base sine calculation
      const angle = (x / width) * Math.PI * 2 * frequency + wavePhase;
      let y = Math.sin(angle) * amplitude;

      // Add noise frequency spike modulation
      if (noiseLevel > 0) {
        const noiseAngleScalar = (x / width) * Math.PI * 30 + (wavePhase * 3);
        const dynamicNoise = Math.sin(noiseAngleScalar) * (amplitude * 0.4 * noiseLevel);
        const highPitchWhine = Math.cos(x * 12 + wavePhase * 10) * (amplitude * 0.15 * noiseLevel);
        y += dynamicNoise + highPitchWhine;
      }

      points.push(`${x},${midY + y}`);
    }

    return `M ${points.join(' L ')}`;
  };

  // Speaks: amplitude is large, silent: small trace line
  const amplitudeFactor = isSpeaking ? 24 : 3;
  
  // Distortions scale: high suppression -> low noise, low suppression -> high noise
  const noiseScale = Math.max(0, (100 - suppressionLevel) / 100);

  return (
    <div id="ai-spectral-core-visualizer" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400" />
          <h4 className="text-xs font-bold text-white tracking-widest font-mono uppercase">AI Spectral Noise suppression Analyser</h4>
        </div>
        <div className="flex items-center gap-1.5 bh bg-slate-950 px-2 py-0.5 rounded-md border border-slate-850">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[9px] text-cyan-300 font-mono text-right">SPECTRUM ALIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Channel 1: Cleaned stream */}
        <div id="ch-1-visuals" className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-850 relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-sans">
            <span className="text-cyan-400 font-bold tracking-wide">STREAM A: AI CORE (Cleaned Signal)</span>
            <span className="text-slate-500 font-mono">0.02ms latency</span>
          </div>

          <div className="h-24 flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 360 100">
              {/* Main signal line representing optimized voice */}
              <path
                d={generateSineWavePath(amplitudeFactor, 2.5, noiseScale * 0.1, phase)}
                fill="none"
                stroke="url(#cyan-cyber-grad)"
                strokeWidth="2.5"
                className="transition-all duration-300"
              />
              
              {/* Accompanying echo delay line */}
              <path
                d={generateSineWavePath(amplitudeFactor * 0.8, 2.5, noiseScale * 0.05, phase - 0.5)}
                fill="none"
                stroke="rgba(34, 211, 238, 0.25)"
                strokeWidth="1.5"
              />

              {/* Linear color gradients definition */}
              <defs>
                <linearGradient id="cyan-cyber-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-2 font-mono">
            <span>High Fidelity Opus Codec</span>
            <span className="text-emerald-400 font-bold bg-emerald-950/20 px-1.5 rounded py-0.5">FILTER ACTIVE</span>
          </div>
        </div>

        {/* Channel 2: Heavy Raw noisy background stream */}
        <div id="ch-2-visuals" className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-850 relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-sans">
            <span className="text-rose-500 font-bold tracking-wide">STREAM B: RAW INPUT (Unfiltered Mic)</span>
            <span className="text-slate-500 font-mono">Fan/Keyboard noise</span>
          </div>

          <div className="h-24 flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 360 100">
              <path
                d={generateSineWavePath(amplitudeFactor, 4.5, noiseScale * 0.9 + 0.15, phase * 1.5)}
                fill="none"
                stroke="url(#rose-cyber-grad)"
                strokeWidth="2.0"
              />

              <defs>
                <linearGradient id="rose-cyber-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-2 font-mono">
            <span>Hardware captured signal</span>
            <span className="text-rose-400 text-[9px] font-extrabold bg-rose-950/20 px-1.5 rounded py-0.5 animate-pulse">NOISY FAN / MOTORS</span>
          </div>
        </div>

      </div>

    </div>
  );
}
