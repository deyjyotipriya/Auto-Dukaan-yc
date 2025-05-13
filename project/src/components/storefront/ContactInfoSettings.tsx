import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle 
} from 'lucide-react';
import { StorefrontConfig } from '../../services/StorefrontService';

interface ContactInfoSettingsProps {
  contactInfo: StorefrontConfig['contactInfo'];
  onUpdate: (updates: Partial<StorefrontConfig['contactInfo']>) => void;
}

const ContactInfoSettings: React.FC<ContactInfoSettingsProps> = ({
  contactInfo,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState(contactInfo.email || '');
  const [phone, setPhone] = useState(contactInfo.phone || '');
  const [address, setAddress] = useState(contactInfo.address || '');
  const [whatsapp, setWhatsapp] = useState(contactInfo.whatsapp || '');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\+?[0-9]{10,15}$/.test(phone);
  };

  const handleSave = () => {
    const updates: Partial<StorefrontConfig['contactInfo']> = {};
    
    if (email && validateEmail(email)) {
      updates.email = email;
    }
    
    if (phone && validatePhone(phone)) {
      updates.phone = phone;
    }
    
    if (address) {
      updates.address = address;
    }
    
    if (whatsapp && validatePhone(whatsapp)) {
      updates.whatsapp = whatsapp;
    }
    
    onUpdate(updates);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">{t('storefront.contact.title')}</h3>
        <p className="text-sm text-gray-600 mb-5">
          {t('storefront.contact.description')}
        </p>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                {t('storefront.contact.email')}
              </div>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('storefront.contact.emailPlaceholder')}
            />
            {email && !validateEmail(email) && (
              <p className="mt-1 text-sm text-red-600">
                {t('storefront.contact.emailInvalid')}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {t('storefront.contact.emailHelp')}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                {t('storefront.contact.phone')}
              </div>
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('storefront.contact.phonePlaceholder')}
            />
            {phone && !validatePhone(phone) && (
              <p className="mt-1 text-sm text-red-600">
                {t('storefront.contact.phoneInvalid')}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {t('storefront.contact.phoneHelp')}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                {t('storefront.contact.address')}
              </div>
            </label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('storefront.contact.addressPlaceholder')}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('storefront.contact.addressHelp')}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2 text-gray-500" />
                {t('storefront.contact.whatsapp')}
              </div>
            </label>
            <Input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder={t('storefront.contact.whatsappPlaceholder')}
            />
            {whatsapp && !validatePhone(whatsapp) && (
              <p className="mt-1 text-sm text-red-600">
                {t('storefront.contact.whatsappInvalid')}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {t('storefront.contact.whatsappHelp')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">{t('storefront.contact.businessHours')}</h3>
        
        <div className="p-4 bg-blue-50 text-blue-800 rounded-md text-sm mb-4">
          <p>{t('storefront.contact.businessHoursInfo')}</p>
        </div>
        
        {/* Business hours configuration would go here */}
        <p className="text-sm text-gray-500">
          {t('storefront.contact.businessHoursHelp')}
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>{t('common.save')}</Button>
      </div>
    </div>
  );
};

export default ContactInfoSettings;