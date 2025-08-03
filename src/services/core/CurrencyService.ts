import { User } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { CurrencyCode, formatCurrency as formatCurrencyUtil, getCurrencySymbol } from '@/lib/currency';

export interface UserCurrencyData {
  currency: CurrencyCode;
  language: 'en' | 'ar';
}

export class CurrencyService extends BaseService {
  constructor(user: User | null) {
    super(user);
  }

  /**
   * Get user's preferred currency from their profile
   */
  async getUserCurrency(): Promise<CurrencyCode> {
    if (!this.user) {
      return 'USD';
    }

    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('currency')
        .eq('id', this.user.id)
        .single();

      if (error) {
        this.logOperation('get_user_currency_error', { error: error.message });
        return 'USD';
      }

      return (profile?.currency as CurrencyCode) || 'USD';
    } catch (error) {
      console.error('Error fetching user currency:', error);
      return 'USD';
    }
  }

  /**
   * Get user's language preference based on country
   */
  async getUserLanguage(): Promise<'en' | 'ar'> {
    if (!this.user) {
      return 'en';
    }

    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('country')
        .eq('id', this.user.id)
        .single();

      if (error) {
        return 'en';
      }

      // Arabic for Saudi Arabia and UAE
      return profile?.country === 'SA' || profile?.country === 'AE' ? 'ar' : 'en';
    } catch (error) {
      console.error('Error fetching user language:', error);
      return 'en';
    }
  }

  /**
   * Get complete user currency data (currency + language)
   */
  async getUserCurrencyData(): Promise<UserCurrencyData> {
    if (!this.user) {
      return { currency: 'USD', language: 'en' };
    }

    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('currency, country')
        .eq('id', this.user.id)
        .single();

      if (error) {
        this.logOperation('get_user_currency_data_error', { error: error.message });
        return { currency: 'USD', language: 'en' };
      }

      const currency = (profile?.currency as CurrencyCode) || 'USD';
      const language = profile?.country === 'SA' || profile?.country === 'AE' ? 'ar' : 'en';

      return { currency, language };
    } catch (error) {
      console.error('Error fetching user currency data:', error);
      return { currency: 'USD', language: 'en' };
    }
  }

  /**
   * Format currency amount using user's preferences
   */
  async formatCurrencyForUser(amount: number): Promise<string> {
    const { currency, language } = await this.getUserCurrencyData();
    return formatCurrencyUtil(amount, currency, language);
  }

  /**
   * Format currency with specific currency and language
   */
  formatCurrency(amount: number, currency: CurrencyCode = 'USD', language: 'en' | 'ar' = 'en'): string {
    return formatCurrencyUtil(amount, currency, language);
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(currency: CurrencyCode = 'USD', language: 'en' | 'ar' = 'en'): string {
    return getCurrencySymbol(currency, language);
  }

  /**
   * Validate currency code
   */
  isValidCurrency(currency: string): currency is CurrencyCode {
    return Object.prototype.hasOwnProperty.call(formatCurrencyUtil as any, currency);
  }

  /**
   * Update user's preferred currency
   */
  async updateUserCurrency(currency: CurrencyCode): Promise<void> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    if (!this.isValidCurrency(currency)) {
      throw new Error('Invalid currency code');
    }

    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({ currency })
        .eq('id', this.user.id);

      if (error) {
        throw new Error(error.message);
      }

      this.logOperation('user_currency_updated', { currency });
    } catch (error) {
      return this.handleError(error, 'updateUserCurrency');
    }
  }
}