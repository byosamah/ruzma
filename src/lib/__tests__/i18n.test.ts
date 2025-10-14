import { describe, it, expect } from 'vitest';
import { translate } from '../i18n';

describe('i18n', () => {
  describe('translate', () => {
    it('should translate simple keys in English', () => {
      expect(translate('loading', 'en')).toBe('Loading'); // Note: plans.ts overrides common.ts
      expect(translate('save', 'en')).toBe('Save');
      expect(translate('cancel', 'en')).toBe('Cancel');
      expect(translate('delete', 'en')).toBe('Delete');
    });

    it('should translate simple keys in Arabic', () => {
      expect(translate('loading', 'ar')).toBe('جاري التحميل'); // Note: plans.ts overrides common.ts
      expect(translate('save', 'ar')).toBe('حفظ');
      expect(translate('cancel', 'ar')).toBe('إلغاء');
      expect(translate('delete', 'ar')).toBe('حذف');
    });

    it('should handle authentication translations in English', () => {
      expect(translate('login', 'en')).toBe('Login');
      expect(translate('signup', 'en')).toBe('Sign Up');
      expect(translate('forgotPassword', 'en')).toBe('Forgot Password?');
      expect(translate('resetPassword', 'en')).toBe('Reset Password');
    });

    it('should handle authentication translations in Arabic', () => {
      expect(translate('login', 'ar')).toBe('تسجيل الدخول');
      expect(translate('signup', 'ar')).toBe('إنشاء حساب');
      expect(translate('forgotPassword', 'ar')).toBe('نسيت كلمة المرور؟');
      expect(translate('resetPassword', 'ar')).toBe('إعادة تعيين كلمة المرور');
    });

    it('should handle invoice translations', () => {
      expect(translate('invoices', 'en')).toBe('Invoices');
      expect(translate('createInvoice', 'en')).toBe('Create Invoice');
      expect(translate('invoices', 'ar')).toBe('الفواتير');
      expect(translate('createInvoice', 'ar')).toBe('إنشاء فاتورة');
    });

    it('should handle status translations', () => {
      expect(translate('draft', 'en')).toBe('Draft');
      expect(translate('sent', 'en')).toBe('Sent');
      expect(translate('paid', 'en')).toBe('Paid');
      expect(translate('overdue', 'en')).toBe('Overdue');
    });

    it('should handle navigation translations', () => {
      expect(translate('main', 'en')).toBe('Main');
      expect(translate('account', 'en')).toBe('Account');
      expect(translate('settings', 'en')).toBe('Settings');
      expect(translate('profile', 'en')).toBe('Profile');
    });

    it('should return the key itself if translation is missing', () => {
      // @ts-expect-error Testing missing key
      const result = translate('nonExistentKey' as any, 'en');
      expect(result).toBe('nonExistentKey');
    });

    it('should replace single variable in English', () => {
      const result = translate('minLength', 'en', { min: '5' });
      expect(result).toBe('Must be at least 5 characters');
    });

    it('should replace single variable in Arabic', () => {
      const result = translate('minLength', 'ar', { min: '5' });
      expect(result).toBe('يجب أن يكون 5 أحرف على الأقل');
    });

    it('should replace multiple variables', () => {
      const result = translate('retryAttempt', 'en', { count: '2', max: '5' });
      expect(result).toBe('Retry attempt 2 of 5');
    });

    it('should handle variable replacement with numbers', () => {
      const result = translate('minValue', 'en', { min: '10' });
      expect(result).toBe('Must be 10 or greater');
    });

    it('should handle variable replacement in Arabic', () => {
      const result = translate('minValue', 'ar', { min: '10' });
      expect(result).toBe('يجب أن يكون 10 أو أكثر');
    });

    it('should not replace variables if vars is undefined', () => {
      const result = translate('minLength', 'en');
      expect(result).toBe('Must be at least {min} characters');
    });

    it('should handle partial variable replacement', () => {
      // If only some variables are provided, others remain as placeholders
      const result = translate('retryAttempt', 'en', { count: '1' });
      expect(result).toBe('Retry attempt 1 of {max}');
    });

    it('should handle empty variable values', () => {
      const result = translate('minLength', 'en', { min: '' });
      expect(result).toBe('Must be at least  characters');
    });

    it('should handle client portal translations', () => {
      expect(translate('clientProjectPortal', 'en')).toBe('Client Project Portal');
      expect(translate('professionalFreelancer', 'en')).toBe('Professional Freelancer');
      expect(translate('projectNotFound', 'en')).toBe('Project not found'); // Note: projects.ts overrides common.ts
    });

    it('should handle error messages in both languages', () => {
      expect(translate('somethingWentWrong', 'en')).toBe('Something went wrong');
      expect(translate('somethingWentWrong', 'ar')).toBe('حدث خطأ ما');
      expect(translate('authenticationRequired', 'en')).toBe('Authentication required');
      expect(translate('authenticationRequired', 'ar')).toBe('المصادقة مطلوبة');
    });

    it('should handle success messages', () => {
      expect(translate('accountCreatedSuccess', 'en')).toBe('Account created successfully!');
      expect(translate('accountCreatedSuccess', 'ar')).toBe('تم إنشاء الحساب بنجاح!');
    });

    it('should handle validation messages', () => {
      expect(translate('required', 'en')).toBe('This field is required');
      expect(translate('invalidEmail', 'en')).toBe('Please enter a valid email'); // Note: clients.ts overrides common.ts
      expect(translate('required', 'ar')).toBe('هذا الحقل مطلوب');
      expect(translate('invalidEmail', 'ar')).toBe('يرجى إدخال بريد إلكتروني صحيح');
    });

    it('should handle currency translations', () => {
      expect(translate('currency', 'en')).toBe('Currency');
      expect(translate('selectCurrency', 'en')).toBe('Select currency'); // Note: profile.ts overrides common.ts
      expect(translate('currency', 'ar')).toBe('العملة');
      expect(translate('selectCurrency', 'ar')).toBe('اختر العملة');
    });

    it('should handle project-related translations', () => {
      expect(translate('project', 'en')).toBe('project'); // Note: clients/analytics/plans.ts override common.ts
      expect(translate('projectName', 'en')).toBe('Project Name');
      expect(translate('selectProject', 'en')).toBe('Select Project');
    });

    it('should handle milestone translations', () => {
      expect(translate('projectMilestones', 'en')).toBe('Project Milestones');
      expect(translate('milestonesComplete', 'en')).toBe('Milestones Complete');
      expect(translate('projectMilestones', 'ar')).toBe('معالم المشروع');
    });

    it('should handle notification translations', () => {
      expect(translate('notifications', 'en')).toBe('Notifications');
      expect(translate('markAllRead', 'en')).toBe('Mark All Read');
      expect(translate('noNotificationsYet', 'en')).toBe('No notifications yet');
    });

    it('should handle payment-related translations', () => {
      expect(translate('pendingPayment', 'en')).toBe('Pending Payment');
      expect(translate('paymentUnderReview', 'en')).toBe('Payment Under Review');
      expect(translate('uploadPaymentProof', 'en')).toBe('Upload Payment Proof:');
    });

    it('should handle contract translations', () => {
      expect(translate('approveContract', 'en')).toBe('Approve Contract');
      expect(translate('requestChanges', 'en')).toBe('Request Changes');
      expect(translate('viewContract', 'en')).toBe('View Contract');
    });

    it('should handle revision translations', () => {
      expect(translate('requestRevision', 'en')).toBe('Request Revision');
      expect(translate('revisionLimitReached', 'en')).toBe('Revision Limit Reached');
      expect(translate('unlimited', 'en')).toBe('Unlimited');
    });

    it('should handle case sensitivity correctly', () => {
      // Translation keys are case-sensitive
      expect(translate('loading', 'en')).toBe('Loading'); // Note: plans.ts overrides common.ts
      // @ts-expect-error Testing case sensitivity
      expect(translate('Loading' as any, 'en')).toBe('Loading'); // Returns key if not found
    });

    it('should work with all supported languages', () => {
      // English
      const enResult = translate('save', 'en');
      expect(enResult).toBe('Save');

      // Arabic
      const arResult = translate('save', 'ar');
      expect(arResult).toBe('حفظ');
    });
  });
});
