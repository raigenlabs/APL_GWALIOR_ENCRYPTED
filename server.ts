/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { 
  Match, 
  Commentary, 
  WatchRoom, 
  ChatMessage, 
  Bet, 
  FanPost, 
  WalletTransaction 
} from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK with User-Agent and key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MOCK_KEY',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

const app = express();
app.use(express.json());

const PORT = 3000;

// STATE IN-MEMORY FOR PREMIUM REAL-TIME SIMULATION
let matchState: Match = {
  id: 'csk_vs_mi_2026',
  teamA: 'Chennai Super Kings',
  teamALogo: 'https://images.unsplash.com/photo-1540747737956-378724044432?w=100&auto=format&fit=crop&q=60',
  teamB: 'Mumbai Indians',
  teamBLogo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
  teamAAbbr: 'CSK',
  teamBAbbr: 'MI',
  teamAColor: 'from-amber-400 to-yellow-600',
  teamBColor: 'from-blue-600 to-indigo-800',
  runs: 148,
  wickets: 4,
  overs: 15.0,
  target: 183,
  currentInnings: 2,
  currentInningsTeam: 'teamA', // CSK chasing
  crr: 9.87,
  rrr: 7.00,
  status: 'live',
  batsmen: [
    { name: 'Shivam Dube', runs: 34, balls: 18, fours: 2, sixes: 3, strikeRate: 188.89 },
    { name: 'Ravindra Jadeja', runs: 12, balls: 8, fours: 1, sixes: 0, strikeRate: 150.00 }
  ],
  currentBowler: { name: 'Jasprit Bumrah', overs: 2.0, maidens: 0, runs: 14, wickets: 1, economy: 7.0 },
  lastFiveBalls: ['1', '6', 'W', '0', '4'],
  partnership: { runs: 42, balls: 24 },
  projectedScore: { atCurrent: 197, atSix: 184, atEight: 195, atTen: 206 },
  winProbability: { teamA: 64, teamB: 36 },
  oversTimeline: [
    { over: 1, teamAProb: 50 },
    { over: 3, teamAProb: 45 },
    { over: 6, teamAProb: 52 },
    { over: 9, teamAProb: 48 },
    { over: 12, teamAProb: 58 },
    { over: 15, teamAProb: 64 }
  ],
  pitchReport: {
    condition: 'Pace Friendly & True Bounce',
    temperature: 31,
    humidity: 64,
    avgScore: 172
  }
};

let commentaryFeed: Commentary[] = [
  { id: 'c_15_0', ballNumber: '15.0', eventType: 'runs', description: 'Jasprit Bumrah to Shivam Dube, 1 run, tucks it away to deep square leg for a single.', emojiReactions: { '🔥': 142, '💯': 82 }, timestamp: '14:48Z' },
  { id: 'c_14_5', ballNumber: '14.5', eventType: 'six', description: 'Jasprit Bumrah to Shivam Dube, SIX! OUT OF THE PARK! Short delivery sits up nicely, Dube launches this 98 meters over cow corner!', emojiReactions: { '🔥': 389, '🤯': 195, '💀': 22 }, timestamp: '14:47Z' },
  { id: 'c_14_4', ballNumber: '14.4', eventType: 'wicket', description: 'Jasprit Bumrah to Ruturaj Gaikwad, OUT! BOWLED HIM! A 148km/h vintage yorker crushes the base of leg-stump. An absolute peach of a delivery to dismiss the CSK skipper! Wankhede is screaming.', emojiReactions: { '💀': 295, '🤯': 180 }, timestamp: '14:46Z' },
  { id: 'c_14_3', ballNumber: '14.3', eventType: 'dot', description: 'Jasprit Bumrah to Ruturaj Gaikwad, no run, blockhole perfect, squeezed out back to the bowler.', emojiReactions: { '👏': 54 }, timestamp: '14:45Z' },
  { id: 'c_14_2', ballNumber: '14.2', eventType: 'runs', description: 'Jasprit Bumrah to Ruturaj Gaikwad, 2 runs, clipped through mid-wicket, lazy chasing allows them to slide back for a brace.', emojiReactions: { '👏': 45 }, timestamp: '14:44Z' },
  { id: 'c_14_1', ballNumber: '14.1', eventType: 'boundary', description: 'Jasprit Bumrah to Ruturaj Gaikwad, FOUR! Elegant! Half-volley on off, Gaikwad presents the full face, driving beautiful straight of mid-on.', emojiReactions: { '🔥': 156, '💯': 74 }, timestamp: '14:43Z' }
];

let watchRooms: WatchRoom[] = [
  {
    id: 'room_csk_super',
    name: 'CSK Whistle Podu Army Live 💛',
    hostId: 'system',
    hostName: 'Suresh (Host)',
    matchId: 'csk_vs_mi_2026',
    inviteCode: 'YELLOVE',
    isPrivate: false,
    bettingEnabled: true,
    maxMembers: 12,
    inviteLink: `${process.env.APP_URL || 'http://localhost:3000'}/room/room_csk_super`,
    members: [
      { id: 'system', name: 'Suresh (Host)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', isMuted: false, volume: 100, isSpeaking: true },
      { id: 'u_1', name: 'DhoniFan7', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', isMuted: false, volume: 80, isSpeaking: false },
      { id: 'u_2', name: 'RaviCSK', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', isMuted: true, volume: 0, isSpeaking: false }
    ],
    poll: {
      id: 'p_1',
      question: 'Will Shivam Dube hit a six in the next over?',
      options: [
        { id: 'opt_1', label: 'Yes, easily!', votes: 21 },
        { id: 'opt_2', label: 'No, bowlers will restrict him', votes: 12 }
      ],
      totalVotes: 33
    }
  },
  {
    id: 'room_wankhede',
    name: 'Wankhede Blue Lounge 💙 (Neutral/MI)',
    hostId: 'system2',
    hostName: 'Karan (Host)',
    matchId: 'csk_vs_mi_2026',
    inviteCode: 'MIPALTAN',
    isPrivate: false,
    bettingEnabled: true,
    maxMembers: 10,
    inviteLink: `${process.env.APP_URL || 'http://localhost:3000'}/room/room_wankhede`,
    members: [
      { id: 'system2', name: 'Karan (Host)', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', isMuted: false, volume: 100 },
      { id: 'u_4', name: 'RoHitman45', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', isMuted: false, volume: 90, isSpeaking: true }
    ]
  }
];

let chatMessages: { [roomId: string]: ChatMessage[] } = {
  'room_csk_super': [
    { id: 'm_1', roomId: 'room_csk_super', userId: 'u_1', userName: 'DhoniFan7', userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', content: 'What a delivery by Bumrah though... unbelievable yorker', type: 'text', timestamp: '14:46Z' },
    { id: 'm_2', roomId: 'room_csk_super', userId: 'system', userName: 'Suresh (Host)', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', content: 'DUBE is in the middle now! Time for some massive maximums 💛', type: 'text', timestamp: '14:47Z' },
    { id: 'm_3', roomId: 'room_csk_super', userId: 'u_2', userName: 'RaviCSK', userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', content: '🔥', type: 'emoji-burst', timestamp: '14:48Z' }
  ],
  'room_wankhede': [
    { id: 'm_4', roomId: 'room_wankhede', userId: 'u_4', userName: 'RoHitman45', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', content: 'BUMRAH GETS THE CAPTAIN! Game over for CSK!', type: 'text', timestamp: '14:47Z' }
  ]
};

let activeBets: Bet[] = [];
let userWallet = {
  balance: 350,
  transactions: [
    { id: 't_init', type: 'topup', amount: 500, referenceId: 'PAY-8923-MOCK', created_at: '2026-05-24T12:00:00Z' },
    { id: 't_bet1', type: 'bet', amount: 150, referenceId: 'BET-5021-MOCK', created_at: '2026-05-24T14:45:00Z' }
  ] as WalletTransaction[],
  dailyLossLimit: 1000,
  kycVerified: false,
  kycAadhaar: '',
  kycPan: '',
  ageVerified: false
};

// Fan War posts
let fanPosts: FanPost[] = [
  {
    id: 'f_1',
    userId: 'mi_supporter',
    userName: 'KunalMI',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    matchId: 'csk_vs_mi_2026',
    teamSide: 'B', // MI
    type: 'text',
    content: '5 IPL throphies speak for themselves. Chasing at Wankhede vs Bumrah is CSK’s worst nightmare! #Paltan',
    verifiedFan: true,
    created_at: '2026-05-24T14:35:00Z',
    reactions: { lit: 45, facts: 132, lol: 12, cap: 8 },
    replies: [
      { id: 'rep_1', userName: 'WhistleYellove', userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', content: 'Check the head-to-head recent record mate, we own you in play-offs!', created_at: '2026-05-24T14:37:00Z' }
    ]
  },
  {
    id: 'f_2',
    userId: 'csk_supporter',
    userName: 'DhoniWorshipper',
    userAvatar: 'https://images.unsplash.com/photo-1618015358954-115ef1ed6515?w=100',
    matchId: 'csk_vs_mi_2026',
    teamSide: 'A', // CSK
    type: 'prediction',
    content: 'Prediction: Shivam Dube will smack at least 2 sixes in the next 10 balls! Absolute monster in middle overs.',
    predictionData: { text: "Shivam Dube 2+ sixes in next 10 balls", isCorrect: true, karmaAwarded: 50 },
    verifiedFan: false,
    created_at: '2026-05-24T14:40:00Z',
    reactions: { lit: 145, facts: 98, lol: 2, cap: 15 },
    replies: []
  },
  {
    id: 'f_3',
    userId: 'neut_guy',
    userName: 'CricketLover99',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    matchId: 'csk_vs_mi_2026',
    teamSide: 'neutral',
    type: 'meme',
    imageUrl: 'https://images.unsplash.com/photo-1540747737956-378724044432?w=500',
    content: 'Me watching MI fans and CSK fans fight while just enjoying MSD batting deep 🤷‍♂️🍿',
    verifiedFan: false,
    created_at: '2026-05-24T14:43:00Z',
    reactions: { lit: 88, facts: 54, lol: 167, cap: 3 },
    replies: []
  }
];

// LIVE UPDATING BACKROUND CRICKET ENGINE (Tick every 5 seconds)
let lastBallOutcome = '1';
let deliveryCounter = 0;
setInterval(() => {
  if (matchState.status !== 'live') return;

  // 1. Advance the Overs State
  let currentOvers = matchState.overs;
  let oversInt = Math.floor(currentOvers);
  let ballInOver = Math.round((currentOvers - oversInt) * 10);

  ballInOver += 1;
  if (ballInOver >= 6) {
    ballInOver = 0;
    oversInt += 1;
  }
  matchState.overs = parseFloat(`${oversInt}.${ballInOver}`);

  // 2. Select Ball Outcome
  // Outcomes: '0' (dot), '1' (single), '2' (double), '4' (four), '6' (six!), 'W' (wicket), 'Wd' (wide), 'Nb' (no-ball)
  const roll = Math.random();
  let outcome = '1';
  let scoreAdd = 0;
  let wicketAdd = 0;
  let eventType: Commentary['eventType'] = 'runs';
  let commentaryText = '';

  const batsmenNames = matchState.batsmen.map(b => b.name);
  const activeStriker = matchState.batsmen[0];
  const activeNonStriker = matchState.batsmen[1];
  const bowler = matchState.currentBowler;

  if (roll < 0.35) {
    outcome = '0';
    eventType = 'dot';
    scoreAdd = 0;
    activeStriker.runs += 0;
    activeStriker.balls += 1;
    commentaryText = `${bowler.name} to ${activeStriker.name}, no run, excellent dot ball! Sneaks through past the probing defensive push.`;
  } else if (roll < 0.65) {
    outcome = '1';
    eventType = 'runs';
    scoreAdd = 1;
    activeStriker.runs += 1;
    activeStriker.balls += 1;
    commentaryText = `${bowler.name} to ${activeStriker.name}, 1 run, guided gently down to third-man to turn the strike over.`;
    // Rotate batsman
    matchState.batsmen = [activeNonStriker, activeStriker];
  } else if (roll < 0.75) {
    outcome = '2';
    eventType = 'runs';
    scoreAdd = 2;
    activeStriker.runs += 2;
    activeStriker.balls += 1;
    commentaryText = `${bowler.name} to ${activeStriker.name}, 2 runs, clipped off the pads with absolute wrist-perfection, sprinting back for the second.`;
  } else if (roll < 0.85) {
    outcome = '4';
    eventType = 'boundary';
    scoreAdd = 4;
    activeStriker.runs += 4;
    activeStriker.balls += 1;
    activeStriker.fours += 1;
    commentaryText = `${bowler.name} to ${activeStriker.name}, FOUR! Cracking shot! Dispatched with sheer disdain through the extra-cover boundary!`;
  } else if (roll < 0.92) {
    outcome = '6';
    eventType = 'six';
    scoreAdd = 6;
    activeStriker.runs += 6;
    activeStriker.balls += 1;
    activeStriker.sixes += 1;
    commentaryText = `${bowler.name} to ${activeStriker.name}, SIX! OUT OF THE GROUND! Elevated high into the night sky, clearing the long-on stands effortlessly! Majestic connection!`;
  } else if (roll < 0.97) {
    outcome = 'W';
    eventType = 'wicket';
    scoreAdd = 0;
    wicketAdd = 1;
    activeStriker.balls += 1;
    commentaryText = `${bowler.name} to ${activeStriker.name}, OUT! WICKET! Caught at deep mid-wicket! He went for another massive launch, got more height than distance, and is safely bagged under the lights! Outstanding catch!`;
    
    // Replace batsman with iconic MS Dhoni or Ajinkya Rahane if wickets are falling
    if (matchState.wickets + 1 < 10) {
      const remainingBatsmen = ['MS Dhoni', 'Ajinkya Rahane', 'Sameer Rizvi', 'Shardul Thakur'];
      const nextName = remainingBatsmen[matchState.wickets % remainingBatsmen.length] || 'TailEnder';
      matchState.batsmen[0] = {
        name: nextName,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0
      };
    }
  } else {
    outcome = 'Wd';
    eventType = 'wide';
    scoreAdd = 1;
    commentaryText = `${bowler.name} to ${activeStriker.name}, 1 wide, spray of line down the leg-side, wicketkeeper lunges to gather. Extra added.`;
    // Overs don't advance for wide, so backtrack overs tick
    matchState.overs = currentOvers;
  }

  // Update Score Card
  matchState.runs += scoreAdd;
  matchState.wickets += wicketAdd;
  bowler.runs += scoreAdd;
  if (outcome === 'W') bowler.wickets += 1;
  bowler.overs = parseFloat((bowler.overs + (outcome === 'Wd' ? 0 : 0.1)).toFixed(1));
  if (Math.round((bowler.overs - Math.floor(bowler.overs)) * 10) >= 6) {
    bowler.overs = Math.floor(bowler.overs) + 1.0;
  }
  
  matchState.crr = parseFloat(((matchState.runs / (oversInt + (ballInOver / 6))) || 9.5).toFixed(2));
  if (matchState.target) {
    const runsRequired = matchState.target - matchState.runs;
    const remainingBalls = (20 * 6) - (oversInt * 6 + ballInOver);
    matchState.rrr = parseFloat(((runsRequired / (remainingBalls / 6)) || 0).toFixed(2));

    // Handle Completed Chases / Defense
    if (matchState.runs >= matchState.target) {
      matchState.status = 'completed';
      commentaryText = `MATCH COMPLETED! Chennai Super Kings pull off a phenomenal run chase at Wankhede! Celebrating Whistle Podu Style 💛!`;
    } else if (remainingBalls <= 0 || matchState.wickets >= 10) {
      matchState.status = 'completed';
      commentaryText = `MATCH COMPLETED! Mumbai Indians defend successfully! Phenomenal final death overs defense by Bumrah! Blue flag flies high! 💙`;
    }
  }

  // Calculate strike rates
  matchState.batsmen.forEach(b => {
    b.strikeRate = b.balls > 0 ? parseFloat(((b.runs / b.balls) * 100).toFixed(2)) : 0;
  });
  
  bowler.economy = bowler.overs > 0 ? parseFloat((bowler.runs / bowler.overs).toFixed(2)) : 0;

  // Slide last five balls
  matchState.lastFiveBalls.push(outcome);
  if (matchState.lastFiveBalls.length > 5) {
    matchState.lastFiveBalls.shift();
  }

  // Live Win probability sway
  let probSway = (Math.random() - 0.5) * 6;
  if (outcome === '6' || outcome === '4') probSway += 5;
  if (outcome === 'W') probSway -= 12;
  matchState.winProbability.teamA = Math.max(5, Math.min(95, Math.round(matchState.winProbability.teamA + probSway)));
  matchState.winProbability.teamB = 100 - matchState.winProbability.teamA;

  // Add Commentary entry
  const newCommId = `c_dyn_${Date.now()}`;
  const newComm: Commentary = {
    id: newCommId,
    ballNumber: matchState.overs.toFixed(1),
    eventType,
    description: commentaryText,
    emojiReactions: { '🔥': outcome === '6' || outcome === 'W' ? 120 : 15, '💀': outcome === 'W' ? 240 : 2, '👏': 30 },
    timestamp: new Date().toISOString().split('T')[1].substring(0, 5) + 'Z'
  };
  commentaryFeed.unshift(newComm);
  if (commentaryFeed.length > 50) commentaryFeed.pop();

  // 3. Resolve Bets
  activeBets = activeBets.map(bet => {
    if (bet.status !== 'pending') return bet;

    // Check resolve logic
    let resolved = false;
    let won = false;
    
    if (bet.category === 'next-ball') {
      resolved = true;
      const bOption = bet.option.toLowerCase();
      if (bOption === 'dot' && outcome === '0') won = true;
      else if (bOption === '1' && outcome === '1') won = true;
      else if (bOption === '2' && outcome === '2') won = true;
      else if (bOption === '4' && outcome === '4') won = true;
      else if (bOption === '6' && outcome === '6') won = true;
      else if (bOption === 'wicket' && outcome === 'W') won = true;
      else if (bOption === 'wide' && outcome === 'Wd') won = true;
    }

    if (resolved) {
      const status = won ? 'won' : 'lost';
      const winAmount = won ? Math.round(bet.amount * bet.odds) : 0;
      if (won) {
        userWallet.balance += winAmount;
        // Record ledger payout
        userWallet.transactions.unshift({
          id: `w_win_${Date.now()}`,
          type: 'win',
          amount: winAmount,
          referenceId: `OUT-RESOLVE-${bet.id}`,
          created_at: new Date().toISOString()
        });
      }
      return { ...bet, status, settledAt: new Date().toISOString() };
    }
    return bet;
  });

  // Simulated live room activities (random chat messages from other users and random poll entries)
  deliveryCounter++;
  if (deliveryCounter % 3 === 0) {
    const randomCSKMessages = [
      "MSD inside-out cover drive is pure class!",
      "Hardik needs to bring Chawla now.",
      "What a pitch! Supporting both pace and shotmaking",
      "Let’s go Whistle Podu! CSK CSK!",
      "Oh my god, Pathirana bowling next? We are safe!"
    ];
    const randomAvatars = [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100",
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
    ];
    const randomUsers = ["DhoniFan7", "RaviCSK", "GoldYellove"];
    const textIdx = Math.floor(Math.random() * randomCSKMessages.length);
    const userIdx = Math.floor(Math.random() * randomUsers.length);
    
    // Add simulated message to csk army room
    chatMessages['room_csk_super'].push({
      id: `m_sim_${Date.now()}`,
      roomId: 'room_csk_super',
      userId: `sim_usr_${userIdx}`,
      userName: randomUsers[userIdx],
      userAvatar: randomAvatars[userIdx],
      content: randomCSKMessages[textIdx],
      type: 'text',
      timestamp: new Date().toISOString().split('T')[1].substring(0, 5) + 'Z'
    });
    if (chatMessages['room_csk_super'].length > 100) chatMessages['room_csk_super'].shift();
  }

}, 5000);

// API LANDING & COMPATIBILITY ENDPOINTS
app.get('/api/live-state', (req, res) => {
  res.json({ match: matchState });
});

app.get('/api/commentary', (req, res) => {
  res.json({ commentary: commentaryFeed });
});

app.post('/api/commentary/react', (req, res) => {
  const { commentaryId, emoji } = req.body;
  const comm = commentaryFeed.find(c => c.id === commentaryId);
  if (comm) {
    comm.emojiReactions[emoji] = (comm.emojiReactions[emoji] || 0) + 1;
    return res.json({ success: true, reactions: comm.emojiReactions });
  }
  res.status(404).json({ error: 'Commentary item not found' });
});

// WATCH ROOMS ENDPOINTS
app.get('/api/rooms', (req, res) => {
  res.json({ rooms: watchRooms });
});

app.post('/api/rooms', (req, res) => {
  const { name, isPrivate, bettingEnabled, maxMembers } = req.body;
  const generatedId = `room_${Date.now()}`;
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const newRoom: WatchRoom = {
    id: generatedId,
    name: name || 'Unnamed Fan Cave',
    hostId: 'current_user',
    hostName: 'You (Host)',
    matchId: 'csk_vs_mi_2026',
    inviteCode,
    isPrivate: !!isPrivate,
    bettingEnabled: !!bettingEnabled,
    maxMembers: Number(maxMembers) || 8,
    inviteLink: `${process.env.APP_URL || 'http://localhost:3000'}/room/${generatedId}`,
    members: [
      { id: 'current_user', name: 'You (Host)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', isMuted: false, volume: 100 }
    ],
    poll: {
      id: `p_${Date.now()}`,
      question: 'Who will win the match?',
      options: [
        { id: 'opt_1', label: 'Chennai Super Kings 💛', votes: 1 },
        { id: 'opt_2', label: 'Mumbai Indians 💙', votes: 0 }
      ],
      totalVotes: 1
    }
  };
  watchRooms.push(newRoom);
  chatMessages[generatedId] = [
    {
      id: `m_init_${Date.now()}`,
      roomId: generatedId,
      userId: 'system',
      userName: 'PitchSide Bot 🏏',
      userAvatar: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=100',
      content: `Welcome to the watch room! Share the invite code ${inviteCode} with your friends to join the audio lounge and betting tables. Defend your team!`,
      type: 'text',
      timestamp: new Date().toISOString()
    }
  ];
  res.json({ success: true, room: newRoom });
});

app.get('/api/rooms/:id', (req, res) => {
  const room = watchRooms.find(r => r.id === req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ room, chats: chatMessages[room.id] || [] });
});

app.post('/api/rooms/:id/chats', (req, res) => {
  const { content, type, user } = req.body;
  const matchRoom = watchRooms.find(r => r.id === req.params.id);
  if (!matchRoom) return res.status(404).json({ error: 'Room not found' });
  
  const newMsg: ChatMessage = {
    id: `m_${Date.now()}`,
    roomId: matchRoom.id,
    userId: user?.id || 'current_user',
    userName: user?.name || 'You',
    userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    content: content || '',
    type: type || 'text',
    timestamp: new Date().toISOString().split('T')[1].substring(0, 5) + 'Z'
  };

  if (!chatMessages[matchRoom.id]) chatMessages[matchRoom.id] = [];
  chatMessages[matchRoom.id].push(newMsg);
  res.json({ success: true, message: newMsg });
});

app.post('/api/rooms/:id/polls', (req, res) => {
  const { question, option1, option2 } = req.body;
  const room = watchRooms.find(r => r.id === req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  room.poll = {
    id: `p_${Date.now()}`,
    question,
    options: [
      { id: 'opt_1', label: option1 || 'Option 1', votes: 0 },
      { id: 'opt_2', label: option2 || 'Option 2', votes: 0 }
    ],
    totalVotes: 0,
    userVotes: {}
  };
  res.json({ success: true, poll: room.poll });
});

app.post('/api/rooms/:id/polls/vote', (req, res) => {
  const { optionId, userId } = req.body;
  const room = watchRooms.find(r => r.id === req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (!room.poll) return res.status(400).json({ error: 'No active poll in this room' });

  if (!room.poll.userVotes) room.poll.userVotes = {};
  if (room.poll.userVotes[userId]) return res.status(400).json({ error: 'Already voted!' });

  const opt = room.poll.options.find(o => o.id === optionId);
  if (opt) {
    opt.votes += 1;
    room.poll.totalVotes += 1;
    room.poll.userVotes[userId] = optionId;
    return res.json({ success: true, poll: room.poll });
  }
  res.status(400).json({ error: 'Invalid option selected' });
});

// BETTING MODULE ENDPOINTS
app.post('/api/rooms/:id/bets', (req, res) => {
  const { category, question, option, amount, odds } = req.body;
  if (!userWallet.ageVerified) {
    return res.status(400).json({ error: 'Age verification required! Must be 18+ to place wagers.' });
  }
  if (userWallet.balance < amount) {
    return res.status(400).json({ error: 'Insufficient wallet balance.' });
  }
  if (amount < 10) {
    return res.status(400).json({ error: 'Minimum bet amount is ₹10.' });
  }

  // Deduct from wallet immediately
  userWallet.balance -= amount;
  userWallet.transactions.unshift({
    id: `w_bet_${Date.now()}`,
    type: 'bet',
    amount: amount,
    referenceId: `BET-PLACED-${Date.now()}`,
    created_at: new Date().toISOString()
  });

  const newBet: Bet = {
    id: `bet_${Date.now()}`,
    userId: 'current_user',
    roomId: req.params.id,
    question,
    category,
    option,
    amount,
    odds,
    status: 'pending',
    ballTarget: matchState.overs.toFixed(1)
  };
  
  activeBets.unshift(newBet);
  res.json({ success: true, bet: newBet, walletBalance: userWallet.balance });
});

app.get('/api/bets', (req, res) => {
  res.json({ bets: activeBets });
});

// FAN WAR ENDPOINTS
app.get('/api/fan-war', (req, res) => {
  res.json({ posts: fanPosts });
});

app.post('/api/fan-war/post', (req, res) => {
  const { content, type, teamSide, imageUrl, pollData } = req.body;
  const newPost: FanPost = {
    id: `f_${Date.now()}`,
    userId: 'current_user',
    userName: req.body.userName || 'NeutralObserver',
    userAvatar: req.body.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    matchId: 'csk_vs_mi_2026',
    teamSide: teamSide || 'neutral',
    type: type || 'text',
    content: content || '',
    imageUrl: imageUrl || undefined,
    verifiedFan: false,
    created_at: new Date().toISOString(),
    reactions: { lit: 0, facts: 0, lol: 0, cap: 0 },
    replies: []
  };

  if (type === 'poll' && pollData) {
    newPost.pollData = {
      question: pollData.question,
      options: pollData.options.map((o: string) => ({ label: o, votes: 0 }))
    };
  }

  if (type === 'prediction') {
    newPost.predictionData = {
      text: content,
      isCorrect: undefined,
      karmaAwarded: 50
    };
  }

  fanPosts.unshift(newPost);
  res.json({ success: true, post: newPost });
});

app.post('/api/fan-war/react', (req, res) => {
  const { postId, reactionType } = req.body;
  const post = fanPosts.find(p => p.id === postId);
  if (post) {
    const rx = reactionType as 'lit' | 'facts' | 'lol' | 'cap';
    post.reactions[rx] = (post.reactions[rx] || 0) + 1;
    post.userReaction = rx;
    return res.json({ success: true, reactions: post.reactions });
  }
  res.status(404).json({ error: 'Post not found' });
});

app.post('/api/fan-war/reply', (req, res) => {
  const { postId, content, user } = req.body;
  const post = fanPosts.find(p => p.id === postId);
  if (post) {
    const newReply = {
      id: `rep_${Date.now()}`,
      userName: user?.name || 'WhistleFan',
      userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      content: content || '',
      created_at: new Date().toISOString()
    };
    post.replies.push(newReply);
    return res.json({ success: true, replies: post.replies });
  }
  res.status(404).json({ error: 'Post not found' });
});

// WALLET LEDGER ENDPOINTS
app.get('/api/user-wallet', (req, res) => {
  res.json({ wallet: userWallet });
});

app.post('/api/wallet/topup', (req, res) => {
  const { amount } = req.body;
  const topupVal = Number(amount) || 100;
  
  userWallet.balance += topupVal;
  userWallet.transactions.unshift({
    id: `w_top_${Date.now()}`,
    type: 'topup',
    amount: topupVal,
    referenceId: `PAY-MOCK-${Math.floor(Math.random() * 900000 + 100000)}`,
    created_at: new Date().toISOString()
  });

  res.json({ success: true, balance: userWallet.balance, transactions: userWallet.transactions });
});

app.post('/api/wallet/withdraw', (req, res) => {
  const { amount, upiId } = req.body;
  const withdrawVal = Number(amount);

  if (!userWallet.kycVerified) {
    return res.status(400).json({ error: 'KYC Verification (PAN & Aadhaar) required before withdrawals! Visit Wallet tab to secure your digital footprint.' });
  }
  if (withdrawVal < 100) {
    return res.status(400).json({ error: 'Minimum withdrawal limit is ₹100.' });
  }
  if (userWallet.balance < withdrawVal) {
    return res.status(400).json({ error: 'Insufficient balance for withdrawal request.' });
  }

  userWallet.balance -= withdrawVal;
  userWallet.transactions.unshift({
    id: `w_out_${Date.now()}`,
    type: 'withdrawal',
    amount: withdrawVal,
    referenceId: `UPI-MOCK-${Math.floor(Math.random() * 900000 + 100000)}`,
    created_at: new Date().toISOString()
  });

  res.json({ success: true, balance: userWallet.balance, transactions: userWallet.transactions });
});

app.post('/api/wallet/verify-kyc', (req, res) => {
  const { aadhaar, pan, ageChecked } = req.body;
  if (!aadhaar || !pan) {
    return res.status(400).json({ error: 'Aadhaar (12 digits) and PAN (10 chars) are required for DigiLocker validation.' });
  }
  
  userWallet.kycVerified = true;
  userWallet.kycAadhaar = aadhaar;
  userWallet.kycPan = pan;
  userWallet.ageVerified = !!ageChecked;

  res.json({ success: true, wallet: userWallet });
});

app.post('/api/wallet/limits', (req, res) => {
  const { dailyLossLimit } = req.body;
  userWallet.dailyLossLimit = Number(dailyLossLimit) || 1000;
  res.json({ success: true, wallet: userWallet });
});


// GEMINI CHATTER & INTELLECTUAL MATCH REPORTS (Server-Side call!)
app.post('/api/ai/analyze-match', async (req, res) => {
  try {
    const commentsSummary = commentaryFeed.slice(0, 10).map(c => `[Over ${c.ballNumber}] ${c.description}`).join('\n');
    const prompt = `
You are a witty, extremely energetic, legendary cricket television summariser speaking on the Indian Premier League 'Fan Clash Show'.
Review the recent live deliveries & match state and speak to our passionate CSK/MI fans:

MATCH STATE:
Team Bowling: Mumbai Indians
Team Batting & Chasing: Chennai Super Kings
Current score: ${matchState.runs}/${matchState.wickets} in ${matchState.overs} overs (Target is ${matchState.target} to win)
Batsmen in center: ${matchState.batsmen.map(b => `${b.name} (${b.runs} runs off ${b.balls} balls)`).join(' and ')}
Bowler finishing: ${matchState.currentBowler.name}

RECENT LIVE COMMENTARY:
${commentsSummary}

Task:
Deliver a razor-sharp, hilarious, 3-paragraph live insight report.
Paragraph 1: Describe the dramatic tension or a key moment on the pitch, highlighting how a batsman is thriving or a bowler like Bumrah is putting absolute heat.
Paragraph 2: Playfully address the extreme rivalry between the yellow 'Whistle Podu' army and the blue 'MI Paltan', commenting on the live crowd sways and fan banters.
Paragraph 3: Give an expert statistical prediction for the crunch death overs (e.g. projecting whether MS Dhoni or Shivam Dube will secure the target, or if Bumrah/Coetzee will strike gold).

Keep the language punchy, loaded with cricket slang (e.g. 'maximums', 'yorkers', 'benders', 'snapped'), deep IPL references, and full of high-energy vibes. Keep paragraphs distinct.
`;

    // Retrieve API key inside server securely
    if (!process.env.GEMINI_API_KEY) {
      // Return beautiful mock analysis if key is not ready yet, so preview is always fully operational!
      return res.json({
        summary: `🚨 *Mock Expert Analysis (API Key not configured in Settings > Secrets)* 🚨\n\n**1. High-Octane Turf War:** Shivam Dube is batting like an absolute absolute freight train! With Bumrah charging in at the death, sending down 148kph lasers, we are seeing a gladiatorial duel here. Dube launching a massive 98m maximum stands as the shot of the match, but that toe-crushing yorker which cleaner-bowled Ruturaj Gaikwad indicates the Paltan bowlers aren't giving an inch.\n\n**2. Fan Chaos Unbounded:** Whistle Podu army is swinging their yellow scarves in the stands while the MI Paltan is shouting Roh-it! Roh-it! with deafening pitch. On our live Fan War boards, CSK supporters are predicting gold while MI fans are arguing the match is already locked in their locker! The crowd sways are absolutely mental!\n\n**3. Bulletproof Prediction:** With MS Dhoni sitting ready in the wings and Jadeja supporting, CSK has that classic 'Ice-in-the-veins' chase energy. This is going down to the final delivery, guys! Expect 12 runs required off the final over and a spectacular finish! Whistle Podu or Paltan, grab your popcorn!`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error('Gemini call error:', error);
    res.status(500).json({ error: error.message });
  }
});


// VITE DEVELOPMENT MIDDLEWARE INTERFACES
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PitchSide running live on http://localhost:${PORT}`);
  });
}

startServer();
