/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioEngine() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const toggleSound = () => {
    if (isPlaying) {
      stopNoise();
    } else {
      startNoise();
    }
  };

  const startNoise = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Generate a pink noise buffer for crowd rumble
      const bufferSize = 4 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      let b0 = 0.0, b1 = 0.0, b2 = 0.0, b3 = 0.0, b4 = 0.0, b5 = 0.0, b6 = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // rescue clipping
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Filter settings for crowd roar (heavy lowpass & bandpass filtering)
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 260; // low frequency rumble

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 350;
      bandpass.Q.value = 1.0;

      const gain = ctx.createGain();
      gain.gain.value = 0.3; // Low ambient level

      // Connect nodes
      noiseSource.connect(lowpass);
      lowpass.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      // Start source
      noiseSource.start();
      
      gainNodeRef.current = gain;
      setIsPlaying(true);
      
      // Periodically trigger a cheer "wave" to simulate wickets/boundaries
      const cheerTimer = setInterval(() => {
        if (!gainNodeRef.current) return;
        const now = ctx.currentTime;
        // Surge value
        gainNodeRef.current.gain.setValueAtTime(0.3, now);
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.75, now + 1.2);
        gainNodeRef.current.gain.setValueAtTime(0.75, now + 2.5);
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.3, now + 4.5);
      }, 7000);

      (noiseSource as any).cheerTimer = cheerTimer;
      noiseNodeRef.current = noiseSource as any;
    } catch (e) {
      console.error('Audio engine failed to initialize:', e);
    }
  };

  const stopNoise = () => {
    try {
      if (noiseNodeRef.current) {
        const source = noiseNodeRef.current as any;
        if (source.cheerTimer) clearInterval(source.cheerTimer);
        source.stop();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    } catch (e) {
      console.log(e);
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      // Cleanup audio context on unmount
      try {
        if (audioCtxRef.current) {
          audioCtxRef.current.close();
        }
      } catch (e) {}
    };
  }, []);

  return (
    <button
      id="btn_ambient_sound"
      onClick={toggleSound}
      title={isPlaying ? "Mute Stadium Noise" : "Unmute Stadium Noise"}
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all duration-200 ${
        isPlaying 
          ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20' 
          : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
      }`}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Ambience On</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Ambience Off</span>
        </>
      )}
    </button>
  );
}
