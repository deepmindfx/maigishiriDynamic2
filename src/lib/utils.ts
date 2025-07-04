import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Ensure 12-hour format with AM/PM
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function generateTransactionReference(): string {
  return `TRX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'success':
    case 'delivered':
      return 'primary';
    case 'pending':
    case 'processing':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'gray';
  }
}

export function getTransactionLabel(type: string, details: any) {
  switch (type) {
    case 'airtime':
      return `${details.network} Airtime - ${details.phone}`;
    case 'data':
      return `${details.network} ${details.plan} - ${details.phone}`;
    case 'electricity':
      return `${details.disco} - ${details.meterNumber}`;
    case 'waec':
      return 'WAEC Card';
    case 'wallet_funding':
      // Check if this is a bank transfer with originator info
      if (details.flutterwave_data?.meta_data?.originatorname) {
        return `Wallet Funding from ${details.flutterwave_data.meta_data.originatorname} (${details.payment_method || 'bank_transfer'})`;
      }
      return `Wallet Funding (${details.method || details.payment_method || 'wallet'})`;
    case 'product_purchase':
      return `Product Purchase - ${details.product_name || 'Product'}`;
    case 'referral_reward':
      return `Referral Reward - ${details.reward_type || 'Bonus'}`;
    default:
      return 'Transaction';
  }
}

export function isDebit(type: string) {
  return ['airtime', 'data', 'electricity', 'waec', 'product_purchase'].includes(type);
}