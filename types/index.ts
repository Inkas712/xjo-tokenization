export interface Asset {
  id: string;
  name: string;
  type: 'fiat' | 'crypto' | 'shares';
  balance: number;
  value: number;
  currency: string;
  change24h?: number;
  chartData?: { value: number }[];
  chartData1D?: { value: number }[];
  chartData7D?: { value: number }[];
  chartData1M?: { value: number }[];
  chartData1Y?: { value: number }[];
}

export interface Card {
  id: string;
  name: string;
  cardNumber: string;
  cardNumberFull: string;
  balance: number;
  currency: string;
  type: 'virtual' | 'physical';
  color: string;
  expiryDate: string;
  cardholderName: string;
  status: 'active' | 'frozen';
  transactions: CardTransaction[];
}

export interface IslamicProduct {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  details: string;
  icon: string;
  minAmount?: number;
  expectedReturn?: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'topup' | 'withdraw';
  amount: number;
  currency: string;
  recipient?: string;
  sender?: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

export interface CardTransaction {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  date: Date;
  type: 'debit' | 'credit';
}

export interface User {
  id: string;
  name: string;
  nickname: string;
  dateOfBirth: Date;
  isVerified: boolean;
}
