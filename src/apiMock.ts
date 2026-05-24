/**
 * PitchSide Client-Side Mock API Interceptor
 * 
 * Intercepts all window.fetch API requests on the client side to bypass the
 * need for a backend server. Features a highly robust real-time in-browser 
 * simulated cricket engine that updates every 5 seconds.
 */

import { Match, Commentary, WatchRoom, ChatMessage, Bet, FanPost, WalletTransaction } from './types';

// Utility helper to load/save from localStorage
const getJSON = <T>(key: string, defaultValue: T): T => {
  const v = localStorage.getItem(key);
  if (!v) return defaultValue;
  try {
    return JSON.parse(v) as T;
  } catch (e) {
    return defaultValue;
  }
};

const saveJSON = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- INITIAL STATE ---
const INITIAL_MATCH: Match = {
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

const INITIAL_COMMENTARY: Commentary[] = [
  { id: 'c_15_0', ballNumber: '15.0', eventType: 'runs', description: 'Jasprit Bumrah to Shivam Dube, 1 run, tucks it away to deep square leg for a single.', emojiReactions: { '🔥': 142, '💯': 82 }, timestamp: '14:48Z' },
  { id: 'c_14_5', ballNumber: '14.5', eventType: 'six', description: 'Jasprit Bumrah to Shivam Dube, SIX! OUT OF THE PARK! Short delivery sits up nicely, Dube launches this 98 meters over cow corner!', emojiReactions: { '🔥': 389, '🤯': 195, '💀': 22 }, timestamp: '14:47Z' },
  { id: 'c_14_4', ballNumber: '14.4', eventType: 'wicket', description: 'Jasprit Bumrah to Ruturaj Gaikwad, OUT! BOWLED HIM! A 148km/h vintage yorker crushes the base of leg-stump. An absolute peach of a delivery to dismiss the CSK skipper! Wankhede is screaming.', emojiReactions: { '💀': 295, '🤯': 180 }, timestamp: '14:46Z' },
  { id: 'c_14_3', ballNumber: '14.3', eventType: 'dot', description: 'Jasprit Bumrah to Ruturaj Gaikwad, no run, blockhole perfect, squeezed out back to the bowler.', emojiReactions: { '👏': 54 }, timestamp: '14:45Z' },
  { id: 'c_14_2', ballNumber: '14.2', eventType: 'runs', description: 'Jasprit Bumrah to Ruturaj Gaikwad, 2 runs, clipped through mid-wicket, lazy chasing allows them to slide back for a brace.', emojiReactions: { '👏': 45 }, timestamp: '14:44Z' },
  { id: 'c_14_1', ballNumber: '14.1', eventType: 'boundary', description: 'Jasprit Bumrah to Ruturaj Gaikwad, FOUR! Elegant! Half-volley on off, Gaikwad presents the full face, driving beautiful straight of mid-on.', emojiReactions: { '🔥': 156, '💯': 74 }, timestamp: '14:43Z' }
];

const INITIAL_WATCH_ROOMS: WatchRoom[] = [
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
    inviteLink: `${window.location.origin}/room/room_csk_super`,
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
    inviteLink: `${window.location.origin}/room/room_wankhede`,
    members: [
      { id: 'system2', name: 'Karan (Host)', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', isMuted: false, volume: 100 },
      { id: 'u_4', name: 'RoHitman45', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', isMuted: false, volume: 90, isSpeaking: true }
    ]
  }
];

const INITIAL_CHAT_MESSAGES: { [roomId: string]: ChatMessage[] } = {
  'room_csk_super': [
    { id: 'm_1', roomId: 'room_csk_super', userId: 'u_1', userName: 'DhoniFan7', userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', content: 'What a delivery by Bumrah though... unbelievable yorker', type: 'text', timestamp: '14:46' },
    { id: 'm_2', roomId: 'room_csk_super', userId: 'system', userName: 'Suresh (Host)', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', content: 'DUBE is in the middle now! Time for some massive maximums 💛', type: 'text', timestamp: '14:47' },
    { id: 'm_3', roomId: 'room_csk_super', userId: 'u_2', userName: 'RaviCSK', userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', content: '🔥', type: 'emoji-burst', timestamp: '14:48' }
  ],
  'room_wankhede': [
    { id: 'm_4', roomId: 'room_wankhede', userId: 'u_4', userName: 'RoHitman45', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', content: 'BUMRAH GETS THE CAPTAIN! Game over for CSK!', type: 'text', timestamp: '14:47' }
  ]
};

const INITIAL_FAN_POSTS: FanPost[] = [
  {
    id: 'f_1',
    userId: 'mi_supporter',
    userName: 'KunalMI',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    matchId: 'csk_vs_mi_2026',
    teamSide: 'B', // MI
    type: 'text',
    content: '5 IPL trophies speak for themselves. Chasing at Wankhede vs Bumrah is CSK’s worst nightmare! #Paltan',
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

const INITIAL_WALLET = {
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

// --- RETRIEVE STATE ACTIVE IN STORAGE OR FALLBACKS ---
let matchState = getJSON<Match>('pitchside_matchState', INITIAL_MATCH);
let commentaryFeed = getJSON<Commentary[]>('pitchside_commentaryFeed', INITIAL_COMMENTARY);
let watchRooms = getJSON<WatchRoom[]>('pitchside_watchRooms', INITIAL_WATCH_ROOMS);
let chatMessages = getJSON<{ [roomId: string]: ChatMessage[] }>('pitchside_chatMessages', INITIAL_CHAT_MESSAGES);
let fanPosts = getJSON<FanPost[]>('pitchside_fanPosts', INITIAL_FAN_POSTS);
let userWallet = getJSON<typeof INITIAL_WALLET>('pitchside_userWallet', INITIAL_WALLET);
let activeBets = getJSON<Bet[]>('pitchside_activeBets', []);

// Function to helper-propagate state to localStorage
const persistAll = () => {
  saveJSON('pitchside_matchState', matchState);
  saveJSON('pitchside_commentaryFeed', commentaryFeed);
  saveJSON('pitchside_watchRooms', watchRooms);
  saveJSON('pitchside_chatMessages', chatMessages);
  saveJSON('pitchside_fanPosts', fanPosts);
  saveJSON('pitchside_userWallet', userWallet);
  saveJSON('pitchside_activeBets', activeBets);
};

// --- SIMULATED REAL-TIME CRICKET ENGINE TICKER ---
let deliveryCounter = 0;
const startSimulatedTicker = () => {
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
    const roll = Math.random();
    let outcome = '1';
    let scoreAdd = 0;
    let wicketAdd = 0;
    let eventType: Commentary['eventType'] = 'runs';
    let commentaryText = '';

    const activeStriker = matchState.batsmen[0];
    const activeNonStriker = matchState.batsmen[1];
    const bowler = matchState.currentBowler;

    if (roll < 0.35) {
      outcome = '0';
      eventType = 'dot';
      scoreAdd = 0;
      activeStriker.balls += 1;
      commentaryText = `${bowler.name} to ${activeStriker.name}, no run, excellent dot ball! Sneaks through past the probing defensive push.`;
    } else if (roll < 0.65) {
      outcome = '1';
      eventType = 'runs';
      scoreAdd = 1;
      activeStriker.runs += 1;
      activeStriker.balls += 1;
      commentaryText = `${bowler.name} to ${activeStriker.name}, 1 run, guided gently down to third-man to turn the strike over.`;
      // Rotate strike
      matchState.batsmen = [activeNonStriker, activeStriker];
    } else if (roll < 0.73) {
      outcome = '2';
      eventType = 'runs';
      scoreAdd = 2;
      activeStriker.runs += 2;
      activeStriker.balls += 1;
      commentaryText = `${bowler.name} to ${activeStriker.name}, 2 runs, clipped off the pads with absolute wrist-perfection, sprinting back for the second.`;
    } else if (roll < 0.83) {
      outcome = '4';
      eventType = 'boundary';
      scoreAdd = 4;
      activeStriker.runs += 4;
      activeStriker.balls += 1;
      activeStriker.fours += 1;
      commentaryText = `${bowler.name} to ${activeStriker.name}, FOUR! Cracking shot! Dispatched with sheer disdain through the extra-cover boundary!`;
    } else if (roll < 0.90) {
      outcome = '6';
      eventType = 'six';
      scoreAdd = 6;
      activeStriker.runs += 6;
      activeStriker.balls += 1;
      activeStriker.sixes += 1;
      commentaryText = `${bowler.name} to ${activeStriker.name}, SIX! OUT OF THE GROUND! Elevated high into the night sky, clearing the long-on stands effortlessly! Majestic connection!`;
    } else if (roll < 0.96) {
      outcome = 'W';
      eventType = 'wicket';
      scoreAdd = 0;
      wicketAdd = 1;
      activeStriker.balls += 1;
      commentaryText = `${bowler.name} to ${activeStriker.name}, OUT! WICKET! Caught at deep mid-wicket! He went for another massive launch, got more height than distance, and is safely bagged under the lights! Outstanding catch!`;
      
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
      // Overs don't advance for wide
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

      if (matchState.runs >= matchState.target) {
        matchState.status = 'completed';
        commentaryText = `MATCH COMPLETED! Chennai Super Kings pull off a phenomenal run chase at Wankhede! Celebrating Whistle Podu Style 💛!`;
      } else if (remainingBalls <= 0 || matchState.wickets >= 10) {
        matchState.status = 'completed';
        commentaryText = `MATCH COMPLETED! Mumbai Indians defend successfully! Phenomenal final death overs defense by Bumrah! Blue flag flies high! 💙`;
      }
    }

    matchState.batsmen.forEach(b => {
      b.strikeRate = b.balls > 0 ? parseFloat(((b.runs / b.balls) * 100).toFixed(2)) : 0;
    });
    
    bowler.economy = bowler.overs > 0 ? parseFloat((bowler.runs / bowler.overs).toFixed(2)) : 0;

    // Slide last 5 balls
    matchState.lastFiveBalls.push(outcome);
    if (matchState.lastFiveBalls.length > 5) {
      matchState.lastFiveBalls.shift();
    }

    // Adjust prediction probability sways
    let probSway = (Math.random() - 0.5) * 6;
    if (outcome === '6' || outcome === '4') probSway += 5;
    if (outcome === 'W') probSway -= 12;
    matchState.winProbability.teamA = Math.max(5, Math.min(95, Math.round(matchState.winProbability.teamA + probSway)));
    matchState.winProbability.teamB = 100 - matchState.winProbability.teamA;

    // Insert commentator item
    const newComm: Commentary = {
      id: `c_dyn_${Date.now()}`,
      ballNumber: matchState.overs.toFixed(1),
      eventType,
      description: commentaryText,
      emojiReactions: { '🔥': (outcome === '6' || outcome === 'W' ? 120 : 15), '💀': (outcome === 'W' ? 240 : 2), '👏': 30 },
      timestamp: new Date().toISOString().split('T')[1].substring(0, 5) + 'Z'
    };
    commentaryFeed.unshift(newComm);
    if (commentaryFeed.length > 40) commentaryFeed.pop();

    // 3. Resolve Placed Bets In-Memory Live!
    activeBets = activeBets.map(bet => {
      if (bet.status !== 'pending') return bet;

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
          userWallet.transactions.unshift({
            id: `w_win_${Date.now()}`,
            type: 'win',
            amount: winAmount,
            referenceId: `WIN-PAYOUT-${bet.id}`,
            created_at: new Date().toISOString()
          });
        }
        return { ...bet, status, settledAt: new Date().toISOString() };
      }
      return bet;
    });

    // 4. Simulate other chat fans writing jokes or reacting
    deliveryCounter++;
    if (deliveryCounter % 3 === 0) {
      const roomIds = ['room_csk_super', 'room_wankhede'];
      const comments = {
        'room_csk_super': [
          "Dube goes down town! What a clean hitting arc!",
          "If MS Dhoni comes in next, Wankhede decibel level is going through the roof!",
          "Jadeja needs to rotate strikes cleanly here.",
          "Yellow wave in full force 💛 Whistle Podu!",
          "What an outstanding game of cricket! Nail biting stuff."
        ],
        'room_wankhede': [
          "Bumrah is an absolute god! That yorker was unplayable.",
          "Hardik needs to bowl slow bouncers on this track.",
          "Come on MI! Defend this like champions 💙",
          "One wicket here and we seal the match for Paltan!",
          "Dube is finding it difficult to time Bumrah's off-cutters."
        ]
      };
      const users = [
        { name: 'DhoniFan99', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
        { name: 'RaviCSK_Guru', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100' },
        { name: 'RoHitmanPaltan', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }
      ];

      roomIds.forEach(roomId => {
        const pool = comments[roomId as keyof typeof comments];
        const randomText = pool[Math.floor(Math.random() * pool.length)];
        const randomUser = users[Math.floor(Math.random() * users.length)];

        if (!chatMessages[roomId]) chatMessages[roomId] = [];
        chatMessages[roomId].push({
          id: `m_sim_${Date.now()}`,
          roomId,
          userId: `sim_${Math.random()}`,
          userName: randomUser.name,
          userAvatar: randomUser.avatar,
          content: randomText,
          type: 'text',
          timestamp: new Date().toISOString().split('T')[1].substring(0, 5)
        });
        if (chatMessages[roomId].length > 40) chatMessages[roomId].shift();
      });
    }

    persistAll();
  }, 5000);
};

// Start simulation immediately on file load
if (typeof window !== 'undefined') {
  startSimulatedTicker();
}


// --- INTERCEPT WINDOW.FETCH INTERFACE ---
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;

  const mockFetch = async function (this: any, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlString = input.toString();

    // Check if the URL is an internal API endpoint
    if (urlString.includes('/api/')) {
      // Small helper to yield JSON responses
      const makeResponse = (data: any, status: number = 200) => {
        return new Response(JSON.stringify(data), {
          status,
          headers: { 'Content-Type': 'application/json' }
        });
      };

      try {
        // --- 1. MATCH STATE ---
        if (urlString.endsWith('/api/match-state') || urlString.endsWith('/api/live-state')) {
          return makeResponse({ match: matchState });
        }

        // --- 2. COMMENTARY ---
        if (urlString.endsWith('/api/commentary')) {
          return makeResponse({ commentary: commentaryFeed });
        }

        if (urlString.includes('/api/commentary/react')) {
          const body = JSON.parse(init?.body as string || '{}');
          const { commentaryId, emoji } = body;
          const comm = commentaryFeed.find(c => c.id === commentaryId);
          if (comm) {
            comm.emojiReactions[emoji] = (comm.emojiReactions[emoji] || 0) + 1;
            persistAll();
            return makeResponse({ success: true, reactions: comm.emojiReactions });
          }
          return makeResponse({ error: 'Commentary item not found' }, 404);
        }

        // --- 3. WATCH ROOMS ---
        if (urlString.endsWith('/api/rooms')) {
          if (init?.method === 'POST') {
            const body = JSON.parse(init?.body as string || '{}');
            const { name, isPrivate, bettingEnabled, maxMembers } = body;
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
              inviteLink: `${window.location.origin}/room/${generatedId}`,
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
                content: `Welcome to the watch room! Share the invite code ${inviteCode} with your friends to join the voice audio and wagers. Defend your team!`,
                type: 'text',
                timestamp: new Date().toLocaleTimeString().substring(0, 5)
              }
            ];
            persistAll();
            return makeResponse({ success: true, room: newRoom });
          }
          return makeResponse({ rooms: watchRooms });
        }

        // Room Detail fetch
        const roomMatch = urlString.match(/\/api\/rooms\/([a-zA-Z0-9_\-]+)$/);
        if (roomMatch) {
          const roomId = roomMatch[1];
          const room = watchRooms.find(r => r.id === roomId);
          if (!room) return makeResponse({ error: 'Room not found' }, 404);
          return makeResponse({ room, chats: chatMessages[roomId] || [] });
        }

        // Room Chats post
        const roomChatMatch = urlString.match(/\/api\/rooms\/([a-zA-Z0-9_\-]+)\/chats$/);
        if (roomChatMatch) {
          const roomId = roomChatMatch[1];
          const body = JSON.parse(init?.body as string || '{}');
          const { content, type, user } = body;
          
          const newMsg: ChatMessage = {
            id: `m_${Date.now()}`,
            roomId,
            userId: user?.id || 'current_user',
            userName: user?.name || 'You',
            userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
            content: content || '',
            type: type || 'text',
            timestamp: new Date().toLocaleTimeString().substring(0, 5)
          };

          if (!chatMessages[roomId]) chatMessages[roomId] = [];
          chatMessages[roomId].push(newMsg);
          persistAll();
          return makeResponse({ success: true, message: newMsg });
        }

        // Room Poll Creation
        const roomPollsMatch = urlString.match(/\/api\/rooms\/([a-zA-Z0-9_\-]+)\/polls$/);
        if (roomPollsMatch) {
          const roomId = roomPollsMatch[1];
          const body = JSON.parse(init?.body as string || '{}');
          const { question, option1, option2 } = body;
          const room = watchRooms.find(r => r.id === roomId);
          if (!room) return makeResponse({ error: 'Room not found' }, 404);

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
          persistAll();
          return makeResponse({ success: true, poll: room.poll });
        }

        // Room Poll voting
        const roomVoteMatch = urlString.match(/\/api\/rooms\/([a-zA-Z0-9_\-]+)\/polls\/vote$/);
        if (roomVoteMatch) {
          const roomId = roomVoteMatch[1];
          const body = JSON.parse(init?.body as string || '{}');
          const { optionId, userId } = body;
          const room = watchRooms.find(r => r.id === roomId);
          
          if (!room) return makeResponse({ error: 'Room not found' }, 404);
          if (!room.poll) return makeResponse({ error: 'No active poll' }, 400);

          if (!room.poll.userVotes) room.poll.userVotes = {};
          if (room.poll.userVotes[userId]) return makeResponse({ error: 'Already voted!' }, 400);

          const opt = room.poll.options.find(o => o.id === optionId);
          if (opt) {
            opt.votes += 1;
            room.poll.totalVotes += 1;
            room.poll.userVotes[userId] = optionId;
            persistAll();
            return makeResponse({ success: true, poll: room.poll });
          }
          return makeResponse({ error: 'Option not found' }, 400);
        }

        // Room Bets integration
        const roomBetMatch = urlString.match(/\/api\/rooms\/([a-zA-Z0-9_\-]+)\/bets$/);
        if (roomBetMatch) {
          const roomId = roomBetMatch[1];
          const body = JSON.parse(init?.body as string || '{}');
          const { category, question, option, amount, odds } = body;
          
          if (!userWallet.ageVerified) {
            return makeResponse({ error: 'Age verification required! You must be 18+ to predict wagers.' }, 400);
          }
          if (userWallet.balance < amount) {
            return makeResponse({ error: 'Insufficient wallet balance. Top up inside Wallet tab!' }, 400);
          }
          if (amount < 10) {
            return makeResponse({ error: 'Minimum bet amount is ₹10.' }, 400);
          }

          // Deduct from wallet instantly
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
            roomId,
            question,
            category,
            option,
            amount,
            odds,
            status: 'pending',
            ballTarget: matchState.overs.toFixed(1)
          };
          activeBets.unshift(newBet);
          persistAll();
          return makeResponse({ success: true, bet: newBet, walletBalance: userWallet.balance });
        }

        // GET all bets
        if (urlString.endsWith('/api/bets')) {
          return makeResponse({ bets: activeBets });
        }

        // --- 4. FAN WAR TIMELINES ---
        if (urlString.endsWith('/api/fan-war')) {
          return makeResponse({ posts: fanPosts });
        }

        if (urlString.endsWith('/api/fan-war/post')) {
          const body = JSON.parse(init?.body as string || '{}');
          const { content, type, teamSide, imageUrl, pollData } = body;

          const newPost: FanPost = {
            id: `f_${Date.now()}`,
            userId: 'current_user',
            userName: body.userName || 'You',
            userAvatar: body.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
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
          persistAll();
          return makeResponse({ success: true, post: newPost });
        }

        if (urlString.endsWith('/api/fan-war/react')) {
          const body = JSON.parse(init?.body as string || '{}');
          const { postId, reactionType } = body;
          const post = fanPosts.find(p => p.id === postId);
          if (post) {
            const rx = reactionType as 'lit' | 'facts' | 'lol' | 'cap';
            post.reactions[rx] = (post.reactions[rx] || 0) + 1;
            post.userReaction = rx;
            persistAll();
            return makeResponse({ success: true, reactions: post.reactions });
          }
          return makeResponse({ error: 'Post not found' }, 404);
        }

        if (urlString.endsWith('/api/fan-war/reply')) {
          const body = JSON.parse(init?.body as string || '{}');
          const { postId, content, user } = body;
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
            persistAll();
            return makeResponse({ success: true, replies: post.replies });
          }
          return makeResponse({ error: 'Post not found' }, 404);
        }

        // --- 5. WALLET STYSTEM ---
        if (urlString.endsWith('/api/user-wallet')) {
          return makeResponse({ wallet: userWallet });
        }

        if (urlString.endsWith('/api/wallet/topup')) {
          const body = JSON.parse(init?.body as string || '{}');
          const { amount } = body;
          userWallet.balance += Number(amount) || 100;
          userWallet.transactions.unshift({
            id: `w_top_${Date.now()}`,
            type: 'topup',
            amount: Number(amount),
            referenceId: `UPI-TOP-${Math.floor(Math.random() * 900000 + 100000)}`,
            created_at: new Date().toISOString()
          });
          persistAll();
          return makeResponse({ success: true, balance: userWallet.balance, transactions: userWallet.transactions });
        }

        if (urlString.endsWith('/api/wallet/withdraw')) {
          const body = JSON.parse(init?.body as string || '{}');
          const { amount } = body;
          if (!userWallet.kycVerified) {
            return makeResponse({ error: 'KYC Verification (PAN & Aadhaar) required before withdrawals! Secure your profile first.' }, 400);
          }
          if (amount < 100) {
            return makeResponse({ error: 'Minimum withdraw limit is ₹100.' }, 400);
          }
          if (userWallet.balance < amount) {
            return makeResponse({ error: 'Insufficient balance currently available.' }, 400);
          }

          userWallet.balance -= Number(amount);
          userWallet.transactions.unshift({
            id: `w_out_${Date.now()}`,
            type: 'withdrawal',
            amount: Number(amount),
            referenceId: `UPI-WITH-${Math.floor(Math.random() * 900000 + 100000)}`,
            created_at: new Date().toISOString()
          });
          persistAll();
          return makeResponse({ success: true, balance: userWallet.balance, transactions: userWallet.transactions });
        }

        if (urlString.endsWith('/api/wallet/verify-kyc')) {
          const body = JSON.parse(init?.body as string || '{}');
          const { aadhaar, pan, ageChecked } = body;
          if (!aadhaar || !pan) {
            return makeResponse({ error: 'Aadhaar (12 digits) and PAN card coordinates are mandatory.' }, 400);
          }
          userWallet.kycVerified = true;
          userWallet.kycAadhaar = aadhaar;
          userWallet.kycPan = pan;
          userWallet.ageVerified = !!ageChecked;
          persistAll();
          return makeResponse({ success: true, wallet: userWallet });
        }

        if (urlString.endsWith('/api/wallet/limits')) {
          const body = JSON.parse(init?.body as string || '{}');
          userWallet.dailyLossLimit = Number(body.dailyLossLimit) || 1000;
          persistAll();
          return makeResponse({ success: true, wallet: userWallet });
        }

        // --- 6. AI ANALYSIS WITH GEMINI FALLBACKS ---
        if (urlString.endsWith('/api/ai/analyze-match')) {
          // Provide ultra clever analytical text that sounds extremely human like Harsha Bhogle style
          const customAnalyses = [
            `🏏 **PitchSide AI Analyst report [Ball Over ${matchState.overs.toFixed(1)}]** 🏏\n\n**1. High-Octane Turf War:** Shivam Dube is absolutely clobbering the spinners today, displaying massive extension and down-ground vertical swings! However, Jasprit Bumrah is steaming in, throwing down 148kph laser guided deliveries that look absolute toe-crushing. That historic yorker to clean-bowl Ruturaj Gaikwad indicates Mumbai Indians Paltan isn't backing off even a millimeter.\n\n**2. Yellow and Blue Stadium Battle:** CSK Whistle Podu fans are whistling like crazy in Wankhede stands, while MI Paltan is roaring with classic 'Rohit-Rohit' chants! On the PitchSide Fan War boards, CSK fans are highly optimistic while MI supporters are laughing at the target. Sways are completely chaotic!\n\n**3. Death Overs Expert Forecast:** With MS Dhoni sitting ready in the padding dugout, CSK has incredible ice-cool confidence. But if Bumrah continues his perfect yorker lengths, MI will suffocate CSK inside the death window. We project CSK chasing 12 required off the final over! Absolute thriller card! Grab your popcorn!`,
            `🏏 **PitchSide AI Analyst report [Ball Over ${matchState.overs.toFixed(1)}]** 🏏\n\n**1. Gladiator Combat:** The batsman is finding it difficult to gauge the late off-cutting shape sent down by bowler. A lovely slower-ball mixture has slowed the boundaries, forcing Ravindra Jadeja to slide deep back in his batting stance. Wankhede remains pristine, true bounce but with a subtle friction that is helping spinners.\n\n**2. Fan War Allegiances:** Blue flag has elevated since wickets are ticking! MI supporters are claiming complete tactical supremacy, writing lit posts about Bumrah's economy rates. Yellow supporters are spamming the live chat counters claiming 'Thala' is enough to complete the run-chase comfortably!\n\n**3. Bulletproof Death Over Guess:** 42 required off the last 4 overs feels like standard CSK territory, but Gerald Coetzee's raw express pace is yet to finish. If CSK can extract 15 runs from the upcoming 17th over, the momentum will completely break MI`
          ];
          const chosen = customAnalyses[Math.floor(Math.random() * customAnalyses.length)];
          return makeResponse({ summary: chosen });
        }

        // Catch-all mock API response
        return makeResponse({ mock: true });
      } catch (e: any) {
        return makeResponse({ error: e.message || 'Internal Mock Server Error' }, 500);
      }
    }

    // Pass through non-API system fetches (like assets, bundle files, css)
    return originalFetch.apply(this, arguments as any);
  };

  try {
    Object.defineProperty(window, 'fetch', {
      value: mockFetch,
      writable: true,
      configurable: true,
      enumerable: true
    });
  } catch (err) {
    console.debug('Could not define fetch on window, trying Window.prototype...', err);
    try {
      Object.defineProperty(Window.prototype, 'fetch', {
        value: mockFetch,
        writable: true,
        configurable: true,
        enumerable: true
      });
    } catch (err2) {
      console.debug('Could not define fetch on Window.prototype, trying globalThis...', err2);
      try {
        (globalThis as any).fetch = mockFetch;
      } catch (err3) {
        console.error('All mock-fetch interception techniques failed!', err3);
      }
    }
  }
}
