
export enum AppStep {
  DESKTOP = 'DESKTOP',
  WELCOME = 'WELCOME',
  SCAN = 'SCAN',
  RAID = 'RAID',
  WALLET = 'WALLET',
  COMMIT = 'COMMIT',
  REVEAL = 'REVEAL',
  AIRDROP = 'AIRDROP',
  PRESALE = 'PRESALE',
  ADMIN = 'ADMIN',
  FORGE = 'FORGE',
  APPLICATION = 'APPLICATION'
}

export enum SignalLevel {
  LOW = 'LOW',
  MED = 'MED',
  HIGH = 'HIGH'
}

export type TaskStatus = 'AVAILABLE' | 'PENDING' | 'COMPLETED' | 'REJECTED';
export type MissionFrequency = 'ONCE' | 'DAILY' | 'UNLIMITED';

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'SOCIAL' | 'CONTENT' | 'DAILY';
  icon: string;
  frequency: MissionFrequency;
}

export interface Submission {
  id: string;
  missionId: string;
  proofUrl: string;
  status: TaskStatus;
  timestamp: number;
  amount?: number; // Added for presale contributions
}

export interface Participant {
  id: string;
  xUsername: string;
  walletAddress: string;
  totalPoints: number;
  submissions: Submission[];
  jungleCommit?: number; // Committed SOL from Jungle phase
  rank?: number;
}

export interface UserData {
  handle: string;
  referrer: string;
  isSolo: boolean;
  signalLevel: SignalLevel | null;
  maxAllowedCommit: number; 
  actualCommit: number;     
  multiplier: number;       
  baseRate: number;         
  monkyEstimate: number;
  wallet: string;
  proofLinks: {
    quote: string;
    tags: string;
  };
  raidScore: number;
  airdropPoints: number;
  airdropSubmissions: any[];
  airdropStreak: number;
  airdropTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
}
