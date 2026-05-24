/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Lock, 
  Unlock, 
  Mic, 
  MicOff, 
  VolumeX, 
  Volume2, 
  Send, 
  Plus, 
  Vote, 
  Flame, 
  DollarSign, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  ShieldAlert,
  Loader,
  X,
  Sparkles
} from 'lucide-react';
import { Match, WatchRoom, ChatMessage, Bet, UserState } from '../types';

interface WatchRoomsProps {
  user: UserState;
  match: Match;
  onRefreshWallet: () => void;
}

export default function WatchRooms({ user, match, onRefreshWallet }: WatchRoomsProps) {
  // Navigation states
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<WatchRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [inviteCodeInp, setInviteCodeInp] = useState('');
  const [joinError, setJoinError] = useState('');

  // Active room details
  const [activeRoom, setActiveRoom] = useState<WatchRoom | null>(null);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [chatInp, setChatInp] = useState('');
  
  // Create room modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cName, setCName] = useState('Super Kings Lounge ⚡');
  const [cBetting, setCBetting] = useState(false);
  const [cPrivate, setCPrivate] = useState(false);
  const [cMaxMembers, setCMaxMembers] = useState('8');
  const [cAgeAgreement, setCAgeAgreement] = useState(false);

  // Poll creation state
  const [pollQuestion, setPollQuestion] = useState('Next bowler over total runs?');
  const [pollOpt1, setPollOpt1] = useState('Under 8 runs');
  const [pollOpt2, setPollOpt2] = useState('Over 8 runs');
  const [showPollCreator, setShowPollCreator] = useState(false);

  // Betting Form values
  const [betCategory, setBetCategory] = useState('next-ball');
  const [betOption, setBetOption] = useState('dot');
  const [betAmount, setBetAmount] = useState('50');
  const [placeBetError, setPlaceBetError] = useState('');
  const [placeBetSuccess, setPlaceBetSuccess] = useState(false);
  
  // Voice Client simulation state
  const [isMicOn, setIsMicOn] = useState(true);
  const [speakerVolume, setSpeakerVolume] = useState(75);
  const [audioLatencyMs, setAudioLatencyMs] = useState(62); // Daily.co simulated real delay

  const [myBets, setMyBets] = useState<Bet[]>([]);

  // Ref for chat auto-scroller
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Fetch Rooms list from server
  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.rooms) {
        setRooms(data.rooms);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Fetch active room metadata and messages
  const fetchActiveRoomState = async (roomId: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      const data = await res.json();
      if (data.room) {
        setActiveRoom(data.room);
        setChats(data.chats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch placed bets log
  const fetchMyBets = async () => {
    try {
      const res = await fetch('/api/bets');
      const data = await res.json();
      if (data.bets) {
        setMyBets(data.bets);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Interval sync loop
  useEffect(() => {
    fetchRooms();
    fetchMyBets();
    const interval = setInterval(() => {
      fetchRooms();
      fetchMyBets();
      if (activeRoomId) {
        fetchActiveRoomState(activeRoomId);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeRoomId]);

  // Handle entering a room
  const handleJoinRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    fetchActiveRoomState(roomId);
  };

  // Join a private Watch Room by using a specific friend invite code
  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    const code = inviteCodeInp.trim().toUpperCase();
    if (!code) return;

    const foundRoom = rooms.find((r) => r.inviteCode.toUpperCase() === code);
    if (foundRoom) {
      handleJoinRoom(foundRoom.id);
      setInviteCodeInp('');
    } else {
      setJoinError('Room Code not found! Ensure your friend provided the correct private cave code (e.g., YELLOVE, MIPALTAN).');
    }
  };

  // Create Room handler
  const handleCreateRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cBetting && !cAgeAgreement) {
      alert('Kindly verify your age limits before launching active prediction pools!');
      return;
    }

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cName,
          isPrivate: cPrivate,
          bettingEnabled: cBetting,
          maxMembers: cMaxMembers
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        fetchRooms();
        handleJoinRoom(data.room.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Room Chat Message
  const handleSendChat = async (e: React.FormEvent, customType?: 'text' | 'emoji-burst', customContent?: string) => {
    if (e) e.preventDefault();
    const txt = customContent || chatInp;
    if (!txt.trim() && !customContent) return;

    try {
      const res = await fetch(`/api/rooms/${activeRoomId}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: txt,
          type: customType || 'text',
          user: {
            id: 'current_user',
            name: 'You (CSK Fan)',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatInp('');
        if (activeRoomId) fetchActiveRoomState(activeRoomId);
        // Scroll list
        setTimeout(() => {
          chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Resolve Bet Options and place wager
  const handlePlaceBet = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlaceBetError('');
    setPlaceBetSuccess(false);

    if (!user.ageVerified) {
      setPlaceBetError('Age Verification Required! Navigate to the Wallet ledger tab first, agree to and insert Aadhaar PAN details.');
      return;
    }

    const amt = Number(betAmount);
    if (user.walletBalance < amt) {
      setPlaceBetError('Insufficient core wallet balance.');
      return;
    }

    // Set sample odds
    let odds = 2.5;
    if (betOption === '6') odds = 6.0;
    else if (betOption === 'wicket') odds = 10.0;
    else if (betOption === '4') odds = 4.0;
    else if (betOption === 'dot') odds = 1.8;

    try {
      const res = await fetch(`/api/rooms/${activeRoomId}/bets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: betCategory,
          question: `What will the outcome of the next ball (${(match.overs + 0.1).toFixed(1)}) be?`,
          option: betOption,
          amount: amt,
          odds
        })
      });
      const data = await res.json();
      if (res.status >= 400) {
        setPlaceBetError(data.error || 'Betting failed.');
      } else if (data.success) {
        setPlaceBetSuccess(true);
        onRefreshWallet();
        fetchMyBets();
        setTimeout(() => setPlaceBetSuccess(false), 2000);
      }
    } catch (e) {
      setPlaceBetError('Unable to connect to Betting backend.');
    }
  };

  // Submit Poll creation from Host
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/rooms/${activeRoomId}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: pollQuestion,
          option1: pollOpt1,
          option2: pollOpt2
        })
      });
      if (res.ok) {
        setShowPollCreator(false);
        if (activeRoomId) fetchActiveRoomState(activeRoomId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Vote on Poll
  const handleVotePoll = async (optionId: string) => {
    try {
      const res = await fetch(`/api/rooms/${activeRoomId}/polls/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionId,
          userId: 'current_user'
        })
      });
      if (res.ok) {
        if (activeRoomId) fetchActiveRoomState(activeRoomId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Copyinvite link
  const copyInvite = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Invite Code: ${code} copied to clipboard! Share inside WhatsApp to invite team fans.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4" id="watch_rooms_root">
      
      {/* ================= LOBBY SCREEN (when no active room) ================= */}
      {!activeRoomId ? (
        <div className="space-y-8 animate-fade-in text-left" id="watch_lobby">
          
          {/* Header Description */}
          <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] bg-red-50 text-rose-600 font-extrabold px-3 py-1 rounded-full border border-rose-100 uppercase tracking-wider">
                🔒 PRIVATE IPL WATCHROOMS ONLY
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 font-display leading-none">
                Exclusive Friends Lobbies & Voice Casts
              </h2>
              <p className="text-xs text-slate-500 font-semibold max-w-2xl leading-relaxed">
                Connect real-time Daily.co voice chat channels and run peer-to-peer prediction bets in total privacy. No public rooms are available—only private arenas for invited friends.
              </p>
            </div>
            
            {/* Friendly reminder banner */}
            <div className="bg-amber-500/5 border border-yellow-400/30 px-5 py-3.5 rounded-2xl max-w-sm shrink-0 text-left">
              <span className="text-[9.5px] font-mono font-black text-amber-600 uppercase tracking-wider block">🧪 TEST CODE INSIGHTS</span>
              <p className="text-[11px] text-slate-600 font-semibold leading-normal mt-1">
                Try entering active invite codes of your friends: <strong className="text-amber-700 bg-amber-400/20 px-1.5 py-0.5 rounded font-mono">YELLOVE</strong> (Suresh's Cave) or <strong className="text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-mono">MIPALTAN</strong> (Karan's Cave).
              </p>
            </div>
          </div>

          {/* Symmetrical Dual Cards layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            
            {/* COLUMN A — JOIN PRIVATE ROOM */}
            <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 font-display">Enter Invite Code</h3>
                    <p className="text-[11.5px] text-slate-400 font-semibold">Join a friend's voice suite instantly</p>
                  </div>
                </div>

                <form onSubmit={handleJoinByCode} className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-mono font-black text-slate-400 uppercase tracking-wider block">PRIVATE INVITATION CODE</label>
                    <input
                      type="text"
                      required
                      value={inviteCodeInp}
                      id="inp_lobby_invite_code"
                      onChange={(e) => setInviteCodeInp(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs px-4 py-3.5 rounded-2xl w-full text-slate-800 outline-none focus:border-blue-500 font-mono font-extrabold uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400"
                      placeholder="e.g. YELLOVE"
                    />
                  </div>

                  {joinError && (
                    <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1.5 bg-rose-50 p-3 rounded-2xl border border-rose-100">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {joinError}
                    </p>
                  )}

                  <button
                    type="submit"
                    id="btn_lobby_join_by_code"
                    className="w-full bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-black text-xs py-3.5 rounded-2xl transition-all cursor-pointer shadow-md shadow-blue-500/10 uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    Enter Private Watchroom
                  </button>
                </form>
              </div>

              <div className="border-t border-slate-100 pt-4 text-center">
                <p className="text-[10px] text-slate-400 font-bold leading-normal uppercase tracking-wider">
                  Continuous WebRTC Encrypted Streams Active
                </p>
              </div>
            </div>

            {/* COLUMN B — CREATE PRIVATE ROOM */}
            <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-left">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <Plus className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 font-display">Create Private Space</h3>
                  <p className="text-[11.5px] text-slate-400 font-semibold">Generate a unique invite code for your crew</p>
                </div>
              </div>

              <form onSubmit={handleCreateRoomSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono font-black text-slate-400 uppercase tracking-wider block">WATCHROOM NAME</label>
                  <input
                    type="text"
                    required
                    value={cName}
                    id="inp_create_room_name"
                    onChange={(e) => setCName(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs px-4 py-3.5 rounded-2xl w-full text-slate-800 outline-none focus:border-amber-500 font-semibold"
                    placeholder="e.g. Dhoni's Whistle Podu Crew"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-mono font-black text-slate-400 uppercase tracking-wider block">MAX MEMBERS</label>
                    <select
                      value={cMaxMembers}
                      onChange={(e) => setCMaxMembers(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs px-3.5 py-3 rounded-2xl w-full text-slate-700 font-bold cursor-pointer"
                    >
                      <option value="4">4 Members</option>
                      <option value="8">8 Members</option>
                      <option value="12">12 Members</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-mono font-black text-slate-400 uppercase tracking-wider block">PRIVACY LOCK</label>
                    <div className="bg-slate-50 border border-slate-200 text-xs px-3.5 py-3 rounded-2xl w-full text-slate-400 font-bold select-none h-[42px] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-500" />
                      Locked Private
                    </div>
                  </div>
                </div>

                {/* Enable Betting */}
                <div className="bg-amber-500/5 p-4 rounded-2xl border border-yellow-400/20 space-y-3">
                  <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs font-black text-amber-500 block uppercase tracking-wider">Enable Real Money Wagering</span>
                      <span className="text-[10px] text-slate-500 font-semibold block leading-tight">Authorize prediction betting with wallet balance</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={cBetting}
                      id="chk_enable_betting"
                      onChange={(e) => setCBetting(e.target.checked)}
                      className="scale-120 accent-amber-500 cursor-pointer"
                    />
                  </label>

                  {cBetting && (
                    <label className="flex items-start gap-2.5 select-none cursor-pointer border-t border-amber-400/10 pt-2.5 text-[9.5px] text-slate-500 font-bold text-left">
                      <input
                        type="checkbox"
                        checked={cAgeAgreement}
                        required
                        id="chk_age_declaration_bet"
                        onChange={(e) => setCAgeAgreement(e.target.checked)}
                        className="mt-0.5 shrink-0 accent-amber-500"
                      />
                      <span>
                        I declare that all invited friends are <strong>18 years of age or older</strong> and agree to compliance mandates.
                      </span>
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  id="btn_submit_create_room"
                  className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-xs py-3.5 rounded-2xl transition-all cursor-pointer shadow-md shadow-amber-500/10 uppercase tracking-wider"
                >
                  Spin Up Private watchroom
                </button>
              </form>
            </div>

          </div>

        </div>
      ) : (
        
        // ================= INSIDE ACTIVE WATCH ROOM SCREEN =================
        <div className="space-y-6" id="inside_watch_room">
          
          {/* Header Bar */}
          <div className="bg-white border border-slate-100 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-brand-blue text-white font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Room Active</span>
                <span className="text-xs font-mono font-semibold text-slate-400">Match: CSK Chasing (Scoreboard Syncing)</span>
              </div>
              <h3 className="text-md font-black text-slate-800 font-display flex items-center gap-2">
                {activeRoom?.name || 'Watch Room'}
                <span className="text-xs text-slate-400 font-medium">invite code: <strong className="text-slate-700 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">{activeRoom?.inviteCode}</strong></span>
              </h3>
            </div>

            <div className="flex gap-2.5 self-start md:self-center">
              <button
                id="btn_copy_invite_code"
                onClick={() => copyInvite(activeRoom?.inviteCode || '')}
                className="bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 px-4 py-2.5 rounded-xl text-xs text-slate-600 flex items-center gap-1.5 cursor-pointer font-bold transition-all shadow-sm"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                Copy Room Code
              </button>

              <button
                id="btn_exit_watch_room"
                onClick={() => {
                  setActiveRoomId(null);
                  setActiveRoom(null);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all shadow-md shadow-rose-500/20 active:scale-95"
              >
                Exit Room
              </button>
            </div>
          </div>

          {/* 3-Column Desktop Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1 — MEMBERS VOICE PARTICIPANTS (Left 3 cols) */}
            <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-100 space-y-4 h-[550px] overflow-y-auto shadow-sm" id="members_relays">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-[10px] font-mono font-black text-slate-400 flex items-center gap-1.5 tracking-wider uppercase">
                  <Users className="w-4 h-4 text-brand-blue" />
                  VOICE RELAYS
                </h4>
                <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Daily.co Link
                </span>
              </div>

              {/* Members state */}
              <div className="space-y-3">
                {activeRoom?.members.map((member) => (
                  <div key={member.id} className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 max-w-[65%]">
                      <div className="relative">
                        <img src={member.avatar} alt={member.name} className="w-9 h-9 object-cover rounded-full bg-slate-100 border border-amber-400" />
                        
                        {/* Voice pulse indicator */}
                        {isMicOn && member.id === 'current_user' ? (
                          <div className="absolute -inset-0.5 border border-emerald-400 rounded-full animate-ping opacity-60" />
                        ) : member.isSpeaking ? (
                          <div className="absolute -inset-0.5 border border-emerald-400 rounded-full animate-ping opacity-60" />
                        ) : null}
                      </div>
                      
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 truncate">{member.name}</h5>
                        <div className="text-[8.5px] text-slate-400 font-mono">
                          {member.id === 'current_user' && isMicOn ? '🔴 Speaking' : 'Listening...'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {member.id === 'current_user' ? (
                        <button
                          onClick={() => setIsMicOn(!isMicOn)}
                          className={`p-1.5 rounded-lg cursor-pointer transition-all ${isMicOn ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}
                        >
                          {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                        </button>
                      ) : (
                        <button className="text-slate-400 p-1.5 hover:text-slate-600">
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2 — CORE LIVE SCORE BOARD & WAGERING (Center 5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-100 space-y-6 h-[550px] overflow-y-auto shadow-sm" id="wagering_tables">
              
              {/* Mini active score card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <img src={match.teamALogo} alt="Logo" className="w-6 h-6 object-contain" />
                    <span className="text-sm font-black text-slate-800">CSK</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">chasing 183</span>
                </div>

                <div className="text-right">
                  <div className="text-xl font-mono font-black text-brand-orange">{match.runs}/{match.wickets}</div>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold">Ov {match.overs.toFixed(1)} (CRR: {match.crr})</span>
                </div>
              </div>

              {/* Betting wagers core module */}
              {activeRoom?.bettingEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-[10px] font-mono font-black text-slate-400 flex items-center gap-1.5 tracking-wider uppercase">
                      <DollarSign className="w-4 h-4 text-brand-orange" />
                      LIVE PREDICTION WAGERING
                    </h4>
                    <span className="text-[9px] font-mono font-black text-brand-orange bg-orange-50 px-3 py-1 rounded-full border border-orange-100/50">
                      Min Bet: ₹10
                    </span>
                  </div>

                  <form onSubmit={handlePlaceBet} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-mono tracking-widest font-black text-slate-400">1. CHOOSE A MARKET</span>
                      <select
                        value={betCategory}
                        onChange={(e) => setBetCategory(e.target.value)}
                        className="bg-white border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl w-full cursor-pointer outline-none focus:border-brand-blue"
                      >
                        <option value="next-ball">Next Ball Delivery Outcome</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-mono tracking-widest font-black text-slate-400">2. SELECT EXPECTED OUTCOME</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { val: 'dot', label: 'Dot Cover (1.8x)', odds: 1.8 },
                          { val: '1', label: 'Single (2.2x)', odds: 2.2 },
                          { val: '4', label: 'Four!! (4.0x)', odds: 4.0 },
                          { val: '6', label: 'Six (6.0x)', odds: 6.0 },
                          { val: 'wicket', label: 'Wicket (10.0x)', odds: 10.0 }
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setBetOption(opt.val)}
                            className={`px-1 py-1.5 rounded-xl text-[9px] font-mono font-black flex flex-col justify-between h-[52px] border cursor-pointer select-none transition-all ${
                              betOption === opt.val
                                ? 'bg-brand-blue text-white border-brand-blue font-black shadow-md'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="uppercase text-center w-full truncate">{opt.val}</span>
                            <span className="w-full text-center tracking-tighter shrink-0">{opt.odds}x</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1.5">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black font-mono text-slate-400 tracking-wider">STAKE AMOUNT (₹)</span>
                        <input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-black text-slate-800 outline-none focus:border-brand-blue w-full font-mono"
                          placeholder="₹ stake size"
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <button
                          type="submit"
                          id="btn_submit_prediction_wager"
                          className="bg-brand-orange hover:bg-orange-600 transform active:scale-95 text-white font-black text-xs py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all text-center uppercase tracking-wider"
                        >
                          Place Bet Chip
                        </button>
                      </div>
                    </div>

                    {placeBetError && (
                      <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {placeBetError}
                      </p>
                    )}

                    {placeBetSuccess && (
                      <p className="text-[10px] text-emerald-600 flex items-center justify-center gap-1.5 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Bet chip placed successfully on next delivery!
                      </p>
                    )}
                  </form>

                  {/* Active bet list logs */}
                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    <span className="text-[9px] font-mono font-black text-slate-400 block uppercase tracking-wider">My Open Bets & P&L Log ({myBets.length})</span>
                    
                    <div className="space-y-2">
                      {myBets.map((b) => (
                        <div key={b.id} className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/80 flex justify-between items-center text-[11px] font-mono">
                          <div>
                            <div className="font-sans text-xs font-bold text-slate-700">Outcome prediction: <strong className="uppercase font-mono text-brand-orange">{b.option}</strong></div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Placed on Ball {b.ballTarget} @ {b.odds}x odds</div>
                          </div>

                          <div className="text-right">
                            <div className="text-slate-800 font-extrabold text-xs">Staked ₹{b.amount}</div>
                            {b.status === 'pending' ? (
                              <span className="bg-blue-50 text-brand-blue border border-blue-100/50 px-2 py-0.5 rounded-full text-[9px] font-bold">
                                Resolving...
                              </span>
                            ) : b.status === 'won' ? (
                              <span className="bg-emerald-50 text-emerald-600 font-black border border-emerald-100/50 px-2 py-0.5 rounded-full text-[9px]">
                                WON +₹{Math.round(b.amount * b.odds)}
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full text-[9px] font-bold">
                                Lost ₹{b.amount}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center space-y-2 flex flex-col items-center">
                  <ShieldAlert className="w-6 h-6 text-slate-400" />
                  <span className="text-xs text-slate-500 font-bold">Prediction wager module is currently disabled by host</span>
                </div>
              )}

            </div>

            {/* COLUMN 3 — ROOM CHAT & EMOTION BURSTS (Right 4 cols) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-100 flex flex-col justify-between h-[550px] shadow-sm" id="room_conversations">
              
              {/* Messages feed */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] p-1 border-b border-gray-800 mb-3 select-none">
                
                {/* Active hosted Poll area if exists */}
                {activeRoom?.poll && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 space-y-3.5 mb-4">
                    <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-mono tracking-wider font-bold">
                      <Vote className="w-4 h-4 text-blue-400 animate-bounce" />
                      LIVE ARENA HOST POLL
                    </div>
                    
                    <h5 className="text-xs font-bold leading-snug">{activeRoom.poll.question}</h5>
                    
                    <div className="space-y-2">
                      {activeRoom.poll.options.map((opt) => {
                        const hasVoted = activeRoom.poll?.userVotes?.['current_user'];
                        const isThis = activeRoom.poll?.userVotes?.['current_user'] === opt.id;
                        
                        return (
                          <button
                            key={opt.id}
                            id={`btn_vote_opt_${opt.id}`}
                            onClick={() => handleVotePoll(opt.id)}
                            disabled={!!hasVoted}
                            className={`w-full text-left text-xs p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                              isThis 
                                ? 'bg-blue-600/20 border-blue-500 font-bold text-blue-300' 
                                : 'bg-navy-950 border-gray-800 hover:border-gray-600'
                            }`}
                          >
                            <span>{opt.label}</span>
                            <span className="font-mono text-gray-500 text-[10px] font-extrabold">{opt.votes} votes</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Messages item render */}
                {chats.map((m) => (
                  <div key={m.id} className="flex gap-2.5 items-start">
                    <img src={m.userAvatar} alt="user" className="w-7 h-7 object-cover rounded-full" />
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-gray-300">{m.userName}</span>
                        <span className="text-[8px] text-gray-500 font-mono">{m.timestamp}</span>
                      </div>
                      <p className={`text-xs px-2.5 py-1 rounded-xl max-w-[200px] mt-0.5 leading-relaxed break-words ${
                        m.userId === 'current_user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-navy-950 border border-gray-800 text-gray-300 rounded-tl-none'
                      }`}>
                        {m.content}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatScrollRef} />
              </div>

              {/* Input section with custom emojis bar */}
              <div className="space-y-3">
                
                {/* Rapid emoticon quick burst overlays */}
                <div className="flex gap-2 justify-center border-t border-gray-800/60 pt-2 pb-0.5">
                  {['🔥', '💀', '👏', '🤯'].map((emoji) => (
                    <button
                      key={emoji}
                      id={`btn_chat_burst_${emoji}`}
                      onClick={() => handleSendChat(null as any, 'emoji-burst', emoji)}
                      className="bg-navy-950 font-smooth hover:bg-navy-800 px-3 py-1 text-md rounded-full border border-gray-800 cursor-pointer text-center text-xs hover:scale-110 active:scale-95 transform transition-all select-none"
                    >
                      {emoji}
                    </button>
                  ))}
                  
                  {/* Host Quick Poll Toggle */}
                  {activeRoom?.hostId === 'current_user' && (
                    <button
                      id="btn_trigger_poll_create_view"
                      onClick={() => setShowPollCreator(!showPollCreator)}
                      className="bg-blue-600/10 hover:bg-blue-600/25 border border-blue-500/25 text-blue-400 text-[10px] font-mono px-3 py-1 rounded-full cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <Plus className="w-3 h-3" /> Add Poll
                    </button>
                  )}
                </div>

                {/* Poll Creator Floating Form inside Panel */}
                {showPollCreator && (
                  <form onSubmit={handleCreatePoll} className="bg-navy-950 p-2.5 rounded-lg border border-gray-800 text-xs space-y-2">
                    <div className="space-y-1">
                      <span>Poll Question</span>
                      <input
                        type="text"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        className="bg-navy-900 border border-gray-800 p-1 w-full text-xs text-white rounded outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={pollOpt1}
                        onChange={(e) => setPollOpt1(e.target.value)}
                        className="bg-navy-900 border /border-gray-800 p-1 text-[11px] text-white rounded"
                      />
                      <input
                        type="text"
                        value={pollOpt2}
                        onChange={(e) => setPollOpt2(e.target.value)}
                        className="bg-navy-900 border border-gray-800 p-1 text-[11px] text-white rounded"
                      />
                    </div>
                    <div className="flex gap-1.5 justify-end">
                      <button type="button" onClick={() => setShowPollCreator(false)} className="text-gray-400 px-2 py-0.5">Cancel</button>
                      <button type="submit" className="bg-blue-600 text-white px-3 py-0.5 rounded font-bold">Publish</button>
                    </div>
                  </form>
                )}

                {/* Main text input bar */}
                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={chatInp}
                    id="inp_chat_msg"
                    onChange={(e) => setChatInp(e.target.value)}
                    className="bg-navy-950 border border-gray-800 text-xs text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-blue-500 w-full"
                    placeholder="Whip up some fan banter..."
                  />
                  <button
                    type="submit"
                    id="btn_send_chat"
                    className="bg-blue-600 hover:bg-blue-500 px-4.5 rounded-xl cursor-pointer text-white text-xs font-semibold shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>

            </div>

          </div>

          {/* VOICE CHAT BAR (always locked bottom) */}
          <div className="bg-navy-900 border border-gray-800 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/25">
                  <Mic className="w-5 h-5" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-navy-900 rounded-full" />
              </div>
              
              <div>
                <h5 className="text-xs font-bold text-white">Daily.co WebRTC Voice Lobby Connected</h5>
                <p className="text-[10px] text-gray-500 font-mono">
                  Audio delay: <span className="text-emerald-400 font-semibold">{audioLatencyMs}ms</span> (High speed)
                </p>
              </div>
            </div>

            {/* Simulating Waveform voice bars layout */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-gray-400 uppercase font-mono font-bold">Live Amplitude Waveform:</span>
              <div className="flex items-end gap-0.5 h-6 animate-pulse select-none">
                <span className="w-1 h-3 bg-emerald-400 rounded-full" />
                <span className="w-1 h-5 bg-emerald-400 rounded-full" />
                <span className="w-1 h-2 bg-emerald-400 rounded-full" />
                <span className="w-1 h-4 bg-emerald-400 rounded-full" />
                <span className="w-1 h-6 bg-emerald-400 rounded-full" />
                <span className="w-1 h-3 bg-emerald-400 rounded-full" />
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
