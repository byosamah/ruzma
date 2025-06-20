
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'payment_submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return Clock;
    case 'payment_submitted': return Clock;
    case 'approved': return CheckCircle;
    case 'rejected': return XCircle;
    default: return Clock;
  }
};

export const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return '';
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  } else if (startDate) {
    return `From ${formatDate(startDate)}`;
  } else if (endDate) {
    return `Until ${formatDate(endDate)}`;
  }
  
  return '';
};

export const isPdfFile = (url: string) => {
  return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('pdf');
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};
