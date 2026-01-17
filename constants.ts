
import { SignalLevel, Mission } from './types';

export const GLOBAL_COMMIT_LIMITS = {
  MIN: 0.01,
  MAX: 10.0 
};

// Mocking presale end time to 24 hours from now for the demo
export const PRESALE_END_TIME = Date.now() + 24 * 60 * 60 * 1000;

export const TOKENOMICS = {
  TOTAL_SUPPLY: 1000000000,
  PRESALE_POOL_PERCENT: 45,
  LIQUIDITY_POOL_PERCENT: 25,
  COMMUNITY_FUND_PERCENT: 20,
  COMMUNITY_UNLOCK: "3 Months Cliff",
  PRESALE_TOKENS: 450000000,
  SIMULATED_POOL_CAP_SOL: 15000 
};

export const PRESALE_CONFIG = {
  RECEIVE_WALLET: "MonkyMaker777PresaleWalletAddressXYZ",
  MIN_CONTRIBUTION: 0.01,
  MAX_CONTRIBUTION: 10.0
};

export const SOCIAL_LINKS = {
  MONKY_MAKER: "https://x.com/monkymakereth",
  MONKY_FUN: "https://x.com/monky_fun",
  MONKY_TELEGRAM: "https://t.me/monky_fun",
  RAID_TWEET: "https://x.com/monkymakereth/status/2012515426149036181?s=46" // Placeholder for actual raid
};

export const AIRDROP_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Follow @monkymaker',
    description: 'Join our primary X channel for signal updates.',
    points: 50,
    category: 'SOCIAL',
    icon: '🐦',
    frequency: 'ONCE'
  },
  {
    id: 'm2',
    title: 'Daily GMONKY',
    description: 'Post "GMONKY @monkymaker" on your timeline every day.',
    points: 10,
    category: 'DAILY',
    icon: '☀️',
    frequency: 'DAILY'
  },
  {
    id: 'm3',
    title: 'Raid New Signal',
    description: 'Like, RT, and comment on any new post. Farmable!',
    points: 20,
    category: 'SOCIAL',
    icon: '🔥',
    frequency: 'UNLIMITED'
  },
  {
    id: 'm4',
    title: 'Jungle Meme Farm',
    description: 'Post an original meme tagging @monkymaker. Unlimited rewards.',
    points: 40,
    category: 'CONTENT',
    icon: '🍌',
    frequency: 'UNLIMITED'
  }
];

export const TIERS_POINTS = [
  { min: 0, label: 'BRONZE', color: 'text-orange-800' },
  { min: 100, label: 'SILVER', color: 'text-gray-400' },
  { min: 500, label: 'GOLD', color: 'text-yellow-500' },
  { min: 1500, label: 'DIAMOND', color: 'text-cyan-400 animate-pulse' }
];

export const TIERS = [
  { min: 0, label: 'BRONZE', color: 'text-orange-800' },
  { min: 0.1, label: 'SILVER', color: 'text-gray-400' },
  { min: 1.0, label: 'GOLD', color: 'text-yellow-500' },
  { min: 5.0, label: 'DIAMOND', color: 'text-cyan-400 animate-pulse' }
];

export const SIGNAL_CONFIG = {
  [SignalLevel.LOW]: { 
    range: [0.85, 0.95], 
    flavor: "Weak signal… prove yourself with raids.",
    color: "text-red-500",
    maxDiscoveryRange: [0.01, 0.15] 
  },
  [SignalLevel.MED]: { 
    range: [0.95, 1.05], 
    flavor: "Decent signal… you’re eligible.",
    color: "text-yellow-500",
    maxDiscoveryRange: [0.15, 2.5]
  },
  [SignalLevel.HIGH]: { 
    range: [1.05, 1.25], 
    flavor: "Alpha signal detected… rare boost possible.",
    color: "text-green-500",
    maxDiscoveryRange: [2.5, 10.0]
  }
};

export const MISSIONS_DEFAULT = [
  {
    id: 'follow_1',
    title: 'FOLLOW_MONKYMAKER',
    description: 'Join @monkymaker on X.',
    link: 'https://x.com/monkymaker',
    cta: 'RUN: FOLLOW'
  }
];

export const DISCLAIMER = "Engagement points and presale tokens are distributed post-campaign. Final allocations subject to manual audit.";
