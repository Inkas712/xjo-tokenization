import { Asset, Card, IslamicProduct, CardTransaction } from '@/types';

const generateChartData = (points: number, baseValue: number, volatility: number) => {
  const data = [];
  let value = baseValue;
  for (let i = 0; i < points; i++) {
    value = value + (Math.random() - 0.5) * volatility;
    data.push({ value });
  }
  return data;
};

export const demoAssets: Asset[] = [
  {
    id: '1',
    name: 'US Dollar',
    type: 'fiat',
    balance: 5420.50,
    value: 5420.50,
    currency: 'USD',
    chartData: generateChartData(20, 5400, 50),
    chartData1D: generateChartData(24, 5400, 30),
    chartData7D: generateChartData(168, 5300, 100),
    chartData1M: generateChartData(720, 5200, 150),
    chartData1Y: generateChartData(365, 4800, 300),
  },
  {
    id: '2',
    name: 'Euro',
    type: 'fiat',
    balance: 1200.00,
    value: 1320.00,
    currency: 'EUR',
    chartData: generateChartData(20, 1310, 20),
    chartData1D: generateChartData(24, 1315, 10),
    chartData7D: generateChartData(168, 1300, 30),
    chartData1M: generateChartData(720, 1280, 40),
    chartData1Y: generateChartData(365, 1200, 80),
  },
  {
    id: '3',
    name: 'Bitcoin',
    type: 'crypto',
    balance: 0.0456,
    value: 4235.20,
    currency: 'BTC',
    change24h: 2.4,
    chartData: generateChartData(20, 4100, 200),
    chartData1D: generateChartData(24, 4150, 150),
    chartData7D: generateChartData(168, 4000, 300),
    chartData1M: generateChartData(720, 3800, 400),
    chartData1Y: generateChartData(365, 3200, 600),
  },
  {
    id: '4',
    name: 'Ethereum',
    type: 'crypto',
    balance: 1.234,
    value: 2856.80,
    currency: 'ETH',
    change24h: -1.2,
    chartData: generateChartData(20, 2900, 150),
    chartData1D: generateChartData(24, 2880, 100),
    chartData7D: generateChartData(168, 2850, 200),
    chartData1M: generateChartData(720, 2700, 250),
    chartData1Y: generateChartData(365, 2400, 350),
  },
  {
    id: '5',
    name: 'Apple Inc.',
    type: 'shares',
    balance: 25,
    value: 4375.00,
    currency: 'AAPL',
    change24h: 0.8,
    chartData: generateChartData(20, 4350, 80),
    chartData1D: generateChartData(24, 4360, 50),
    chartData7D: generateChartData(168, 4300, 100),
    chartData1M: generateChartData(720, 4200, 150),
    chartData1Y: generateChartData(365, 3900, 250),
  },
  {
    id: '6',
    name: 'Microsoft Corp.',
    type: 'shares',
    balance: 15,
    value: 5250.00,
    currency: 'MSFT',
    change24h: 1.5,
    chartData: generateChartData(20, 5200, 100),
    chartData1D: generateChartData(24, 5220, 70),
    chartData7D: generateChartData(168, 5150, 120),
    chartData1M: generateChartData(720, 5000, 180),
    chartData1Y: generateChartData(365, 4600, 300),
  },
];

const generateTransactions = (count: number, currency: string): CardTransaction[] => {
  const merchants = ['Whole Foods', 'Amazon', 'Starbucks', 'Netflix', 'Uber', 'Apple Store', 'Target', 'Walmart', 'Gas Station', 'Restaurant'];
  const transactions: CardTransaction[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    transactions.push({
      id: `txn-${i}`,
      merchant: merchants[Math.floor(Math.random() * merchants.length)],
      amount: Math.random() * 200 + 10,
      currency,
      date,
      type: Math.random() > 0.2 ? 'debit' : 'credit',
    });
  }
  
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const demoCards: Card[] = [
  {
    id: '1',
    name: 'Main Card',
    cardNumber: '4532 **** **** 8765',
    cardNumberFull: '4532 1234 5678 8765',
    balance: 2340.50,
    currency: 'USD',
    type: 'virtual',
    color: '#A8D5BA',
    expiryDate: '12/28',
    cardholderName: '',
    status: 'active',
    transactions: generateTransactions(25, 'USD'),
  },
  {
    id: '2',
    name: 'Savings Card',
    cardNumber: '5412 **** **** 3421',
    cardNumberFull: '5412 9876 5432 3421',
    balance: 5680.00,
    currency: 'USD',
    type: 'physical',
    color: '#8BC5A8',
    expiryDate: '06/27',
    cardholderName: '',
    status: 'active',
    transactions: generateTransactions(30, 'USD'),
  },
  {
    id: '3',
    name: 'Travel Card',
    cardNumber: '4916 **** **** 5678',
    cardNumberFull: '4916 2468 1357 5678',
    balance: 1200.00,
    currency: 'EUR',
    type: 'virtual',
    color: '#7AB896',
    expiryDate: '09/26',
    cardholderName: '',
    status: 'active',
    transactions: generateTransactions(15, 'EUR'),
  },
];

export const islamicProducts: IslamicProduct[] = [
  {
    id: '1',
    name: 'Mudaraba',
    arabicName: 'مضاربة',
    description: 'Profit-sharing investment',
    details: 'A partnership where you invest capital and share profits with entrepreneurs. Returns are based on actual business performance, not fixed interest.',
    icon: 'TrendingUp',
    minAmount: 1000,
    expectedReturn: '8-12% annually',
  },
  {
    id: '2',
    name: 'Musharaka',
    arabicName: 'مشاركة',
    description: 'Joint partnership investment',
    details: 'A joint venture where all partners contribute capital and share profits and losses proportionally. Ideal for collaborative business ventures.',
    icon: 'Users',
    minAmount: 5000,
    expectedReturn: '10-15% annually',
  },
  {
    id: '3',
    name: 'Murabaha',
    arabicName: 'مرابحة',
    description: 'Cost-plus financing',
    details: 'We purchase an asset on your behalf and sell it to you at cost plus an agreed profit margin. Transparent pricing with no hidden fees.',
    icon: 'ShoppingBag',
    minAmount: 500,
    expectedReturn: 'Fixed markup',
  },
  {
    id: '4',
    name: 'Wakala',
    arabicName: 'وكالة',
    description: 'Asset management',
    details: 'Professional asset management service where we invest your funds in Shariah-compliant ventures on your behalf.',
    icon: 'Briefcase',
    minAmount: 10000,
    expectedReturn: '7-10% annually',
  },
  {
    id: '5',
    name: 'Qard Hasan',
    arabicName: 'قرض حسن',
    description: 'Interest-free benevolent loan',
    details: 'Access interest-free loans for genuine needs. Repay only the principal amount. Available for community members in good standing.',
    icon: 'Heart',
    minAmount: 100,
    expectedReturn: 'No interest',
  },
  {
    id: '6',
    name: 'Amanah Wallet',
    arabicName: 'أمانة',
    description: 'Trust-based wallet',
    details: 'A secure wallet for holding funds in trust. Perfect for savings, zakah collection, or holding funds for specific purposes.',
    icon: 'Shield',
    minAmount: 0,
    expectedReturn: 'No returns',
  },
];
