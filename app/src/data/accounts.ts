export interface DecisionMaker {
  id: string;
  name: string;
  title: string;
  reportsTo?: string; // id of another decision maker
  stance: 'champion' | 'neutral' | 'blocker' | 'unknown';
  influence: number; // 0-100
  lastContact?: string; // ISO
}

export interface Briefing {
  id: string;
  accountId: string;
  title: string;
  summary: string;
  priority: 'high' | 'medium' | 'low';
  nextAction: string;
  generatedAt: string; // ISO
}

export interface Account {
  id: string;
  rank: number;
  name: string;
  tier: 1 | 2 | 3;
  sector: string;
  dealSize: number; // BRL
  lastActivity: string; // ISO
  aiScore: number; // 0-100
  trend: number[]; // 11-point sparkline
  status: 'champion' | 'neutral' | 'blocker';
  logo: string; // single-letter fallback
  color: string; // brand color hint
  domain: string; // authoritative domain used for Google S2 favicon lookup
  decisionMakers: DecisionMaker[];
  briefings: Briefing[];
}

// Authoritative domains (used for Google S2 Favicons → real brand logo).
const LOGO_DOMAINS: Record<string, string> = {
  nubank: 'nubank.com.br',
  itau: 'itau.com.br',
  magalu: 'magazineluiza.com.br',
  bradesco: 'bradesco.com.br',
  btg: 'btgpactual.com',
  xp: 'xpi.com.br',
  claro: 'claro.com.br',
  porto: 'portoseguro.com.br',
  santander: 'santander.com.br',
  casasbahia: 'casasbahia.com.br',
  ambev: 'ambev.com.br',
  vale: 'vale.com',
  jbs: 'jbs.com.br',
  petrobras: 'petrobras.com.br',
  embraer: 'embraer.com',
  natura: 'natura.com.br',
  'raia-drogasil': 'rd.com.br',
  localiza: 'localiza.com',
  b3: 'b3.com.br',
  gerdau: 'gerdau.com',
  weg: 'weg.net',
  suzano: 'suzano.com.br',
  hapvida: 'hapvida.com.br',
  'rede-d-or': 'rededor.com.br',
  ultrapar: 'ultra.com.br',
  energisa: 'energisa.com.br',
  cielo: 'cielo.com.br',
  totvs: 'totvs.com',
  vtex: 'vtex.com',
  stone: 'stone.com.br',
  pagseguro: 'pagseguro.com.br',
  alelo: 'alelo.com.br',
  'mercado-livre-br': 'mercadolivre.com.br',
  ifood: 'ifood.com.br',
  loggi: 'loggi.com',
  'rappi-br': 'rappi.com.br',
  kavak: 'kavak.com',
  creditas: 'creditas.com.br',
  'c6-bank': 'c6bank.com.br',
  inter: 'bancointer.com.br',
  'banco-pan': 'bancopan.com.br',
  'will-bank': 'willbank.com.br',
  serasa: 'serasa.com.br',
  'boa-vista': 'boavistaservicos.com.br',
  'quinto-andar': 'quintoandar.com.br',
  loft: 'loft.com.br',
  'olx-br': 'olx.com.br',
  americanas: 'americanas.com.br',
  gpa: 'gpabr.com',
  'carrefour-br': 'carrefour.com.br',
  'banco-do-brasil': 'bb.com.br',
  'caixa-econ-mica': 'caixa.gov.br',
  vivo: 'vivo.com.br',
  oi: 'oi.com.br',
  'tim-brasil': 'tim.com.br',
  'gol-linhas-a-reas': 'voegol.com.br',
  'azul-linhas-a-reas': 'voeazul.com.br',
  renner: 'lojasrenner.com.br',
  via: 'via.com.br',
  ipiranga: 'ipiranga.com.br',
};

// Seeded brand list (keepers from Phase 1 recon).
const BASE: Array<Omit<Account, 'decisionMakers' | 'briefings' | 'domain'>> = [
  { id: 'nubank',     rank: 1,  name: 'Nubank',          tier: 1, sector: 'Fintech',   dealSize: 2_400_000, lastActivity: '2026-04-15', aiScore: 92, trend: [62,65,68,66,70,72,75,78,82,86,92], status: 'champion', logo: 'N', color: '#820AD1' },
  { id: 'itau',       rank: 2,  name: 'Itaú Unibanco',   tier: 1, sector: 'Bank',      dealSize: 1_800_000, lastActivity: '2026-04-14', aiScore: 88, trend: [70,72,74,73,75,78,80,82,85,87,88], status: 'champion', logo: 'I', color: '#EC7000' },
  { id: 'magalu',     rank: 3,  name: 'Magazine Luiza',  tier: 1, sector: 'Retail',    dealSize: 1_100_000, lastActivity: '2026-04-12', aiScore: 84, trend: [80,81,82,83,82,83,84,84,85,84,84], status: 'neutral',  logo: 'M', color: '#0086FF' },
  { id: 'bradesco',   rank: 4,  name: 'Bradesco',        tier: 1, sector: 'Bank',      dealSize: 980_000,   lastActivity: '2026-04-15', aiScore: 81, trend: [68,70,72,74,76,77,78,79,80,80,81], status: 'champion', logo: 'B', color: '#CC092F' },
  { id: 'btg',        rank: 5,  name: 'BTG Pactual',     tier: 2, sector: 'Finance',   dealSize: 760_000,   lastActivity: '2026-04-10', aiScore: 76, trend: [82,80,79,78,78,77,77,76,76,76,76], status: 'neutral',  logo: 'B', color: '#002855' },
  { id: 'xp',         rank: 6,  name: 'XP Inc.',         tier: 2, sector: 'Finance',   dealSize: 640_000,   lastActivity: '2026-04-13', aiScore: 73, trend: [60,62,64,66,68,69,70,71,72,72,73], status: 'champion', logo: 'X', color: '#F7CE3E' },
  { id: 'claro',      rank: 7,  name: 'Claro',           tier: 2, sector: 'Telco',     dealSize: 520_000,   lastActivity: '2026-04-08', aiScore: 69, trend: [72,71,70,70,69,69,69,69,69,69,69], status: 'neutral',  logo: 'C', color: '#E60000' },
  { id: 'porto',      rank: 8,  name: 'Porto Seguro',    tier: 2, sector: 'Insurance', dealSize: 430_000,   lastActivity: '2026-04-14', aiScore: 65, trend: [55,57,58,60,62,63,64,64,65,65,65], status: 'champion', logo: 'P', color: '#00539B' },
  { id: 'santander',  rank: 9,  name: 'Santander BR',    tier: 3, sector: 'Bank',      dealSize: 310_000,   lastActivity: '2026-04-02', aiScore: 58, trend: [68,66,64,63,62,61,60,59,59,58,58], status: 'blocker',  logo: 'S', color: '#EC0000' },
  { id: 'casasbahia', rank: 10, name: 'Casas Bahia',     tier: 3, sector: 'Retail',    dealSize: 240_000,   lastActivity: '2026-03-28', aiScore: 42, trend: [58,55,52,50,48,46,45,44,43,42,42], status: 'blocker',  logo: 'C', color: '#0066B3' },
];

// Expanded Brazilian + regional accounts so the portfolio reaches 60.
const SYNTHETIC_NAMES = [
  'Ambev', 'Vale', 'JBS', 'Petrobras', 'Embraer', 'Natura', 'Raia Drogasil', 'Localiza',
  'B3', 'Gerdau', 'WEG', 'Suzano', 'Hapvida', 'Rede D\'Or', 'Ultrapar', 'Energisa',
  'Cielo', 'Totvs', 'VTEX', 'Stone', 'PagSeguro', 'Alelo', 'Mercado Livre BR', 'iFood',
  'Loggi', 'Rappi BR', 'Kavak', 'Creditas', 'C6 Bank', 'Inter', 'Banco Pan', 'Will Bank',
  'Serasa', 'Boa Vista', 'Quinto Andar', 'Loft', 'OLX BR', 'Americanas', 'GPA', 'Carrefour BR',
  'Banco do Brasil', 'Caixa Econômica', 'Vivo', 'Oi', 'TIM Brasil',
  'Gol Linhas Aéreas', 'Azul Linhas Aéreas', 'Renner', 'Via', 'Ipiranga',
];

const SECTOR_BY_NAME: Record<string, string> = {
  'Ambev': 'Consumer', 'Vale': 'Industrial', 'JBS': 'Industrial', 'Petrobras': 'Energy',
  'Embraer': 'Industrial', 'Natura': 'Retail', 'Raia Drogasil': 'Health', 'Localiza': 'Logistics',
  'B3': 'Finance', 'Gerdau': 'Industrial', 'WEG': 'Industrial', 'Suzano': 'Industrial',
  'Hapvida': 'Health', 'Rede D\'Or': 'Health', 'Ultrapar': 'Energy', 'Energisa': 'Energy',
  'Cielo': 'Fintech', 'Totvs': 'Tech', 'VTEX': 'Tech', 'Stone': 'Fintech',
  'PagSeguro': 'Fintech', 'Alelo': 'Fintech', 'Mercado Livre BR': 'Retail', 'iFood': 'Tech',
  'Loggi': 'Logistics', 'Rappi BR': 'Tech', 'Kavak': 'Retail', 'Creditas': 'Fintech',
  'C6 Bank': 'Fintech', 'Inter': 'Fintech', 'Banco Pan': 'Bank', 'Will Bank': 'Fintech',
  'Serasa': 'Fintech', 'Boa Vista': 'Fintech', 'Quinto Andar': 'Real Estate', 'Loft': 'Real Estate',
  'OLX BR': 'Tech', 'Americanas': 'Retail', 'GPA': 'Retail', 'Carrefour BR': 'Retail',
  'Banco do Brasil': 'Bank', 'Caixa Econômica': 'Bank', 'Vivo': 'Telco', 'Oi': 'Telco', 'TIM Brasil': 'Telco',
  'Gol Linhas Aéreas': 'Travel', 'Azul Linhas Aéreas': 'Travel', 'Renner': 'Retail', 'Via': 'Retail', 'Ipiranga': 'Energy',
};

const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#0EA5E9', '#F97316', '#A3E635'];
const STATUSES: Account['status'][] = ['champion', 'neutral', 'blocker'];
const TIERS: Account['tier'][] = [1, 2, 3];
function seededRandom(seed: number) { let x = seed; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }
const rand = seededRandom(42);

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const synthetic: Array<Omit<Account, 'decisionMakers' | 'briefings' | 'domain'>> = SYNTHETIC_NAMES.map((name, i) => {
  const r = Math.floor(rand() * 100);
  const trend = Array.from({ length: 11 }, (_, j) => Math.max(20, Math.min(95, 50 + (r - 50) * 0.3 + j * 2 + (rand() - 0.5) * 10)));
  return {
    id: slugify(name),
    rank: 11 + i,
    name,
    tier: TIERS[Math.floor(rand() * 3)]!,
    sector: SECTOR_BY_NAME[name] ?? 'Industrial',
    dealSize: Math.floor(100_000 + rand() * 900_000),
    lastActivity: new Date(Date.now() - Math.floor(rand() * 30) * 86_400_000).toISOString().slice(0, 10),
    aiScore: Math.floor(35 + rand() * 60),
    trend: trend.map((n) => Math.round(n)),
    status: STATUSES[Math.floor(rand() * 3)]!,
    logo: name[0]!.toUpperCase(),
    color: COLORS[i % COLORS.length]!,
  };
});

function makeDecisionMakers(accountId: string): DecisionMaker[] {
  const roles = [
    { title: 'CEO', inf: 95 }, { title: 'CFO', inf: 85 }, { title: 'CRO', inf: 82 },
    { title: 'CTO', inf: 75 }, { title: 'VP Operations', inf: 70 }, { title: 'VP CX', inf: 68 },
    { title: 'Head of Procurement', inf: 60 }, { title: 'Senior PM', inf: 50 },
  ];
  const stances: DecisionMaker['stance'][] = ['champion', 'neutral', 'blocker', 'unknown'];
  const count = 4 + Math.floor(rand() * 4);
  const makers: DecisionMaker[] = [];
  for (let i = 0; i < count; i++) {
    const r = roles[i % roles.length]!;
    makers.push({
      id: `${accountId}-dm-${i}`,
      name: ['Ana Silva', 'Bruno Costa', 'Carla Almeida', 'Daniel Souza', 'Eduarda Lima', 'Felipe Rocha', 'Gabi Torres', 'Heitor Dias'][i % 8]!,
      title: r.title,
      reportsTo: i > 0 ? `${accountId}-dm-${Math.max(0, Math.floor(rand() * i))}` : undefined,
      stance: stances[Math.floor(rand() * 4)]!,
      influence: Math.max(30, r.inf - Math.floor(rand() * 20)),
      lastContact: rand() > 0.25 ? new Date(Date.now() - Math.floor(rand() * 30) * 86_400_000).toISOString().slice(0, 10) : undefined,
    });
  }
  return makers;
}

function makeBriefings(account: { id: string; name: string }): Briefing[] {
  const seeds = [
    { priority: 'high' as const,   title: 'AI score jumped +10 this week',   summary: 'Three stakeholders engaged including the CRO. Champion status confirmed.', nextAction: 'Send Tier-1 executive briefing today' },
    { priority: 'medium' as const, title: 'Proposal review scheduled',       summary: 'Legal has flagged two clauses for discussion. CFO is aware.',               nextAction: 'Prepare red-line response by Friday' },
    { priority: 'low' as const,    title: 'New decision-maker identified',   summary: 'VP of Procurement started last month. Champion potential per LinkedIn activity.', nextAction: 'Introduction via mutual connection' },
  ];
  return seeds.map((s, i) => ({
    id: `${account.id}-brf-${i}`,
    accountId: account.id,
    title: s.title,
    summary: s.summary,
    priority: s.priority,
    nextAction: s.nextAction,
    generatedAt: new Date(Date.now() - i * 86_400_000).toISOString(),
  }));
}

export const ACCOUNTS: Account[] = [...BASE, ...synthetic].map((a) => ({
  ...a,
  domain: LOGO_DOMAINS[a.id] ?? `${a.id}.com.br`,
  decisionMakers: makeDecisionMakers(a.id),
  briefings: makeBriefings({ id: a.id, name: a.name }),
}));

export function getAccount(id: string): Account | undefined { return ACCOUNTS.find((a) => a.id === id); }

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
    { label: 'Tier 3', value: 7,  color: '#A855F7' },
  ],
  bySector: [
    { label: 'Banks',  value: 22, color: '#F59E0B' },
    { label: 'Telco',  value: 15, color: '#44C9C1' },
    { label: 'Retail', value: 12, color: '#22C55E' },
    { label: 'Other',  value: 10, color: '#EC4899' },
  ],
  dealSize: [
    { label: '$500K+', value: 18 },
    { label: '$250K',  value: 14 },
    { label: '$100K',  value: 10 },
    { label: '$50K',   value: 7 },
    { label: '$25K',   value: 4 },
  ],
};

/** Synthetic 365-day activity log — touchpoints per day across the portfolio. */
export function generateCadence(): Array<{ date: string; count: number }> {
  const start = new Date();
  start.setDate(start.getDate() - 364);
  const r = seededRandom(99);
  return Array.from({ length: 365 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const weekday = d.getDay();
    const baseline = weekday === 0 || weekday === 6 ? 1 : 8;
    const boost = i > 320 ? 3 : 0;
    const count = Math.max(0, Math.floor(baseline + boost + (r() - 0.5) * 8));
    return { date: d.toISOString().slice(0, 10), count };
  });
}
