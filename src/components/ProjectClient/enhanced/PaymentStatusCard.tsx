import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, Clock, AlertCircle, Receipt, Wallet } from 'lucide-react';
import { DatabaseProject, DatabaseMilestone } from '@/types/shared';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { formatDate } from '@/lib/utils/dateUtils';

interface PaymentStatusCardProps {
  project: DatabaseProject;
  currency: CurrencyCode;
}

const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({ project, currency }) => {
  const milestones = project.milestones;
  
  // Payment statistics
  const totalValue = milestones.reduce((sum, m) => sum + m.price, 0);
  const paidAmount = milestones
    .filter(m => m.status === 'approved')
    .reduce((sum, m) => sum + m.price, 0);
  const pendingAmount = milestones
    .filter(m => m.status === 'completed' || m.status === 'payment_submitted')
    .reduce((sum, m) => sum + m.price, 0);
  const remainingAmount = totalValue - paidAmount - pendingAmount;

  // Payment breakdown
  const paymentBreakdown = [
    {
      label: 'Paid',
      amount: paidAmount,
      color: 'green',
      icon: CheckCircle2,
      count: milestones.filter(m => m.status === 'approved').length
    },
    {
      label: 'Pending Payment',
      amount: pendingAmount,
      color: 'amber',
      icon: Clock,
      count: milestones.filter(m => m.status === 'completed' || m.status === 'payment_submitted').length
    },
    {
      label: 'Remaining',
      amount: remainingAmount,
      color: 'gray',
      icon: Wallet,
      count: milestones.filter(m => m.status === 'pending').length
    }
  ];

  // Recent payment activity
  const recentPayments = milestones
    .filter(m => m.payment_proof_url || m.status === 'approved')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  const paymentProgress = totalValue > 0 ? (paidAmount / totalValue) * 100 : 0;

  return (
    <motion.section 
      className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold mb-6 flex items-center text-green-900">
        <CreditCard className="w-5 h-5 mr-2 text-green-600" />
        Payment Status & History
      </h3>
      
      {/* Payment Progress */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">Payment Progress</span>
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(paidAmount, currency)} / {formatCurrency(totalValue, currency)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${paymentProgress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500">
          {Math.round(paymentProgress)}% of total project value paid
        </p>
      </div>

      {/* Payment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {paymentBreakdown.map((item, index) => (
          <div key={item.label} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <item.icon className={`w-5 h-5 text-${item.color}-600`} />
              <span className="text-xs text-gray-500">{item.count} milestone{item.count !== 1 ? 's' : ''}</span>
            </div>
            <p className={`text-lg font-bold text-${item.color}-600`}>
              {formatCurrency(item.amount, currency)}
            </p>
            <p className="text-sm text-gray-600">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Payment Activity */}
      {recentPayments.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Receipt className="w-4 h-4 mr-2 text-gray-600" />
            Recent Payment Activity
          </h4>
          <div className="space-y-3">
            {recentPayments.map(milestone => (
              <div key={milestone.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                  <p className="text-xs text-gray-500">
                    {milestone.status === 'approved' ? 'Payment confirmed' : 'Payment proof uploaded'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(milestone.price, currency)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(milestone.updated_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Information */}
      <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
        <h4 className="font-semibold text-gray-900 mb-2">Payment Information</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Upload payment proofs after completing each milestone payment</p>
          <p>• Payments are processed and confirmed within 1-2 business days</p>
          <p>• All amounts are shown in {currency} as per your project currency</p>
          {project.payment_proof_required && (
            <p className="text-amber-700 font-medium">
              • Payment proof upload is required for this project
            </p>
          )}
        </div>
      </div>

      {/* Outstanding Payments Alert */}
      {pendingAmount > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            You have {formatCurrency(pendingAmount, currency)} in pending payments. 
            Upload payment proofs to confirm completion.
          </p>
        </div>
      )}
    </motion.section>
  );
};

export default PaymentStatusCard;