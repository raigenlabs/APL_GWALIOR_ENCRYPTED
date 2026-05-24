/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Player {
  id: string;
  name: string;
  team: 'CSK' | 'MI';
  photo: string;
  role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
  runsThisSeason: number;
  wicketsThisSeason: number;
  strikeRate: number;
  economy: number;
  recentForm: number[]; // Last 5 matches scores or wickets
  fantasyPoints: number;
  impactScore: number;
}

export const PLAYERS: Player[] = [
  // Chennai Super Kings
  {
    id: 'csk_1',
    name: 'Ruturaj Gaikwad',
    team: 'CSK',
    photo: 'https://images.unsplash.com/photo-1540747737956-378724044432?w=150&auto=format&fit=crop&q=60',
    role: 'Batsman',
    runsThisSeason: 583,
    wicketsThisSeason: 0,
    strikeRate: 141.2,
    economy: 0,
    recentForm: [42, 67, 108, 32, 54],
    fantasyPoints: 642,
    impactScore: 84
  },
  {
    id: 'csk_2',
    name: 'MS Dhoni',
    team: 'CSK',
    photo: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=150&auto=format&fit=crop&q=60',
    role: 'Wicketkeeper',
    runsThisSeason: 161,
    wicketsThisSeason: 0,
    strikeRate: 224.6,
    economy: 0,
    recentForm: [28, 5, 20, 37, 12],
    fantasyPoints: 310,
    impactScore: 92
  },
  {
    id: 'csk_3',
    name: 'Shivam Dube',
    team: 'CSK',
    photo: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=150&auto=format&fit=crop&q=60',
    role: 'All-rounder',
    runsThisSeason: 396,
    wicketsThisSeason: 3,
    strikeRate: 162.4,
    economy: 9.2,
    recentForm: [66, 12, 51, 18, 44],
    fantasyPoints: 498,
    impactScore: 81
  },
  {
    id: 'csk_4',
    name: 'Ravindra Jadeja',
    team: 'CSK',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
    role: 'All-rounder',
    runsThisSeason: 225,
    wicketsThisSeason: 11,
    strikeRate: 135.5,
    economy: 7.32,
    recentForm: [31, 15, 43, 2, 19],
    fantasyPoints: 585,
    impactScore: 86
  },
  {
    id: 'csk_5',
    name: 'Matheesha Pathirana',
    team: 'CSK',
    photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=60',
    role: 'Bowler',
    runsThisSeason: 0,
    wicketsThisSeason: 18,
    strikeRate: 0,
    economy: 7.68,
    recentForm: [2, 3, 1, 4, 2],
    fantasyPoints: 540,
    impactScore: 89
  },
  {
    id: 'csk_6',
    name: 'Rachin Ravindra',
    team: 'CSK',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    role: 'Batsman',
    runsThisSeason: 312,
    wicketsThisSeason: 1,
    strikeRate: 158.9,
    economy: 8.5,
    recentForm: [12, 45, 0, 61, 23],
    fantasyPoints: 420,
    impactScore: 78
  },
  {
    id: 'csk_7',
    name: 'Daryl Mitchell',
    team: 'CSK',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60',
    role: 'Batsman',
    runsThisSeason: 281,
    wicketsThisSeason: 1,
    strikeRate: 132.4,
    economy: 10.0,
    recentForm: [11, 52, 24, 63, 1],
    fantasyPoints: 345,
    impactScore: 71
  },
  {
    id: 'csk_8',
    name: 'Deepak Chahar',
    team: 'CSK',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=60',
    role: 'Bowler',
    runsThisSeason: 15,
    wicketsThisSeason: 7,
    strikeRate: 110,
    economy: 8.45,
    recentForm: [1, 0, 2, 0, 1],
    fantasyPoints: 232,
    impactScore: 68
  },

  // Mumbai Indians
  {
    id: 'mi_1',
    name: 'Rohit Sharma',
    team: 'MI',
    photo: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=60',
    role: 'Batsman',
    runsThisSeason: 417,
    wicketsThisSeason: 0,
    strikeRate: 151.6,
    economy: 0,
    recentForm: [105, 36, 6, 49, 19],
    fantasyPoints: 504,
    impactScore: 82
  },
  {
    id: 'mi_2',
    name: 'Suryakumar Yadav',
    team: 'MI',
    photo: 'https://images.unsplash.com/photo-1618015358954-115ef1ed6515?w=150&auto=format&fit=crop&q=60',
    role: 'Batsman',
    runsThisSeason: 382,
    wicketsThisSeason: 0,
    strikeRate: 168.3,
    economy: 0,
    recentForm: [78, 0, 102, 26, 56],
    fantasyPoints: 486,
    impactScore: 88
  },
  {
    id: 'mi_3',
    name: 'Jasprit Bumrah',
    team: 'MI',
    photo: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&auto=format&fit=crop&q=60',
    role: 'Bowler',
    runsThisSeason: 12,
    wicketsThisSeason: 21,
    strikeRate: 85,
    economy: 6.48,
    recentForm: [3, 1, 2, 3, 5],
    fantasyPoints: 690,
    impactScore: 96
  },
  {
    id: 'mi_4',
    name: 'Hardik Pandya',
    team: 'MI',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60',
    role: 'All-rounder',
    runsThisSeason: 216,
    wicketsThisSeason: 11,
    strikeRate: 143.2,
    economy: 9.87,
    recentForm: [10, 46, 2, 34, 15],
    fantasyPoints: 452,
    impactScore: 76
  },
  {
    id: 'mi_5',
    name: 'Tilak Varma',
    team: 'MI',
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=60',
    role: 'Batsman',
    runsThisSeason: 436,
    wicketsThisSeason: 0,
    strikeRate: 144.5,
    recentForm: [34, 65, 20, 16, 52],
    fantasyPoints: 532,
    impactScore: 80,
    economy: 0
  },
  {
    id: 'mi_6',
    name: 'Ishan Kishan',
    team: 'MI',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60',
    role: 'Wicketkeeper',
    runsThisSeason: 320,
    wicketsThisSeason: 0,
    strikeRate: 148.8,
    economy: 0,
    recentForm: [0, 42, 69, 8, 20],
    fantasyPoints: 412,
    impactScore: 74
  },
  {
    id: 'mi_7',
    name: 'Tim David',
    team: 'MI',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60',
    role: 'Batsman',
    runsThisSeason: 241,
    wicketsThisSeason: 0,
    strikeRate: 172.1,
    economy: 0,
    recentForm: [45, 17, 34, 1, 21],
    fantasyPoints: 312,
    impactScore: 72
  },
  {
    id: 'mi_8',
    name: 'Gerald Coetzee',
    team: 'MI',
    photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=60',
    role: 'Bowler',
    runsThisSeason: 5,
    wicketsThisSeason: 13,
    strikeRate: 50,
    economy: 9.35,
    recentForm: [1, 2, 0, 3, 2],
    fantasyPoints: 325,
    impactScore: 70
  }
];

export interface MatchupRecord {
  batsmanName: string;
  bowlerName: string;
  ballsFaced: number;
  runsScored: number;
  dismissals: number;
  strikeRate: number;
}

export const MATCHUPS: MatchupRecord[] = [
  {
    batsmanName: 'Rohit Sharma',
    bowlerName: 'Ravindra Jadeja',
    ballsFaced: 112,
    runsScored: 124,
    dismissals: 4,
    strikeRate: 110.7
  },
  {
    batsmanName: 'Suryakumar Yadav',
    bowlerName: 'Ravindra Jadeja',
    ballsFaced: 52,
    runsScored: 74,
    dismissals: 1,
    strikeRate: 142.3
  },
  {
    batsmanName: 'Ruturaj Gaikwad',
    bowlerName: 'Jasprit Bumrah',
    ballsFaced: 45,
    runsScored: 51,
    dismissals: 2,
    strikeRate: 113.3
  },
  {
    batsmanName: 'Shivam Dube',
    bowlerName: 'Jasprit Bumrah',
    ballsFaced: 31,
    runsScored: 28,
    dismissals: 3,
    strikeRate: 90.3
  },
  {
    batsmanName: 'MS Dhoni',
    bowlerName: 'Jasprit Bumrah',
    ballsFaced: 62,
    runsScored: 60,
    dismissals: 3,
    strikeRate: 96.8
  }
];

export const HIGHLIGHTS_VIDEO = [
  {
    id: 'h1',
    title: 'MS Dhoni Hits Three Consecutive Sixes off Hardik Pandya!',
    duration: '2:15',
    likes: 12400,
    views: '1.2M',
    thumbnail: 'https://images.unsplash.com/photo-1540747737956-378724044432?w=500&auto=format&fit=crop&q=60',
    source: 'JioCinema Embed',
    summary: 'The Wankhede went absolute ballistic. Dhoni hit the first over long-off, the second with a beautiful helicopter wrist flick, and the third flat over cow-corner.'
  },
  {
    id: 'h2',
    title: 'Jasprit Bumrah’s Lethal 5-Wicket Haul against CSK',
    duration: '4:10',
    likes: 9800,
    views: '850K',
    thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60',
    source: 'IPL T20 official YouTube',
    summary: 'An administrative masterclass in toe-crushing yorkers and slow off-cutters. Clean bowled Sh शिवम Dube and trapped Gaikwad LBW in a single spell.'
  },
  {
    id: 'h3',
    title: 'Ruturaj Gaikwad’s Sparkling 108* off 60 Balls',
    duration: '3:45',
    likes: 15400,
    views: '2.4M',
    thumbnail: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500&auto=format&fit=crop&q=60',
    source: 'Star Sports Clip',
    summary: 'A sublime display of elegant inside-out cover drives and lofted straight drives. Reached his centenary in 56.4 overs with a boundary.'
  }
];
