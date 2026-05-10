import { DollarSign, Bitcoin, TrendingUp, LucideIcon } from 'lucide-react-native';

export const assetTypeIcons: Record<'fiat' | 'crypto' | 'shares', LucideIcon> = {
  fiat: DollarSign,
  crypto: Bitcoin,
  shares: TrendingUp,
};
