/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MatchStatus = 'live' | 'upcoming' | 'completed';

export interface BatsmanState {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
}

export interface BowlerState {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface Match {
  id: string;
  teamA: string;
  teamALogo: string;
  teamB: string;
  teamBLogo: string;
  teamAAbbr: string;
  teamBAbbr: string;
  teamAColor: string;
  teamBColor: string;
  runs: number;
  wickets: number;
  overs: number; // e.g., 14.3
  target?: number;
  currentInnings: 1 | 2;
  currentInningsTeam: 'teamA' | 'teamB';
  crr: number;
  rrr?: number;
  status: MatchStatus;
  batsmen: BatsmanState[];
  currentBowler: BowlerState;
  lastFiveBalls: string[]; // ['1', '4', 'W', 'Wd', '0']
  partnership: {
    runs: number;
    balls: number;
  };
  projectedScore: {
    atCurrent: number;
    atSix: number;
    atEight: number;
    atTen: number;
  };
  winProbability: {
    teamA: number; // percentage
    teamB: number; // percentage
  };
  oversTimeline: {
    over: number;
    teamAProb: number;
  }[];
  pitchReport: {
    condition: string; // "Balanced", "Pace friendly", "Spin friendly"
    temperature: number;
    humidity: number;
    avgScore: number;
  };
}

export interface Commentary {
  id: string;
  ballNumber: string; // e.g., "14.3"
  eventType: 'dot' | 'runs' | 'boundary' | 'six' | 'wicket' | 'wide' | 'noball' | 'milestone';
  description: string;
  emojiReactions: { [emoji: string]: number };
  timestamp: string;
}

export interface WatchRoom {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  matchId: string;
  inviteCode: string;
  isPrivate: boolean;
  bettingEnabled: boolean;
  maxMembers: number;
  inviteLink: string;
  members: {
    id: string;
    name: string;
    avatar: string;
    isMuted: boolean;
    volume: number;
    isSpeaking?: boolean;
    latencyMs?: number;
  }[];
  poll?: {
    id: string;
    question: string;
    options: { id: string; label: string; votes: number }[];
    totalVotes: number;
    userVotes?: { [userId: string]: string }; // userId -> optionId
  };
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  type: 'text' | 'gif' | 'emoji-burst';
  timestamp: string;
}

export interface Bet {
  id: string;
  userId: string;
  roomId: string;
  question: string;
  category: string; // 'next-ball' | 'over-runs' | 'next-wicket' | 'winner'
  option: string;
  amount: number;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  settledAt?: string;
  ballTarget?: string; // the ball index/over it was placed on
}

export interface FanPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  matchId: string;
  teamSide: 'A' | 'B' | 'neutral';
  type: 'text' | 'meme' | 'poll' | 'prediction' | 'stat-flex';
  content: string;
  imageUrl?: string;
  verifiedFan: boolean;
  created_at: string;
  pollData?: {
    question: string;
    options: { label: string; votes: number }[];
    votedOption?: number;
  };
  predictionData?: {
    text: string;
    isCorrect?: boolean;
    karmaAwarded?: number;
  };
  reactions: {
    lit: number;
    facts: number;
    lol: number;
    cap: number;
  };
  replies: {
    id: string;
    userName: string;
    userAvatar: string;
    content: string;
    created_at: string;
  }[];
  userReaction?: 'lit' | 'facts' | 'lol' | 'cap';
}

export interface WalletTransaction {
  id: string;
  type: 'topup' | 'bet' | 'win' | 'withdrawal';
  amount: number;
  referenceId: string;
  created_at: string;
}

export interface UserState {
  id: string;
  name: string;
  email: string;
  avatar: string;
  walletBalance: number;
  teamPreference: 'CSK' | 'MI' | 'neutral';
  karma: number;
  badges: string[];
  dailyLossLimit: number;
  sessionTimeMs: number;
  kycVerified: boolean;
  kycAadhaar: string;
  kycPan: string;
  ageVerified: boolean;
}
