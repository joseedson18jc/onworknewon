export interface Account {
  id: string;
  rank: number;
  name: string;
  tier: 1 | 2 | 3;
  sector: string;
  dealSize: number; // BRL
  lastActivity: string; // ISO
  aiScore: number; // 0-100
  trend: number[]; // 30-day sparkline data
  status: 'champion' | 'neutral' | 'blocker';
  logo: string; // single-letter for avatar
  color: string; // brand color hint
}

export const ACCOUNTS: Account[] = [
  { id: 'nubank', rank: 1, name: 'Nubank', tier: 1, sector: 'Fintech', dealSize: 2_400_000, lastActivity: '2026-04-15', aiScore: 92, trend: [62,65,68,66,70,72,75,78,82,86,92], status: 'champion', logo: 'N', color: '#820AD1' },
  { id: 'itau', rank: 2, name: 'Itaú Unibanco', tier: 1, sector: 'Bank', dealSize: 1_800_000, lastActivity: '2026-04-14', aiScore: 88, trend: [70,72,74,73,75,78,80,82,85,87,88], status: 'champion', logo: 'I', color: '#EC7000' },
  { id: 'magalu', rank: 3, name: 'Magazine Luiza', tier: 1, sector: 'Retail', dealSize: 1_100_000, lastActivity: '2026-04-12', aiScore: 84, trend: [80,81,82,83,82,83,84,84,85,84,84], status: 'neutral', logo: 'M', color: '#0086FF' },
  { id: 'bradesco', rank: 4, name: 'Bradesco', tier: 1, sector: 'Bank', dealSize: 980_000, lastActivity: '2026-04-15', aiScore: 81, trend: [68,70,72,74,76,77,78,79,80,80,81], status: 'champion', logo: 'B', color: '#CC092F' },
  { id: 'btg', rank: 5, name: 'BTG Pactual', tier: 2, sector: 'Finance', dealSize: 760_000, lastActivity: '2026-04-10', aiScore: 76, trend: [82,80,79,78,78,77,77,76,76,76,76], status: 'neutral', logo: 'B', color: '#002855' },
  { id: 'xp', rank: 6, name: 'XP Inc.', tier: 2, sector: 'Finance', dealSize: 640_000, lastActivity: '2026-04-13', aiScore: 73, trend: [60,62,64,66,68,69,70,71,72,72,73], status: 'champion', logo: 'X', color: '#F7CE3E' },
  { id: 'claro', rank: 7, name: 'Claro', tier: 2, sector: 'Telco', dealSize: 520_000, lastActivity: '2026-04-08', aiScore: 69, trend: [72,71,70,70,69,69,69,69,69,69,69], status: 'neutral', logo: 'C', color: '#E60000' },
  { id: 'porto', rank: 8, name: 'Porto Seguro', tier: 2, sector: 'Insurance', dealSize: 430_000, lastActivity: '2026-04-14', aiScore: 65, trend: [55,57,58,60,62,63,64,64,65,65,65], status: 'champion', logo: 'P', color: '#00539B' },
  { id: 'santander', rank: 9, name: 'Santander BR', tier: 3, sector: 'Bank', dealSize: 310_000, lastActivity: '2026-04-02', aiScore: 58, trend: [68,66,64,63,62,61,60,59,59,58,58], status: 'blocker', logo: 'S', color: '#EC0000' },
  { id: 'casasbahia', rank: 10, name: 'Casas Bahia', tier: 3, sector: 'Retail', dealSize: 240_000, lastActivity: '2026-03-28', aiScore: 42, trend: [58,55,52,50,48,46,45,44,43,42,42], status: 'blocker', logo: 'C', color: '#0066B3' },
];

export const KPI = {
  hotLeads: { value: 79, delta: 12, trend: [60,62,64,61,66,68,71,73,70,74,76,79] },
  weeklyMeetings: { value: 17, delta: 4, trend: [10,11,12,13,12,13,14,15,14,15,16,17] },
  openProposals: { value: 9, delta: 0, trend: [9,10,9,10,9,9,10,9,10,9,9,9] },
  atRiskAccounts: { value: 3, delta: -2, trend: [6,6,5,5,5,4,4,4,3,3,3,3] },
};

export const PORTFOLIO = {
  byTier: [
    { label: 'Tier 1', value: 34, color: '#44C9C1' },
    { label: 'Tier 2', value: 18, color: '#3B82F6' },
    { label: 'Tier 3', value: 7, color: '#A855F7' },
  ],
  bySector: [
    { label: 'Banks', value: 22, color: '#F59E0B' },
    { label: 'Telco', value: 15, color: '#44C9C1' },
    { label: 'Retail', value: 12, color: '#22C55E' },
    { label: 'Other', value: 10, color: '#EC4899' },
  ],
  dealSize: [
    { label: '$500K+', value: 18 },
    { label: '$250K', value: 14 },
    { label: '$100K', value: 10 },
    { label: '$50K', value: 7 },
    { label: '$25K', value: 4 },
  ],
};
