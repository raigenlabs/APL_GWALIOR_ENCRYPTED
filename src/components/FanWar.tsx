/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  MessageSquare, 
  Image, 
  Vote, 
  Award, 
  Percent, 
  Send, 
  Flag, 
  Star,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { Match, FanPost, UserState } from '../types';

interface FanWarProps {
  user: UserState;
  match: Match;
  onUpdateUser: (updatedFields: Partial<UserState>) => void;
}

export default function FanWar({ user, match, onUpdateUser }: FanWarProps) {
  const [posts, setPosts] = useState<FanPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Allegiance choice states
  const [showAllegianceGate, setShowAllegianceGate] = useState(!user.teamPreference || user.teamPreference === 'neutral');
  
  // Create Post States
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState<'text' | 'meme' | 'poll' | 'prediction'>('text');
  const [postMemeUrl, setPostMemeUrl] = useState('');
  const [postPollData, setPostPollData] = useState({ question: '', opt1: 'Yes', opt2: 'No' });

  // Pinned High Velocity Post State
  const [topCSKPost, setTopCSKPost] = useState<FanPost | null>(null);
  const [topMIPost, setTopMIPost] = useState<FanPost | null>(null);

  // Active replies panel per post
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');

  // Symmetrical power meter sway
  const [cskPowerPercent, setCskPowerPercent] = useState(58);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/fan-war');
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
        
        // Find high-velocity posts (highest total reactions)
        const cskPosts = data.posts.filter((p: FanPost) => p.teamSide === 'A');
        const miPosts = data.posts.filter((p: FanPost) => p.teamSide === 'B');

        const getTop = (arr: FanPost[]) => {
          if (arr.length === 0) return null;
          return arr.reduce((prev, curr) => {
            const prevSum = prev.reactions.lit + prev.reactions.facts + prev.reactions.lol + prev.reactions.cap;
            const currSum = curr.reactions.lit + curr.reactions.facts + curr.reactions.lol + curr.reactions.cap;
            return (currSum > prevSum) ? curr : prev;
          });
        };

        setTopCSKPost(getTop(cskPosts));
        setTopMIPost(getTop(miPosts));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update dynamic crowd power meter sways based on scores
  useEffect(() => {
    const runsA = match.runs;
    const targets = match.target || 183;
    const battingPower = Math.round((runsA / targets) * 100);
    setCskPowerPercent(Math.max(30, Math.min(75, battingPower)));
  }, [match.runs]);

  const handleChooseAllegiance = (side: 'CSK' | 'MI' | 'neutral') => {
    onUpdateUser({ teamPreference: side });
    setShowAllegianceGate(false);
  };

  // Submit Post
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && postType === 'text') return;

    const team_letter = user.teamPreference === 'CSK' ? 'A' : user.teamPreference === 'MI' ? 'B' : 'neutral';

    try {
      const res = await fetch('/api/fan-war/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postText,
          type: postType,
          teamSide: team_letter,
          imageUrl: postType === 'meme' ? postMemeUrl || 'https://images.unsplash.com/photo-1540747737956-378724044432?w=500' : undefined,
          pollData: postType === 'poll' ? { question: postPollData.question || postText, options: [postPollData.opt1, postPollData.opt2] } : undefined,
          userName: user.name,
          userAvatar: user.avatar
        })
      });
      const data = await res.json();
      if (data.success) {
        setPostText('');
        setPostMemeUrl('');
        setPostPollData({ question: '', opt1: 'Yes', opt2: 'No' });
        setPostType('text');
        fetchPosts();

        // Grant some Karma for engaging
        onUpdateUser({ karma: user.karma + 15 });
        alert('Post submitted in all-India stream! +15 Fan Karma points earned! ⚡');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // React to post (Lit, Facts, LOL, Cap)
  const handlePostReaction = async (postId: string, reactionType: 'lit' | 'facts' | 'lol' | 'cap') => {
    try {
      const res = await fetch('/api/fan-war/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reactionType })
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reply Flow
  const handlePostReplySubmit = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    try {
      const res = await fetch('/api/fan-war/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: replyInput,
          user: {
            name: user.name,
            avatar: user.avatar
          }
        })
      });
      if (res.ok) {
        setReplyInput('');
        fetchPosts();
        setActiveReplyPostId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportPost = (postId: string) => {
    alert('Post flag registered with OpenAI Moderation gateway. If 3 reports occur, post will auto-hide.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 relative" id="fan_war_root">
      
      {/* ================= ENTRY GATE ALLEGIANCE MODAL ================= */}
      {showAllegianceGate && (
        <div id="modal_allegiance_gate" className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 p-8 rounded-3xl max-w-xl w-full text-center space-y-6 shadow-2xl relative">
            <span className="text-[10px] font-mono font-black tracking-widest text-brand-orange uppercase bg-orange-50 px-3.5 py-1 rounded-full border border-orange-100/50">CHOOSE YOUR COLORS</span>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black font-display text-slate-800">Select Your Support Crew</h2>
              <p className="text-xs text-slate-500 font-medium">Earn double Fan Karma multipliers by active streaming commentary.</p>
            </div>

            {/* Duel choice columns */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              
              {/* Chennai Super Kings (Yellow) */}
              <button
                id="btn_allegiance_csk"
                onClick={() => handleChooseAllegiance('CSK')}
                className="bg-amber-500/5 hover:bg-amber-500/10 text-center p-6 rounded-2xl border border-yellow-400 group transition-all duration-300 cursor-pointer flex flex-col items-center justify-center space-y-3 shadow-sm hover:shadow-md"
              >
                <img src="https://images.unsplash.com/photo-1540747737956-378724044432?w=100" alt="CSK" className="w-16 h-16 object-contain rounded-full bg-yellow-500/10 p-1" />
                <h4 className="text-xs font-black text-amber-600 group-hover:scale-105 transition-transform uppercase tracking-wider font-display">CSK Army</h4>
              </button>

              {/* Mumbai Indians (Blue) */}
              <button
                id="btn_allegiance_mi"
                onClick={() => handleChooseAllegiance('MI')}
                className="bg-blue-600/5 hover:bg-blue-600/10 text-center p-6 rounded-2xl border border-blue-400 group transition-all duration-300 cursor-pointer flex flex-col items-center justify-center space-y-3 shadow-sm hover:shadow-md"
              >
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="MI" className="w-16 h-16 object-contain rounded-full bg-blue-600/10 p-1" />
                <h4 className="text-xs font-black text-brand-blue group-hover:scale-105 transition-transform uppercase tracking-wider font-display">MI Paltan</h4>
              </button>
            </div>

            {/* Neutral Skip button */}
            <button
              id="btn_skip_allegiance"
              onClick={() => handleChooseAllegiance('neutral')}
              className="text-xs font-bold text-slate-400 hover:text-slate-800 underline cursor-pointer block w-full text-center"
            >
              Skip & Remain Neutral Viewer
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN SPLIT-SCREEN LAYOUT ================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[750px] relative">
        
        {/* LEFT COLUMN: Team A CSK (Yellow) */}
        <div id="csk_fanzone" className="md:col-span-6 bg-white p-5 rounded-3xl flex flex-col justify-between border-t-4 border-yellow-400 overflow-y-auto shadow-sm border border-slate-100">
          
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <img src={match.teamALogo} alt="CSK" className="w-8 h-8 rounded-full object-contain" />
                <div>
                  <h4 className="text-xs font-black text-amber-600 font-mono tracking-wider">CHENNAI SUPER KINGS</h4>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">14,832 fans cheering</span>
                </div>
              </div>

              {/* Hype level indicator */}
              <div className="text-right">
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase">Hype Index</span>
                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div className="bg-yellow-400 h-full w-[78%]" />
                </div>
              </div>
            </div>

            {/* Top Post this over pin */}
            {topCSKPost && (
              <div className="bg-amber-400/5 p-3.5 rounded-2xl border border-yellow-400/30 space-y-1.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 font-black text-[8px] px-2.5 py-1 rounded-bl uppercase font-mono tracking-wider">TOP COMMENTARY</div>
                <div className="flex items-center gap-1.5">
                  <img src={topCSKPost.userAvatar} alt="user" className="w-5 h-5 rounded-full" />
                  <span className="text-[9.5px] font-black text-amber-600 uppercase font-mono">{topCSKPost.userName}</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold truncate font-sans">{topCSKPost.content}</p>
              </div>
            )}

            {/* Public Posts Timeline */}
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {posts.filter(p => p.teamSide === 'A').map((post) => (
                <div key={post.id} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <img src={post.userAvatar} alt="user" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-800">{post.userName}</span>
                          {post.verifiedFan && (
                            <span className="text-[8px] bg-yellow-400/10 border border-yellow-400/20 text-amber-700 px-1.5 py-0.5 rounded-md uppercase font-black tracking-wider">Coach</span>
                          )}
                        </div>
                        <span className="text-[8px] text-slate-400 font-mono font-bold uppercase tracking-wider">Yellow Supporter</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono font-bold">CSK Stream</span>
                  </div>

                  <p className="text-xs text-slate-700 font-semibold font-sans leading-relaxed">{post.content}</p>

                  {/* Meme Display if exist */}
                  {post.imageUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-100 h-32">
                      <img src={post.imageUrl} alt="meme" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Reaction bar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                    {[
                      { type: 'lit', label: '🔥 Lit' },
                      { type: 'facts', label: '💯 Facts' },
                      { type: 'lol', label: '😂 LOL' },
                      { type: 'cap', label: '👀 Cap' }
                    ].map((rx) => (
                      <button
                        key={rx.type}
                        id={`btn_react_post_${post.id}_${rx.type}`}
                        onClick={() => handlePostReaction(post.id, rx.type as any)}
                        className={`bg-white hover:bg-slate-50 rounded-full px-2.5 py-1 text-[10px] flex items-center gap-1 cursor-pointer select-none transition-all shadow-sm ${
                          post.userReaction === rx.type ? 'border border-amber-400 text-amber-500 font-bold' : 'border border-slate-200 text-slate-500'
                        }`}
                      >
                        <span>{rx.label}</span>
                        <span className="font-bold text-[9.5px]">{post.reactions[rx.type as keyof typeof post.reactions] || 0}</span>
                      </button>
                    ))}

                    <button
                      onClick={() => handleReportPost(post.id)}
                      className="text-slate-400 hover:text-rose-500 ml-auto cursor-pointer"
                      title="Report / Flag Content"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* CSK specific bottom Post Box */}
          {user.teamPreference === 'CSK' ? (
            <form onSubmit={handlePostSubmit} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl mt-4 space-y-2 shadow-sm">
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  required
                  maxLength={280}
                  value={postText}
                  id="inp_csk_post_compose"
                  onChange={(e) => setPostText(e.target.value)}
                  className="bg-white border border-slate-200 text-xs text-slate-800 px-3.5 py-2.5 rounded-xl w-full outline-none focus:border-yellow-400"
                  placeholder="Blast CSK Whistle power chants! (Max 280 chars)"
                />
                <button
                  type="submit"
                  id="btn_csk_send_post"
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-xs px-4.5 py-2.5 rounded-xl shrink-0 cursor-pointer shadow-md shadow-yellow-400/20 active:scale-95 transition-all"
                >
                  Post
                </button>
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                <span>Chanting as: {user.name}</span>
                <span>{280 - postText.length} chars remaining</span>
              </div>
            </form>
          ) : (
            <div className="bg-slate-50 p-4 text-center text-[10px] text-slate-400 font-mono font-bold rounded-2xl mt-4 border border-dashed border-slate-200 uppercase tracking-widest flex flex-col md:flex-row items-center justify-between gap-3">
              <span>Yellow stream locked. Supporting rival team.</span>
              <button
                type="button"
                onClick={() => onUpdateUser({ teamPreference: 'CSK' })}
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-[9.5px] px-3.5 py-1.5 rounded-xl uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md shadow-yellow-400/10"
              >
                Join CSK Support
              </button>
            </div>
          )}

        </div>

        {/* MID COLUMN CROWD POWER SPLITTER */}
        <div className="hidden md:flex flex-col items-center justify-center absolute left-[50%] -translate-x-[50%] h-full z-10 w-8 pointer-events-none">
          <div className="h-1/2 bg-gradient-to-b from-yellow-400 to-brand-blue w-[2.5px] relative">
            <div className="absolute top-[50%] -translate-y-[50%] -translate-x-[40%] bg-white border border-slate-200 shadow-md rounded-full w-10 h-10 flex items-center justify-center font-mono font-black text-[10px] text-slate-700 tracking-tighter">
              {cskPowerPercent}%
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Team B MI (Blue) */}
        <div id="mi_fanzone" className="md:col-span-6 bg-white p-5 rounded-3xl flex flex-col justify-between border-t-4 border-blue-600 overflow-y-auto shadow-sm border border-slate-100">
          
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <img src={match.teamBLogo} alt="MI" className="w-8 h-8 rounded-full object-contain" />
                <div>
                  <h4 className="text-xs font-black text-brand-blue font-mono tracking-wider">MUMBAI INDIANS</h4>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">11,921 fans cheering</span>
                </div>
              </div>

              {/* Hype level indicator */}
              <div className="text-right">
                <span className="text-[9px] font-mono font-black text-slate-400 uppercase">Hype Index</span>
                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div className="bg-blue-500 h-full w-[65%]" />
                </div>
              </div>
            </div>

            {/* Top Post this over pin */}
            {topMIPost && (
              <div className="bg-blue-600/5 p-3.5 rounded-2xl border border-blue-600/30 space-y-1.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-brand-blue text-white font-black text-[8px] px-2.5 py-1 rounded-bl uppercase font-mono tracking-wider">TOP COMMENTARY</div>
                <div className="flex items-center gap-1.5">
                  <img src={topMIPost.userAvatar} alt="user" className="w-5 h-5 rounded-full" />
                  <span className="text-[9.5px] font-black text-brand-blue uppercase font-mono">{topMIPost.userName}</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold truncate font-sans">{topMIPost.content}</p>
              </div>
            )}

            {/* MI Public Posts Timeline */}
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {posts.filter(p => p.teamSide === 'B').map((post) => (
                <div key={post.id} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <img src={post.userAvatar} alt="user" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-800">{post.userName}</span>
                          {post.verifiedFan && (
                            <span className="text-[8px] bg-blue-500/10 border border-blue-500/20 text-brand-blue px-1.5 py-0.5 rounded-md uppercase font-black tracking-wider">Verified</span>
                          )}
                        </div>
                        <span className="text-[8px] text-slate-400 font-mono font-bold uppercase tracking-wider">Paltan Supporter</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono font-bold">MI Stream</span>
                  </div>

                  <p className="text-xs text-slate-700 font-semibold font-sans leading-relaxed">{post.content}</p>

                  {/* Meme Display if exist */}
                  {post.imageUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-100 h-32">
                      <img src={post.imageUrl} alt="meme" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Reaction bar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                    {[
                      { type: 'lit', label: '🔥 Lit' },
                      { type: 'facts', label: '💯 Facts' },
                      { type: 'lol', label: '😂 LOL' },
                      { type: 'cap', label: '👀 Cap' }
                    ].map((rx) => (
                      <button
                        key={rx.type}
                        id={`btn_react_post_mi_${post.id}_${rx.type}`}
                        onClick={() => handlePostReaction(post.id, rx.type as any)}
                        className={`bg-white hover:bg-slate-50 rounded-full px-2.5 py-1 text-[10px] flex items-center gap-1 cursor-pointer select-none transition-all shadow-sm ${
                          post.userReaction === rx.type ? 'border border-blue-500 text-blue-500 font-bold' : 'border border-slate-200 text-slate-500'
                        }`}
                      >
                        <span>{rx.label}</span>
                        <span className="font-bold text-[9.5px]">{post.reactions[rx.type as keyof typeof post.reactions] || 0}</span>
                      </button>
                    ))}

                    <button
                      onClick={() => handleReportPost(post.id)}
                      className="text-slate-400 hover:text-rose-500 ml-auto cursor-pointer"
                      title="Report / Flag Content"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* MI specific bottom Post Box */}
          {user.teamPreference === 'MI' ? (
            <form onSubmit={handlePostSubmit} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl mt-4 space-y-2 shadow-sm">
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  required
                  maxLength={280}
                  value={postText}
                  id="inp_mi_post_compose"
                  onChange={(e) => setPostText(e.target.value)}
                  className="bg-white border border-slate-200 text-xs text-slate-800 px-3.5 py-2.5 rounded-xl w-full outline-none focus:border-brand-blue"
                  placeholder="Blast MI Paltan power chants! (Max 280 chars)"
                />
                <button
                  type="submit"
                  id="btn_mi_send_post"
                  className="bg-brand-blue hover:bg-blue-600 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl shrink-0 cursor-pointer shadow-md shadow-brand-blue/20 active:scale-95 transition-all"
                >
                  Post
                </button>
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                <span>Chanting as: {user.name}</span>
                <span>{280 - postText.length} chars remaining</span>
              </div>
            </form>
          ) : (
            <div className="bg-slate-50 p-4 text-center text-[10px] text-slate-400 font-mono font-bold rounded-2xl mt-4 border border-dashed border-slate-200 uppercase tracking-widest flex flex-col md:flex-row items-center justify-between gap-3">
              <span>Blue stream locked. Supporting rival team.</span>
              <button
                type="button"
                onClick={() => onUpdateUser({ teamPreference: 'MI' })}
                className="bg-brand-blue hover:bg-blue-600 text-white font-extrabold text-[9.5px] px-3.5 py-1.5 rounded-xl uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md shadow-brand-blue/10"
              >
                Join MI Paltan
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
