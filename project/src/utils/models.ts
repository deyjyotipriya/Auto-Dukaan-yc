// Define common models used throughout the application

export class User {
  id: string;
  businessName: string;
  businessCategory: string;
  businessLocation: string;
  upiId: string;
  language: 'en' | 'hi' | 'hinglish' | 'bn' | 'banglish';
  profileImage: string | null;
  isOnboarded: boolean;

  constructor(data: Partial<User> = {}) {
    this.id = data.id || '';
    this.businessName = data.businessName || '';
    this.businessCategory = data.businessCategory || '';
    this.businessLocation = data.businessLocation || '';
    this.upiId = data.upiId || '';
    this.language = data.language || 'en';
    this.profileImage = data.profileImage || null;
    this.isOnboarded = data.isOnboarded || false;
  }
}

export default {
  User
};