export interface Notification {
  id: string;
  type: 'bid' | 'sold' | 'price_drop' | 'transfer' | 'welcome' | 'outbid' | 'follow' | 'alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  group: 'today' | 'week' | 'earlier';
}

export const notifications: Notification[] = [
  {
    id: 'n1',
    type: 'bid',
    title: 'New Bid Received',
    message: 'Marcus Chen placed a bid of 11.87 ETH on Skyline Penthouse #42',
    timestamp: '2 min ago',
    read: false,
    group: 'today',
  },
  {
    id: 'n2',
    type: 'sold',
    title: 'Asset Sold!',
    message: 'Your Digital Aurora #7 was sold for 3.2 ETH',
    timestamp: '1 hour ago',
    read: false,
    group: 'today',
  },
  {
    id: 'n3',
    type: 'outbid',
    title: 'You\'ve Been Outbid',
    message: 'Someone placed a higher bid on Vintage Rolex Daytona Token. Current bid: 43.5 ETH',
    timestamp: '2 hours ago',
    read: false,
    group: 'today',
  },
  {
    id: 'n4',
    type: 'price_drop',
    title: 'Price Alert',
    message: 'Gold Bar 1kg dropped 12% in the last 24h — now at 1.85 ETH',
    timestamp: '3 hours ago',
    read: false,
    group: 'today',
  },
  {
    id: 'n5',
    type: 'follow',
    title: 'New Follower',
    message: 'Aria Nakamura started following you',
    timestamp: '5 hours ago',
    read: false,
    group: 'today',
  },
  {
    id: 'n6',
    type: 'transfer',
    title: 'Transfer Complete',
    message: 'Neo-Tokyo Drift #33 was transferred to your wallet',
    timestamp: '1 day ago',
    read: true,
    group: 'week',
  },
  {
    id: 'n7',
    type: 'bid',
    title: 'Bid Received',
    message: 'Sofia Laurent placed a bid of 26.5 ETH on Beachfront Villa Costa Rica',
    timestamp: '2 days ago',
    read: true,
    group: 'week',
  },
  {
    id: 'n8',
    type: 'alert',
    title: 'Price Alert Triggered',
    message: 'First Edition Charizard PSA 10 rose above 90 ETH — currently at 95 ETH',
    timestamp: '3 days ago',
    read: true,
    group: 'week',
  },
  {
    id: 'n9',
    type: 'system',
    title: 'KYC Approved',
    message: 'Your identity verification has been approved. You can now access regulated assets.',
    timestamp: '5 days ago',
    read: true,
    group: 'week',
  },
  {
    id: 'n10',
    type: 'sold',
    title: 'Royalty Earned',
    message: 'You earned 0.38 ETH royalty from the resale of Abstract Dimension #12',
    timestamp: '1 week ago',
    read: true,
    group: 'earlier',
  },
  {
    id: 'n11',
    type: 'welcome',
    title: 'Welcome to XJO',
    message: 'Start exploring tokenized assets and build your portfolio',
    timestamp: '2 weeks ago',
    read: true,
    group: 'earlier',
  },
];
