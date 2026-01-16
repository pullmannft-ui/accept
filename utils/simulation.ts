
import { SignalLevel, UserData } from '../types';
import { SIGNAL_CONFIG, TOKENOMICS, GLOBAL_COMMIT_LIMITS } from '../constants';

/**
 * Generates a deterministic pseudo-random number [0, 1) based on a string seed.
 */
const getSeededRandom = (seed: string, salt: string = '') => {
  let hash = 0;
  const str = seed.toLowerCase().trim() + salt;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; 
  }
  // Simple LCG-like transformation for a float output
  let t = hash + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const generateScanResult = (handle: string) => {
  // Use seeded random for determinism
  const levelRoll = getSeededRandom(handle, 'level_salt');
  const maxRoll = getSeededRandom(handle, 'max_salt');
  const multRoll = getSeededRandom(handle, 'mult_salt');

  const levels = [SignalLevel.LOW, SignalLevel.MED, SignalLevel.HIGH];
  // Improved weights: 45% LOW, 40% MED, 15% HIGH
  const weights = [0.45, 0.40, 0.15]; 
  
  let level = SignalLevel.LOW;
  let cumulative = 0;
  for (let i = 0; i < levels.length; i++) {
    cumulative += weights[i];
    if (levelRoll <= cumulative) {
      level = levels[i];
      break;
    }
  }

  const [dMin, dMax] = SIGNAL_CONFIG[level].maxDiscoveryRange;
  // Apply a non-linear distribution to make the higher ends of the range rarer even within a bucket
  const skewedMaxRoll = Math.pow(maxRoll, 1.5); 
  const discoveredMax = parseFloat((skewedMaxRoll * (dMax - dMin) + dMin).toFixed(3));
  
  const [mMin, mMax] = SIGNAL_CONFIG[level].range;
  const multiplier = mMin + multRoll * (mMax - mMin);
  
  // Base rate calculation (Tokens per 1 SOL)
  const baseRate = TOKENOMICS.PRESALE_TOKENS / TOKENOMICS.SIMULATED_POOL_CAP_SOL;

  return { level, discoveredMax, multiplier, baseRate };
};

export const calculateMonkyEstimate = (user: UserData): number => {
  // deterministic jitter based on handle + commitment to keep it stable but feel organic
  const jitterSeed = getSeededRandom(user.handle, user.actualCommit.toString());
  const jitter = 0.98 + (jitterSeed * 0.04); // 0.98 to 1.02 (±2%)

  const baseTokens = (user.actualCommit / TOKENOMICS.SIMULATED_POOL_CAP_SOL) * TOKENOMICS.PRESALE_TOKENS;
  const final = Math.round(baseTokens * user.multiplier * jitter);
  return final;
};
