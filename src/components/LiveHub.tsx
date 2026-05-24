/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, 
  ChevronDown, 
  MessageSquare, 
  Clock, 
  Users, 
  Trophy, 
  Tv, 
  Compass, 
  Smile, 
  Video, 
  Send,
  Zap,
  Dribbble,
  Sparkles
} from 'lucide-react';
import { Match, Commentary } from '../types';
import { PLAYERS, MATCHUPS, HIGHLIGHTS_VIDEO, Player } from '../data';

interface LiveHubProps {
  match: Match;
  onPlaceBetShortcut?: (category: string, question: string, option: string, odds: number) => void;
}

export default function LiveHub({ match, onPlaceBetShortcut }: LiveHubProps) {
  const [activeTab, setActiveTab] = useState<'commentary' | 'scorecard' | 'players' | 'insights' | 'highlights'>('commentary');
  const [commentary, setCommentary] = useState<Commentary[]>([]);
  const [selectedMatch, setSelectedMatch] = useState('csk_vs_mi');
  const [scorecardInnings, setScorecardInnings] = useState<1 | 2>(2); // Innings 2 is CSK batting
  const [searchSquadQuery, setSearchSquadQuery] = useState('');
  const [matchupBatter, setMatchupBatter] = useState('Rohit Sharma');
  const [matchupBowler, setMatchupBowler] = useState('Ravindra Jadeja');

  // Highlights state
  const [customMoments, setCustomMoments] = useState<{ id: string; user: string; text: string; time: string }[]>([
    { id: 'cm_1', user: 'Tejas CSK', text: 'Bumrah is sending absolute heat at 150 kph. What a game!', time: '14:46Z' }
  ]);
  const [newMomentText, setNewMomentText] = useState('');

  // Auto-scroll commentary feed ref
  const commentaryEndRef = useRef<HTMLDivElement | null>(null);

  // Poll commentary data from server every 3s
  const fetchCommentary = async () => {
    try {
      const res = await fetch('/api/commentary');
      const data = await res.json();
      if (data.commentary) {
        setCommentary(data.commentary);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCommentary();
    const interval = setInterval(fetchCommentary, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle emoji reactions on commentary entries
  const handleCommentaryReaction = async (commentaryId: string, emoji: string) => {
    try {
      const res = await fetch('/api/commentary/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentaryId, emoji })
      });
      if (res.ok) {
        fetchCommentary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostMoment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMomentText.trim()) return;

    const newMoment = {
      id: `cm_${Date.now()}`,
      user: 'You',
      text: newMomentText,
      time: new Date().toISOString().split('T')[1].substring(0, 5) + 'Z'
    };
    setCustomMoments([newMoment, ...customMoments]);
    setNewMomentText('');
  };

  // Find matchup details
  const matchupData = MATCHUPS.find(
    m => m.batsmanName === matchupBatter && m.bowlerName === matchupBowler
  ) || {
    batsmanName: matchupBatter,
    bowlerName: matchupBowler,
    ballsFaced: 12,
    runsScored: 15,
    dismissals: 0,
    strikeRate: 125.0
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-7xl mx-auto px-4 py-4" id="live_hub_root">
      
      {/* ================= LEFT SIDEBAR (350px equivalent) ================= */}
      <div className="xl:col-span-4 space-y-6">
        
        {/* Match Selector Dropdown */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-mono font-bold tracking-wider">SELECT REGISTERED MATCH</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse-fast">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              1 ACTIVE LIVE
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedMatch}
              onChange={(e) => setSelectedMatch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 px-3.5 py-3 rounded-xl appearance-none outline-none focus:border-brand-blue cursor-pointer"
            >
              <option value="csk_vs_mi">Chennai Super Kings vs Mumbai Indians</option>
              <option value="rcb_vs_kkr" disabled>Royal Challengers Bengaluru vs Kolkata Knight Riders (Upcoming)</option>
              <option value="gt_vs_rr" disabled>Gujarat Titans vs Rajasthan Royals (Recent)</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Live Mini Scoreboard Widget */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.02)] hover:shadow-lg hover:shadow-brand-blue/5 transition-all">
          
          {/* Header Team Duel */}
          <div className="bg-slate-50/80 px-5 py-3.5 flex justify-between items-center border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-amber-400/10 text-amber-700 font-black border border-amber-400/20 px-2.5 py-1 rounded-full uppercase tracking-wider">CSK Chasing</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-blue" />
              IPL 2026 Season
            </div>
          </div>

          {/* Core score block */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              {/* CSK */}
              <div className="flex items-center gap-3">
                <img src={match.teamALogo} alt="CSK" className="w-10 h-10 object-contain rounded-full bg-yellow-500/10 p-1" />
                <div>
                  <h4 className="text-md font-extrabold text-slate-800">CSK</h4>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Batting</span>
                </div>
              </div>
              
              {/* Middle Score values with animated pulses */}
              <div className="text-right">
                <div id="live_score_text" className="text-3xl font-black text-slate-900 font-mono tracking-tighter flex items-baseline justify-end gap-0.5">
                  <span>{match.runs}</span>
                  <span className="text-slate-400 text-2xl">/</span>
                  <span className="text-rose-600">{match.wickets}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold font-mono">
                  Overs: <span className="font-extrabold text-slate-800">{match.overs.toFixed(1)}</span> / 20.0
                </div>
              </div>
            </div>

            {/* Target & Required metric lines */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center font-mono text-[9px]">
              <div>
                <div className="text-slate-400 font-bold uppercase tracking-wide">Target</div>
                <div className="font-extrabold text-slate-800 text-xs mt-0.5">{match.target || 183}</div>
              </div>
              <div>
                <div className="text-slate-400 font-bold uppercase tracking-wide">C. Run Rate</div>
                <div className="font-extrabold text-brand-blue text-xs mt-0.5">{match.crr}</div>
              </div>
              <div>
                <div className="text-slate-400 font-bold uppercase tracking-wide">Req. R Rate</div>
                <div className="font-extrabold text-brand-orange text-xs mt-0.5">{match.rrr || 7.00}</div>
              </div>
            </div>

            {/* Current Batsmen Details */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <span className="text-[9px] uppercase font-mono font-black tracking-widest text-slate-400 block">CURRENT BATSMEN</span>
              
              <div className="space-y-1.5">
                {match.batsmen.map((b, idx) => (
                  <div key={b.name} className="flex justify-between items-center text-xs bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-amber-500' : 'bg-slate-400'}`} />
                      {b.name} {idx === 0 && <span className="text-[9px] text-amber-500">★</span>}
                    </span>
                    <span className="font-mono text-slate-800 font-extrabold">
                      {b.runs} <span className="text-slate-400 font-bold">({b.balls})</span>
                      <span className="text-slate-400 ml-2 font-normal text-[10px]">SR: {b.strikeRate.toFixed(1)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Bowler Details */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <span className="text-[9px] uppercase font-mono font-black tracking-widest text-slate-400 block">CURRENT BOWLER</span>
              
              <div className="flex justify-between items-center text-xs bg-blue-50/60 px-3 py-2 rounded-xl border border-blue-100/50">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse" />
                  {match.currentBowler.name}
                </span>
                <span className="font-mono font-extrabold text-brand-blue text-[11px]">
                  {match.currentBowler.wickets} - {match.currentBowler.runs}
                  <span className="text-slate-400 font-normal text-[10px] ml-1.5">({match.currentBowler.overs} ov, Econ: {match.currentBowler.economy})</span>
                </span>
              </div>
            </div>

            {/* Last 5 deliveries visualizer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[9px] uppercase text-slate-400 font-mono font-black tracking-widest">This Over:</span>
              <div className="flex gap-1.5">
                {match.lastFiveBalls.map((ball, i) => {
                  let design = "bg-slate-100 text-slate-600"; // dot
                  if (ball === 'W') design = "bg-rose-600 text-white animate-pulse-fast font-black shadow-md shadow-rose-500/20"; // Wicket
                  else if (ball === '6') design = "bg-brand-orange text-white font-black shadow-md shadow-brand-orange/20"; // Six
                  else if (ball === '4') design = "bg-brand-blue text-white font-bold shadow-md shadow-brand-blue/20"; // Four
                  else if (ball.includes('Wd') || ball.includes('Nb')) design = "bg-slate-100 text-brand-orange border border-brand-orange/20"; // Extras
                  else if (Number(ball) > 0) design = "bg-slate-800 text-white font-bold"; // Runs
                  
                  return (
                    <span
                      key={i}
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-[9px] font-mono tracking-tighter ${design}`}
                    >
                      {ball}
                    </span>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Partnership & Arc Gauge Widget */}
        <div className="grid grid-cols-2 gap-4">
          
          <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-2 shadow-sm">
            <span className="text-[9px] uppercase font-mono font-black text-slate-400 block tracking-widest">PARTNERSHIP</span>
            <div className="text-lg font-black text-slate-800 font-mono">{match.partnership.runs} <span className="text-slate-400 text-xs font-bold">Runs</span></div>
            <div className="text-[10px] text-slate-500 font-medium">{match.partnership.balls} faced deliveries.</div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-2 relative overflow-hidden shadow-sm">
            <span className="text-[9px] uppercase font-mono font-black text-slate-400 block tracking-widest">PROJECTED</span>
            <div className="text-lg font-black text-brand-orange font-mono">{match.projectedScore.atCurrent} <span className="text-slate-400 text-xs font-bold">at CRR</span></div>
            <div className="text-[10px] text-slate-500 font-medium font-sans">Based on {match.crr} CRR metrics</div>
          </div>
        </div>

      </div>

      {/* ================= RIGHT MAIN AREA (TABBED HUB CONTENT) ================= */}
      <div className="xl:col-span-8 space-y-6">
        
        {/* Sliding Navigation Tabs */}
        <div className="flex border border-slate-100 overflow-x-auto whitespace-nowrap bg-white p-1.5 rounded-2xl shadow-sm scrollbar-none">
          {[
            { id: 'commentary', label: 'Commentary Feed', icon: MessageSquare },
            { id: 'scorecard', label: 'Scorecard Table', icon: Trophy },
            { id: 'players', label: 'Squad Registry', icon: Users },
            { id: 'insights', label: 'Chamber Insights', icon: BarChart },
            { id: 'highlights', label: 'Stadium Highlights', icon: Video }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab_hub_${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/15'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1 — LIVE COMMENTARY FEED */}
        {activeTab === 'commentary' && (
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col max-h-[600px]">
            
            {/* Header info */}
            <div className="bg-slate-50 px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">Live commentary feed</span>
              <span className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-wider">Updates every 4s realtime</span>
            </div>

            {/* Log Feed */}
            <div className="p-4 overflow-y-auto space-y-3.5 flex-1 select-none">
              {commentary.map((c) => {
                const isSix = c.eventType === 'six';
                const isWicket = c.eventType === 'wicket';
                const isFour = c.eventType === 'boundary';
                
                return (
                  <div 
                    key={c.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      isSix 
                        ? 'bg-orange-50/60 border-brand-orange/40 shadow-sm' 
                        : isWicket 
                        ? 'bg-rose-50/60 border-rose-200 shadow-sm' 
                        : isFour
                        ? 'bg-blue-50/50 border-blue-200/65'
                        : 'bg-slate-50/80 border-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg ${
                          isSix || isFour ? 'bg-brand-orange text-white' : isWicket ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {c.ballNumber}
                        </span>
                        
                        {/* Event type alert tags */}
                        {isSix && (
                          <span className="text-[10px] font-black tracking-widest uppercase text-brand-orange flex items-center gap-1 font-display">
                            <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
                            6 RUNS • MAXIMUM
                          </span>
                        )}
                        {isWicket && (
                          <span className="text-[10px] font-black tracking-widest uppercase text-rose-600 flex items-center gap-1 font-display">
                            🚨 WICKET FALLEN • OUT!
                          </span>
                        )}
                        {isFour && (
                          <span className="text-[10px] font-black tracking-widest uppercase text-brand-blue flex items-center gap-1 font-display">
                            🏏 4 RUNS • BOUNDARY
                          </span>
                        )}
                      </div>
                      
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{c.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-700 font-semibold leading-relaxed font-sans">{c.description}</p>

                    {/* Crowd reactions panel */}
                    <div className="flex items-center justify-between gap-4 mt-3 pt-2.5 border-t border-slate-200/50">
                      <span className="text-[9px] uppercase font-mono font-black text-slate-400 tracking-wider">Reactions:</span>
                      <div className="flex gap-2">
                        {['🔥', '💯', '🤯', '💀', '👏'].map((reactEmoji) => (
                          <button
                            key={reactEmoji}
                            id={`btn_react_comm_${c.id}_${reactEmoji}`}
                            onClick={() => handleCommentaryReaction(c.id, reactEmoji)}
                            className="bg-white hover:bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer transition-all hover:border-brand-blue shadow-sm"
                          >
                            <span>{reactEmoji}</span>
                            <span className="text-[9.5px] text-slate-600 font-mono font-black">{c.emojiReactions[reactEmoji] || 0}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={commentaryEndRef} />
            </div>
          </div>
        )}

        {/* TAB 2 — FULL SCORECARD */}
        {activeTab === 'scorecard' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-sm text-slate-800">
            
            {/* Innings selector bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-450 uppercase font-mono tracking-wider">INNINGS DETAILS:</span>
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setScorecardInnings(2)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${scorecardInnings === 2 ? 'bg-amber-400 text-slate-900 font-extrabold shadow-sm' : 'text-slate-500 hover:text-slate-900 font-bold'}`}
                >
                  CSK (Innings 2)
                </button>
                <button
                  type="button"
                  onClick={() => setScorecardInnings(1)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${scorecardInnings === 1 ? 'bg-blue-600 text-white font-extrabold shadow-sm' : 'text-slate-500 hover:text-slate-900 font-bold'}`}
                >
                  MI (Innings 1)
                </button>
              </div>
            </div>

            {/* Scorecard table layout */}
            <div className="space-y-4">
              <h3 className="text-md font-black text-slate-800 font-display">
                {scorecardInnings === 2 ? 'Chennai Super Kings Batting Inning - 148/4 (15.0 Overs)' : 'Mumbai Indians Batting Inning - 182/6 (20.0 Overs)'}
              </h3>
              
              {/* Batting table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-150 text-slate-400 pb-2 uppercase text-[10px] font-black">
                      <th className="py-2">Batter</th>
                      <th className="py-2 text-center text-slate-500">R</th>
                      <th className="py-2 text-center text-slate-500">B</th>
                      <th className="py-2 text-center text-slate-500">4s</th>
                      <th className="py-2 text-center text-slate-500">6s</th>
                      <th className="py-2 text-right text-slate-500">SR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scorecardInnings === 2 ? (
                      <>
                        <tr className="hover:bg-slate-50/70 transition-all font-semibold">
                          <td className="py-3 font-sans font-bold text-slate-800">Ruturaj Gaikwad (c) <span className="text-rose-600 text-[10px] ml-1">b Bumrah</span></td>
                          <td className="py-3 text-center font-extrabold text-slate-900">67</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">42</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">6</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">2</td>
                          <td className="py-3 text-right text-slate-700 font-bold">159.5</td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition-all font-semibold">
                          <td className="py-3 font-sans font-bold text-slate-800">Rachin Ravindra <span className="text-rose-600 text-[10px] ml-1">c Kishan b Coetzee</span></td>
                          <td className="py-3 text-center font-extrabold text-slate-900">23</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">14</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">3</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">1</td>
                          <td className="py-3 text-right text-slate-700 font-bold">164.2</td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition-all font-semibold">
                          <td className="py-3 font-sans font-bold text-slate-800">Shivam Dube <span className="text-emerald-600 text-[10px] ml-1">*Batting</span></td>
                          <td className="py-3 text-center font-extrabold text-slate-900">{match.batsmen.find(b => b.name === 'Shivam Dube')?.runs || 34}</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">{match.batsmen.find(b => b.name === 'Shivam Dube')?.balls || 18}</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">{match.batsmen.find(b => b.name === 'Shivam Dube')?.fours || 2}</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">{match.batsmen.find(b => b.name === 'Shivam Dube')?.sixes || 3}</td>
                          <td className="py-3 text-right text-emerald-600 font-extrabold leading-none">{match.batsmen.find(b => b.name === 'Shivam Dube')?.strikeRate.toFixed(1) || '188.9'}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition-all font-semibold">
                          <td className="py-3 font-sans font-bold text-slate-800">Ravindra Jadeja <span className="text-emerald-600 text-[10px] ml-1">*Batting</span></td>
                          <td className="py-3 text-center font-extrabold text-slate-900">{match.batsmen.find(b => b.name === 'Ravindra Jadeja')?.runs || 12}</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">{match.batsmen.find(b => b.name === 'Ravindra Jadeja')?.balls || 8}</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">{match.batsmen.find(b => b.name === 'Ravindra Jadeja')?.fours || 1}</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">{match.batsmen.find(b => b.name === 'Ravindra Jadeja')?.sixes || 0}</td>
                          <td className="py-3 text-right text-emerald-600 font-extrabold leading-none">{match.batsmen.find(b => b.name === 'Ravindra Jadeja')?.strikeRate.toFixed(1) || '150.0'}</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr className="hover:bg-slate-50/70 transition-all font-semibold">
                          <td className="py-3 font-sans font-bold text-slate-800">Rohit Sharma <span className="text-rose-600 text-[10px] ml-1">c Dhoni b Pathirana</span></td>
                          <td className="py-3 text-center font-extrabold text-slate-900">49</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">30</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">5</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">2</td>
                          <td className="py-3 text-right text-slate-700 font-bold">163.3</td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition-all font-semibold">
                          <td className="py-3 font-sans font-bold text-slate-800">Suryakumar Yadav <span className="text-rose-600 text-[10px] ml-1">c Rahane b Jadeja</span></td>
                          <td className="py-3 text-center font-extrabold text-slate-900">56</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">34</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">4</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">3</td>
                          <td className="py-3 text-right text-slate-700 font-bold">164.7</td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition-all font-semibold">
                          <td className="py-3 font-sans font-bold text-slate-800">Hardik Pandya (c) <span className="text-rose-600 text-[10px] ml-1">b Chahar</span></td>
                          <td className="py-3 text-center font-extrabold text-slate-900">15</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">10</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">1</td>
                          <td className="py-3 text-center text-slate-500 font-medium font-sans">1</td>
                          <td className="py-3 text-right text-slate-700 font-bold">150.0</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bowling tables */}
              <h4 className="text-xs uppercase font-mono font-black tracking-wider text-slate-450 pt-3 text-left">Bowling Outfield</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-150 text-slate-400 pb-2 uppercase text-[10px] font-black">
                      <th className="py-2">Bowler</th>
                      <th className="py-2 text-center text-slate-500">O</th>
                      <th className="py-2 text-center text-slate-500">M</th>
                      <th className="py-2 text-center text-slate-500">R</th>
                      <th className="py-2 text-center text-slate-500">W</th>
                      <th className="py-2 text-right text-slate-500">ECON</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scorecardInnings === 2 ? (
                      <>
                        <tr className="hover:bg-slate-50/70 transition-all font-semibold">
                          <td className="py-2.5 font-sans font-bold text-slate-800">Jasprit Bumrah</td>
                          <td className="py-2.5 text-center font-extrabold text-slate-900">{match.currentBowler.overs}</td>
                          <td className="py-2.5 text-center text-slate-500 font-medium font-sans">0</td>
                          <td className="py-2.5 text-center text-slate-500 font-medium font-sans">{match.currentBowler.runs}</td>
                          <td className="py-2.5 text-center text-rose-600 font-extrabold text-sm">{match.currentBowler.wickets}</td>
                          <td className="py-2.5 text-right text-slate-700 font-bold">{match.currentBowler.economy}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition-all font-semibold">
                          <td className="py-2.5 font-sans font-bold text-slate-800">Gerald Coetzee</td>
                          <td className="py-2.5 text-center font-extrabold text-slate-900">3.0</td>
                          <td className="py-2.5 text-center text-slate-500 font-medium font-sans">0</td>
                          <td className="py-2.5 text-center text-slate-500 font-medium font-sans">32</td>
                          <td className="py-2.5 text-center text-rose-600 font-extrabold text-sm font-sans">1</td>
                          <td className="py-2.5 text-right text-slate-700 font-bold">10.6</td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition-all font-semibold">
                          <td className="py-2.5 font-sans font-bold text-slate-800">Hardik Pandya</td>
                          <td className="py-2.5 text-center font-extrabold text-slate-900">4.0</td>
                          <td className="py-2.5 text-center text-slate-500 font-medium font-sans">0</td>
                          <td className="py-2.5 text-center text-slate-500 font-medium font-sans">43</td>
                          <td className="py-2.5 text-center text-rose-600 font-extrabold text-sm font-sans">0</td>
                          <td className="py-2.5 text-right text-slate-700 font-bold">10.75</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr className="hover:bg-slate-50/70 transition-all font-semibold">
                          <td className="py-2.5 font-sans font-bold text-slate-800">Matheesha Pathirana</td>
                          <td className="py-2.5 text-center font-extrabold text-slate-900">4.0</td>
                          <td className="py-2.5 text-center text-slate-500 font-medium font-sans">0</td>
                          <td className="py-2.5 text-center text-slate-500 font-medium font-sans">28</td>
                          <td className="py-2.5 text-center text-rose-600 font-extrabold text-sm font-sans">3</td>
                          <td className="py-2.5 text-right text-slate-700 font-bold">7.00</td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition-all font-semibold">
                          <td className="py-2.5 font-sans font-bold text-slate-800">Ravindra Jadeja</td>
                          <td className="py-2.5 text-center font-extrabold text-slate-900">4.0</td>
                          <td className="py-2.5 text-center text-slate-500 font-medium font-sans">0</td>
                          <td className="py-2.5 text-center text-slate-500 font-medium font-sans">29</td>
                          <td className="py-2.5 text-center text-rose-600 font-extrabold text-sm font-sans">1</td>
                          <td className="py-2.5 text-right text-slate-700 font-bold">7.25</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Fall of wicket timelines */}
              <div className="pt-4 border-t border-slate-150 space-y-3.5">
                <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider text-left block">Fall of Wickets Timeline</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { overs: "3.2", runs: "32", desc: "Ravindra" },
                    { overs: "9.4", runs: "89", desc: "Rahane" },
                    { overs: "11.1", runs: "104", desc: "Mitchell" },
                    { overs: "14.4", runs: "142", desc: "Gaikwad" }
                  ].map((w, i) => (
                    <div key={i} className="bg-slate-50 hover:bg-slate-100 flex-1 p-3 rounded-2xl border border-slate-150 text-center relative cursor-pointer font-sans transition-all">
                      <div className="text-[11px] font-black text-rose-600">{w.runs}/{i+1}</div>
                      <div className="text-[9px] text-slate-550 font-bold">Ov {w.overs}</div>
                      <div className="text-[8px] text-slate-400 font-semibold truncate">{w.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3 — PLAYER SEASON SQUAD LOOKUP */}
        {activeTab === 'players' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-sm text-slate-800">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="text-md font-black text-slate-800 font-display">Player Seasons & Impact Stats</h3>
                <p className="text-xs text-slate-500 font-semibold">Lookup details, fantasy stats, or model matches.</p>
              </div>
              
              <input
                type="text"
                value={searchSquadQuery}
                onChange={(e) => setSearchSquadQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-800 px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 w-full md:w-60 font-semibold placeholder:text-slate-400"
                placeholder="Search players (e.g. Dhoni)..."
              />
            </div>

            {/* Grid list of squad cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PLAYERS.filter(p => p.name.toLowerCase().includes(searchSquadQuery.toLowerCase()))
                .slice(0, 4)
                .map((p) => (
                  <div key={p.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all duration-300" />
                    <img src={p.photo} alt={p.name} className="w-14 h-14 object-cover rounded-full border border-slate-200 bg-slate-100" />
                    <div className="space-y-1 flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full font-mono ${p.team === 'CSK' ? 'bg-amber-400/15 text-amber-650' : 'bg-blue-500/15 text-blue-600'}`}>
                          {p.team}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{p.role}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-800 truncate">{p.name}</h4>
                      
                      <div className="flex gap-3 text-[10px] text-slate-500 font-mono">
                        <div>Runs: <span className="text-slate-700 font-extrabold">{p.runsThisSeason || '-'}</span></div>
                        <div>Wickets: <span className="text-slate-700 font-extrabold">{p.wicketsThisSeason || '-'}</span></div>
                        <div>Fantasy pts: <span className="text-amber-650 font-black">{p.fantasyPoints}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Head to Head Duel Simulator Calculator */}
            <div className="pt-4 border-t border-slate-150 space-y-4">
              <span className="text-xs font-black tracking-wider uppercase font-mono text-slate-400 flex items-center gap-1.5 text-left">
                <Compass className="w-4 h-4 text-blue-500 animate-spin" />
                Player Matchup lookup
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                
                {/* Selectors */}
                <div className="space-y-3 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase font-mono">Batsman</span>
                    <select
                      value={matchupBatter}
                      onChange={(e) => setMatchupBatter(e.target.value)}
                      className="bg-white border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl w-full cursor-pointer outline-none focus:border-blue-500 font-sans"
                    >
                      <option value="Rohit Sharma">Rohit Sharma (MI)</option>
                      <option value="Suryakumar Yadav">Suryakumar Yadav (MI)</option>
                      <option value="Ruturaj Gaikwad">Ruturaj Gaikwad (CSK)</option>
                      <option value="MS Dhoni">MS Dhoni (CSK)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase font-mono">Bowler</span>
                    <select
                      value={matchupBowler}
                      onChange={(e) => setMatchupBowler(e.target.value)}
                      className="bg-white border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl w-full cursor-pointer outline-none focus:border-blue-500 font-sans"
                    >
                      <option value="Ravindra Jadeja">Ravindra Jadeja (CSK)</option>
                      <option value="Jasprit Bumrah">Jasprit Bumrah (MI)</option>
                    </select>
                  </div>
                </div>

                {/* Score indicators */}
                <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col justify-center space-y-3 text-center shadow-inner">
                  <span className="text-[10px] font-black text-slate-450 uppercase font-mono tracking-wider">IPL History Matchup Metrics</span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">Balls</div>
                      <div className="text-sm font-extrabold text-slate-800 font-mono">{matchupData.ballsFaced}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">Runs</div>
                      <div className="text-sm font-extrabold text-amber-500 font-mono">{matchupData.runsScored}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-rose-500 font-black">Outs</div>
                      <div className="text-sm font-extrabold text-rose-600 font-mono">{matchupData.dismissals}</div>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-500 border-t border-slate-100 pt-2 flex justify-between">
                    <span>Strike Rate: <span className="font-bold text-blue-600">{matchupData.strikeRate.toFixed(1)}</span></span>
                    <span>Average: <span className="font-bold text-emerald-600">{matchupData.dismissals > 0 ? (matchupData.runsScored / matchupData.dismissals).toFixed(1) : matchupData.runsScored}</span></span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 4 — MATCH INSIGHTS & SVG WIN PROBABILITY */}
        {activeTab === 'insights' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-sm text-slate-800">
            
            {/* Win ratio line indicators */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-amber-600 font-display">CSK Probability: {match.winProbability.teamA}%</span>
                <span className="font-extrabold text-blue-600 font-display">MI Probability: {match.winProbability.teamB}%</span>
              </div>
              <div className="h-2.5 w-full bg-blue-600 rounded-full overflow-hidden flex shadow-inner">
                <div role="progressbar" style={{ width: `${match.winProbability.teamA}%` }} className="bg-amber-400 h-full transition-all duration-500 animate-pulse" />
              </div>
            </div>

            {/* Custom SVG Win probability chart */}
            <div className="space-y-3.5 border border-slate-100 p-4 rounded-2xl bg-slate-50/50 shadow-sm text-left">
              <span className="text-[10px] font-black uppercase font-mono block text-slate-400">Live Win Probability Over Overs (Innings Progression)</span>
              
              <div className="relative w-full h-40">
                {/* SVG coordinate drawing */}
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="3" />
                  <line x1="25" y1="0" x2="25" y2="100" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="1" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="1" />
                  <line x1="75" y1="0" x2="75" y2="100" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="1" />

                  {/* Lines drawing representing CSK's probability progression */}
                  <polyline
                     fill="none"
                     stroke="#d97706"
                     strokeWidth="2.5"
                     points="0,50 20,55 40,48 60,52 80,42 100,36" // Chasing trends (100 - value to map correctly)
                     className="transition-all duration-500"
                  />
                  
                  {/* Points markers */}
                  <circle cx="0" cy="50" r="1.5" fill="#d97706" />
                  <circle cx="20" cy="55" r="1.5" fill="#d97706" />
                  <circle cx="40" cy="48" r="1.5" fill="#d97706" />
                  <circle cx="60" cy="52" r="1.5" fill="#d97706" />
                  <circle cx="80" cy="42" r="1.5" fill="#d97706" />
                  <circle cx="100" cy="36" r="1.5" fill="#d97706" />
                </svg>

                <div className="absolute top-1 left-2 text-[8px] text-slate-400 font-mono font-bold">100% CSK</div>
                <div className="absolute bottom-1 left-2 text-[8px] text-slate-400 font-mono font-bold">100% MI</div>
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-400 font-bold">
                <span>Start</span>
                <span>Powerplay</span>
                <span>Mid overs</span>
                <span>Death overs</span>
                <span>Finish</span>
              </div>
            </div>

            {/* Wagon Wheel & Field diagram insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* SVG Wagon wheel Cricket Field */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col items-center">
                <span className="text-[9px] uppercase font-mono font-black text-slate-400 mb-2">Striker Scoring Wagon Wheel</span>
                
                <div className="relative w-36 h-36 border-4 border-emerald-500/10 rounded-full flex items-center justify-center bg-emerald-50 shadow-inner">
                  <div className="w-16 h-8 border border-slate-200/40 absolute top-14 left-10 rounded-sm flex items-center justify-center font-mono text-[8px] text-slate-500 font-bold bg-white/60">Crease</div>
                  
                  {/* Scoring SVG strokes */}
                  <svg className="absolute inset-0 w-full h-full">
                    {/* Cover Drive (4 runs) */}
                    <line x1="72" y1="72" x2="110" y2="30" stroke="#2563eb" strokeWidth="1.5" />
                    {/* Long on (6 runs) */}
                    <line x1="72" y1="72" x2="35" y2="10" stroke="#d97706" strokeWidth="2.5" />
                    {/* Fine leg (1 run) */}
                    <line x1="72" y1="72" x2="135" y2="120" stroke="#64748b" strokeWidth="1" />
                    {/* Square leg boundary (4 runs) */}
                    <line x1="72" y1="72" x2="10" y2="90" stroke="#2563eb" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="flex gap-2.5 text-[8px] font-mono text-slate-500 font-bold mt-2">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> 6s</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> 4s</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full" /> Singles</span>
                </div>
              </div>

              {/* Pitch report & Phase cards */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2 text-left">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold uppercase">WANKHEDE PITCH REPORT</span>
                  <div className="text-xs leading-relaxed text-slate-600 font-medium">
                    Strong grass-root binding provides clean bounce. Minimal lateral movement expected but spinners will secure slight friction once the shine strips.
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] text-slate-450 font-bold pt-1">
                    <div>Temp: <span className="text-slate-700">31°C</span></div>
                    <div>Humidity: <span className="text-slate-700">64%</span></div>
                    <div>Outfield: <span className="text-emerald-600">Lush Fast</span></div>
                    <div>Avg 1st Innings: <span className="text-slate-700">172</span></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2 text-left">
                  <span className="text-[10px] text-slate-400 font-mono font-extrabold uppercase text-left block">POWERPLAY METRICS</span>
                  <div className="text-xs flex justify-between font-mono font-bold text-slate-700">
                    <span>CSK (PP): <span className="font-bold text-amber-600">51/1 (8.50 rpo)</span></span>
                    <span>MI (PP): <span className="font-bold text-blue-600">46/2 (7.67 rpo)</span></span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5 — HIGHLIGHTS FEED & SUBMISSIONS */}
        {activeTab === 'highlights' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-sm text-slate-800">
            
            <h3 className="text-md font-black text-slate-800 font-display text-left">Archived Match Highlights</h3>
            
            {/* Horizontal highlights layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {HIGHLIGHTS_VIDEO.map((h) => (
                <div key={h.id} className="bg-slate-50 rounded-2xl border border-slate-150 overflow-hidden space-y-2.5 hover:border-slate-300 hover:bg-slate-100/30 transition-all cursor-pointer">
                  <div className="relative h-28 bg-slate-900">
                    <img src={h.thumbnail} alt={h.title} className="w-full h-full object-cover opacity-85" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-[8px] text-white px-1.5 py-0.5 rounded font-mono font-semibold">{h.duration}</span>
                  </div>
                  <div className="p-3 space-y-1 leading-snug text-left">
                    <span className="text-[8px] bg-blue-50 text-blue-600 border border-blue-100/50 px-2 py-0.5 rounded uppercase font-bold tracking-wider">{h.source}</span>
                    <h4 className="text-xs font-black text-slate-800 line-clamp-2">{h.title}</h4>
                    <p className="text-[9px] text-slate-400 line-clamp-2">{h.summary}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* moment Share section */}
            <div className="border-t border-slate-150 pt-5 space-y-4 text-left">
              <span className="text-xs font-black tracking-wider uppercase font-mono text-slate-450">Share What You Just Saw! 🏏</span>
              
              <form onSubmit={handlePostMoment} className="flex gap-2">
                <input
                  type="text"
                  value={newMomentText}
                  id="inp_moment_share"
                  onChange={(e) => setNewMomentText(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-800 px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all w-full font-semibold placeholder:text-slate-400"
                  placeholder="e.g. MSD came to the crease! Massive support..."
                />
                <button
                  type="submit"
                  id="btn_submit_moment"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md shadow-blue-500/10"
                >
                  <Send className="w-3.5 h-3.5" />
                  Broadcast
                </button>
              </form>

              {/* Shared Moments timeline stack */}
              <div className="space-y-2.5">
                {customMoments.map((cm) => (
                  <div key={cm.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 flex justify-between items-start gap-4 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-blue-600">{cm.user}</span>
                        <span className="text-[8px] text-slate-400 font-mono font-bold">Fan reaction</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{cm.text}</p>
                    </div>

                    <span className="text-[9px] text-slate-400 font-mono font-bold shrink-0">{cm.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
