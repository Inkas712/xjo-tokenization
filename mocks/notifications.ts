export interface Notification {
  id: string;
  type: 'bid' | 'sold' | 'price_drop' | 'transfer' | 'welcome' | 'outbid' | 'follow' | 'alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  group: 'today' | 'week' | 'earlier';
}
