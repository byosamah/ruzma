
import { Invoice } from './types';

export const initialMockInvoices: Invoice[] = [
  {
    id: '1',
    transactionId: 'TXN-2024-001',
    amount: 2500.00,
    projectName: 'Website Redesign',
    date: new Date('2024-01-15'),
    status: 'paid',
    projectId: 'proj-1'
  },
  {
    id: '2',
    transactionId: 'TXN-2024-002',
    amount: 1800.00,
    projectName: 'Mobile App Development',
    date: new Date('2024-01-20'),
    status: 'sent',
    projectId: 'proj-2'
  },
  {
    id: '3',
    transactionId: 'TXN-2024-003',
    amount: 3200.00,
    projectName: 'E-commerce Platform',
    date: new Date('2024-01-25'),
    status: 'overdue',
    projectId: 'proj-3'
  },
  {
    id: '4',
    transactionId: 'TXN-2024-004',
    amount: 950.00,
    projectName: 'Brand Identity Design',
    date: new Date('2024-02-01'),
    status: 'draft',
    projectId: 'proj-4'
  },
  {
    id: '5',
    transactionId: 'TXN-2024-005',
    amount: 4100.00,
    projectName: 'Data Analytics Dashboard',
    date: new Date('2024-02-10'),
    status: 'paid',
    projectId: 'proj-5'
  }
];
