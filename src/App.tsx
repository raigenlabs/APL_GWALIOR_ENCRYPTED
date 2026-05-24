/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  MessageSquare, 
  Users, 
  Flame, 
  Wallet as WalletIcon, 
  Clock, 
  Sparkles, 
  Bell, 
  Award, 
  Info, 
  Tv, 
  HelpCircle,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Zap,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Match, UserState } from './types';
import LiveHub from './components/LiveHub';
import WatchRooms from './components/WatchRooms';
import FanWar from './components/FanWar';
import WalletSystem from './components/WalletSystem';
import AudioEngine from './components/AudioEngine';
import AIAssistant from './components/AIAssistant';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'live' | 'rooms' | 'fanwar' | 'wallet'>('dashboard');

  // Live match state
  const [match, setMatch] = useState<Match | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(true);

  // App Ticker Notification
  const [tickerMessage, setTickerMessage] = useState('Welcome to PitchSide — CSK vs MI Live Stream, Real-time voice chats, & responsible gaming indicators active.');
  const [showTicker, setShowTicker] = useState(true);

  // User State
  const [user, setUser] = useState<UserState>({
    id: 'usr_csk_91',
    name: 'Tejas Sharma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
    walletBalance: 350,
    kycVerified: false,
    ageVerified: true,
    dailyLossLimit: 1000,
    sessionTimeMs: 0,
    karma: 120,
    teamPreference: 'CSK'
  });

  // Track session timer (responsible gaming indicator)
  useEffect(() => {
    const timer = setInterval(() => {
      setUser(prev => ({
        ...prev,
        sessionTimeMs: prev.sessionTimeMs + 5000 // increment by 5s internally for simulator speed
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Poll Match State from internal API interceptor
  const fetchMatchState = async () => {
    try {
      const res = await fetch('/api/match-state');
      const data = await res.json();
      if (data.match) {
        setMatch(data.match);
        
        // Dynamic notification triggers based on ball actions
        const lastBall = data.match.lastFiveBalls[data.match.lastFiveBalls.length - 1];
        if (lastBall === 'W') {
          setTickerMessage(`🚨 WICKET FALLEN! Jasprit Bumrah claims another crucial wicket! Score is ${data.match.runs}/${data.match.wickets}!`);
        } else if (lastBall === '6') {
          setTickerMessage(`🏏 SIX ROUND! Shivam Dube launches a gorgeous 98m maximum! +15 Fan Karma distributed!`);
        } else if (lastBall === '4') {
          setTickerMessage(`💥 BOUNDARY! Pure cricket class finding the gap for four runs!`);
        }
      }
    } catch (e) {
      console.error('Failed to poll match state:', e);
    } finally {
      setLoadingMatch(false);
    }
  };

  useEffect(() => {
    fetchMatchState();
    const interval = setInterval(fetchMatchState, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateUser = (updatedFields: Partial<UserState>) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  const handleRefreshWallet = async () => {
    try {
      const res = await fetch('/api/user-wallet');
      const data = await res.json();
      if (data.wallet) {
        setUser(prev => ({
          ...prev,
          walletBalance: data.wallet.balance,
          kycVerified: data.wallet.kycVerified,
          kycAadhaar: data.wallet.kycAadhaar,
          kycPan: data.wallet.kycPan,
          ageVerified: data.wallet.ageVerified,
          dailyLossLimit: data.wallet.dailyLossLimit
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Direct tab redirection shortcut helper for betting buttons
  const handlePlaceBetShortcut = (category: string, question: string, option: string, odds: number) => {
    setActiveTab('rooms');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-brand-blue selection:text-white">
      
      {/* ================= GLOBAL NAVIGATION HEADER ================= */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-4 py-3 shadow-sm shadow-slate-100/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center bg-slate-900 w-12 h-12 rounded-2xl text-white shadow-lg shadow-brand-blue/15 border border-slate-800 shrink-0">
              <span className="text-xl font-black font-display text-transparent bg-clip-text bg-gradient-to-tr from-brand-orange to-amber-400 rotate-3 font-sans">P</span>
              <div className="absolute -top-1 -right-0.5 w-3 h-3 bg-brand-green rounded-full border-2 border-white animate-pulse" />
              <div className="absolute bottom-1 right-1">
                <Zap className="w-2.5 h-2.5 text-blue-400" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black font-display tracking-tight text-brand-dark flex items-center leading-none">
                PITCH<span className="text-brand-orange text-xs font-mono font-black bg-orange-500/10 px-1.5 py-0.5 rounded-md ml-1.5 shrink-0 uppercase tracking-wider">SIDE 360</span>
              </h1>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-mono font-black mt-1">India's Virtual Arena</span>
            </div>
          </div>

          {/* Core App Navigation Rows */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 whitespace-nowrap scrollbar-none">
            {[
              { id: 'dashboard', label: 'Launch Dashboard', icon: Tv },
              { id: 'live', label: 'Matchday Stats', icon: MessageSquare },
              { id: 'rooms', label: 'Voice Watchrooms', icon: Users },
              { id: 'fanwar', label: 'Fan Arenas & Memes', icon: Flame },
              { id: 'wallet', label: 'Wallet & Ledger', icon: WalletIcon }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav_btn_${item.id}`}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-brand-dark text-white rounded-xl shadow-lg shadow-brand-dark/10'
                      : 'text-slate-600 hover:text-brand-blue hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-green' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Status Panel (User capsule + Sound Toggle) */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 md:border-0 pt-3 md:pt-0">
            <AudioEngine />

            <div 
              onClick={() => setActiveTab('wallet')}
              className="bg-white hover:bg-slate-50/80 px-3.5 py-2 rounded-xl border border-slate-200/80 flex items-center gap-2 cursor-pointer transition-all shadow-sm shadow-slate-100"
              title="Click to manage wallet limits"
            >
              <WalletIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black font-mono text-emerald-600">₹{user.walletBalance.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center gap-2.5 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
              <img src={user.avatar} alt="Tejas" className="w-[30px] h-[30px] rounded-full object-cover border-2 border-brand-blue" />
              <div className="hidden lg:block leading-tight text-left">
                <span className="text-xs font-bold text-slate-800 block truncate">{user.name}</span>
                <span className="text-[9px] text-brand-purple font-mono font-bold flex items-center gap-0.5">
                  <Award className="w-2.5 h-2.5 text-brand-purple" />
                  {user.karma} Fan Karma
                </span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* ================= DYNAMIC TICKER ALERTS BAR ================= */}
      {showTicker && (
        <div id="ticker_bar" className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-orange py-2 px-4 shadow-inner relative select-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-white font-semibold">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="bg-white/20 text-white text-[9px] uppercase px-2 py-0.5 rounded-md font-mono font-black animate-pulse tracking-wide shrink-0">Stadium Broadcast</span>
              <span className="truncate">{tickerMessage}</span>
            </div>
            <button
              onClick={() => setShowTicker(false)}
              className="text-white hover:text-slate-100 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold cursor-pointer shrink-0 transition-all ml-4"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN DYNAMIC PAGE CONTENT Area ================= */}
      <main className="flex-1 pb-24">
        
        {loadingMatch ? (
          <div className="max-w-3xl mx-auto text-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-blue rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 font-bold font-mono animate-pulse">BOOTING PITCHSIDE SIMULATION ENGINE...</p>
          </div>
        ) : !match ? (
          <div className="max-w-xl mx-auto text-center py-24 space-y-4">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-extrabold text-slate-900">Simulation Offline</h3>
            <p className="text-sm text-slate-500">The PitchSide client API controller has shut down. Check configuration.</p>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD HUB (PAGE 1) */}
            {activeTab === 'dashboard' && (
              <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in" id="dashboard_tab_root">
                
                {/* Immersive live hero banner card */}
                <div id="hero_match_card" className="relative overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-6 md:p-8">
                  {/* Neon radial blur overlays */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-blue/15 via-brand-purple/10 to-brand-orange/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-brand-green rounded-full animate-ping shrink-0" />
                        <span className="text-[10px] bg-brand-green/10 text-emerald-700 font-mono font-extrabold border border-brand-green/20 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-emerald-600 animate-pulse" />
                          Live & Audited Stadium Broadcast
                        </span>
                      </div>
                      
                      <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark font-display leading-tight tracking-tight uppercase">
                        Super Clash: CSK vs MI <br/>
                        <span className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-orange bg-clip-text text-transparent">Chasing at Wankhede</span>
                      </h2>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Tension hits the boiling point! Shivam Dube and MS Dhoni anchor Chennai's response chasing Mumbai's target of 183. Hop into instant voice-cast lobbies with regional fan bases or prediction counters!
                      </p>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          onClick={() => setActiveTab('live')}
                          className="bg-brand-blue text-white hover:bg-brand-blue/90 font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md shadow-brand-blue/10 active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          Show Commentary & Scorecard
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveTab('rooms')}
                          className="bg-brand-purple text-white hover:bg-brand-purple/90 font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md shadow-brand-purple/10 active:scale-95 cursor-pointer"
                        >
                          Enter Live Watch Rooms
                        </button>
                      </div>
                    </div>

                    {/* Symmetrical Mini-score badge display */}
                    <div className="bg-slate-50 border border-slate-100/80 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shrink-0 shadow-sm">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400">
                        <span>LIVE INNINGS 2 state</span>
                        <span className="text-brand-blue font-extrabold bg-blue-50 px-2 py-0.5 rounded">CSK batting</span>
                      </div>
                      
                      <div className="flex justify-around items-center gap-4 py-2">
                        <div className="text-center space-y-1">
                          <div className="w-12 h-12 rounded-full bg-amber-500/10 p-2 flex items-center justify-center border border-amber-400/20 mx-auto">
                            <span className="text-sm font-black text-amber-600">CSK</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 block truncate">Chennai</span>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-4xl font-black font-mono text-brand-dark leading-none">{match.runs}/{match.wickets}</div>
                          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">Overs: {match.overs.toFixed(1)} / 20</span>
                        </div>

                        <div className="text-center space-y-1">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 p-2 flex items-center justify-center border border-blue-400/20 mx-auto">
                            <span className="text-sm font-black text-blue-600">MI</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 block truncate">Mumbai</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="text-left">
                          <span className="text-slate-400">CRR:</span> <strong className="text-slate-700">{match.crr}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400">Req RRR:</span> <strong className="text-brand-orange">{match.rrr || '7.0'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Symmetrical Feature bento blocks */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Bento block 1: Fan Poll of the day */}
                  <div className="md:col-span-4 bg-white border border-slate-100 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-1.5 text-brand-blue">
                      <Tv className="w-4 h-4" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Crowd Opinions Poll</span>
                    </div>
                    <h3 className="text-md font-bold text-brand-dark font-display">Who will bag the Purple Cap crown this season?</h3>
                    
                    <div className="space-y-3 pt-1 font-sans text-xs">
                      {[
                        { name: 'Jasprit Bumrah (MI)', percent: 62, color: 'bg-brand-blue' },
                        { name: 'Matheesha Pathirana (CSK)', percent: 28, color: 'bg-brand-purple' },
                        { name: 'Gerald Coetzee (MI)', percent: 10, color: 'bg-brand-orange' }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div className="flex justify-between text-[11.5px] font-semibold">
                            <span className="text-slate-700">{item.name}</span>
                            <span className="text-slate-900 font-extrabold">{item.percent}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bento block 2: Historical record stats overview */}
                  <div className="md:col-span-5 bg-white border border-slate-100 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-1.5 text-brand-purple">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Head-To-Head Timelines</span>
                    </div>
                    
                    <h3 className="text-md font-bold text-brand-dark font-display">IPL El Classico Historical Record</h3>

                    <div className="grid grid-cols-3 gap-3 text-center pt-1">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="text-[9px] text-slate-400 uppercase font-mono font-bold">Played</div>
                        <div className="text-xl font-black text-slate-800 font-mono mt-1">36</div>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100/60">
                        <div className="text-[9px] text-amber-600 uppercase font-mono font-bold">CSK Wins</div>
                        <div className="text-xl font-black text-amber-700 font-mono mt-1">16</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100/60 font-bold">
                        <div className="text-[9px] text-blue-600 uppercase font-mono font-bold">MI Wins</div>
                        <div className="text-xl font-black text-blue-700 font-mono mt-1">20</div>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100/80 leading-relaxed text-xs text-slate-600 font-medium">
                      <strong>PitchSide Analyst verdict:</strong> Wankhede heavily favors MI historically, but Chennai’s depth against spin today shifts the chase probability.
                    </div>
                  </div>

                  {/* Bento block 3: Responsible gaming guidelines card */}
                  <div className="md:col-span-3 bg-white border border-slate-100 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-4 right-4 flex items-center justify-center p-1.5 bg-brand-orange/10 rounded-xl text-brand-orange">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-brand-orange">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Responsibility Guard</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-brand-dark font-display leading-tight">Healthy Play Policies</h3>
                    
                    <div className="space-y-3.5 text-xs text-slate-600">
                      <p className="leading-snug">Continuous checks are active for fair play boundaries:</p>
                      <div className="font-mono space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[10.5px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Age Check:</span>
                          <span className="text-emerald-600 font-bold">Verified 18+</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Daily Loss cap:</span>
                          <span className="text-slate-700 font-bold">₹{user.dailyLossLimit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Uptime:</span>
                          <span className="text-brand-blue font-bold">Active Shield</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Squad highlight section banners */}
                <div className="space-y-4 pt-1">
                  <h3 className="text-xs font-bold tracking-widest font-mono text-slate-400 uppercase">Key Blockbuster Squad Duels</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
                    {[
                      { name: 'MS Dhoni', squad: 'CSK', subtitle: 'The Thala Finish', runs: '161', avg: 'SR: 224.6', img: 'https://images.unsplash.com/photo-1540747737956-378724044432?w=120' },
                      { name: 'Rohit Sharma', squad: 'MI', subtitle: 'Paltan Leader', runs: '417', avg: 'SR: 151.6', img: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120' },
                      { name: 'Ruturaj Gaikwad', squad: 'CSK', subtitle: 'Elegant Captain', runs: '583', avg: 'SR: 141.2', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120' },
                      { name: 'Jasprit Bumrah', squad: 'MI', subtitle: 'Yorker Kingpin', runs: '18 Wkts', avg: 'Econ: 6.22', img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120' }
                    ].map((player, idx) => (
                      <div key={idx} className="bg-white border border-slate-100 p-4 rounded-3xl flex items-center gap-3.5 hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/5 transition-all cursor-pointer">
                        <img src={player.img} alt={player.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                        <div className="leading-tight text-left">
                          <h4 className="text-xs font-extrabold text-slate-800 font-display">{player.name}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mb-1">{player.subtitle}</p>
                          <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded ${player.squad === 'CSK' ? 'bg-amber-400/10 text-amber-700' : 'bg-blue-600/12 text-blue-700'}`}>
                            {player.squad} {player.runs}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 2. MATCH DAY LIVE (PAGE 2) */}
            {activeTab === 'live' && (
              <LiveHub 
                match={match} 
                onPlaceBetShortcut={handlePlaceBetShortcut}
              />
            )}

            {/* 3. VOICE WATCH ROOMS (PAGE 3) */}
            {activeTab === 'rooms' && (
              <WatchRooms 
                user={user} 
                match={match} 
                onRefreshWallet={handleRefreshWallet}
              />
            )}

            {/* 4. FAN WAR SPLIT STREAM (PAGE 4) */}
            {activeTab === 'fanwar' && (
              <FanWar 
                user={user} 
                match={match} 
                onUpdateUser={handleUpdateUser}
              />
            )}

            {/* 5. WALLET & KYC (PAGE 5) */}
            {activeTab === 'wallet' && (
              <WalletSystem 
                user={user} 
                onUpdateUser={handleUpdateUser} 
                onRefreshWallet={handleRefreshWallet} 
              />
            )}
          </>
        )}

      </main>

      {/* Floating AI expert drawer component */}
      <AIAssistant />

    </div>
  );
}
