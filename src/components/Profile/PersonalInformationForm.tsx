
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Save, DollarSign } from 'lucide-react';
import { CURRENCIES, CurrencyCode } from '@/lib/currency';

interface PersonalInformationFormProps {
  formData: {
    name: string;
    email: string;
    company: string;
    website: string;
    bio: string;
    currency?: string;
  };
  isLoading: boolean;
  isSaved: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onCurrencyChange?: (currency: string) => void;
}

export const PersonalInformationForm = ({
  formData,
  isLoading,
  isSaved,
  onFormChange,
  onFormSubmit,
  onCancel,
  onCurrencyChange,
}: PersonalInformationFormProps) => {
  const handleCurrencyChange = (value: string) => {
    if (onCurrencyChange) {
      onCurrencyChange(value);
    }
  };

  return (
    <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={onFormChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={onFormChange}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                name="company"
                placeholder="Your company name"
                value={formData.company}
                onChange={onFormChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://yourwebsite.com"
                value={formData.website}
                onChange={onFormChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Preferred Currency</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
              <Select value={formData.currency || 'USD'} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                    <SelectItem key={code} value={code}>
                      {symbol} {name} ({code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tell clients about yourself and your expertise..."
              value={formData.bio}
              onChange={onFormChange}
            />
          </div>

          <Separator />

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                'Saving...'
              ) : isSaved ? (
                'Saved!'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
