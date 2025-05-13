import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

export interface UserState {
  isOnboarded: boolean;
  businessName: string;
  businessCategory: string;
  businessLocation: string;
  upiId: string;
  language: 'en' | 'hi' | 'hinglish' | 'bn' | 'banglish';
  profileImage: string | null;
}

const initialState: UserState = {
  isOnboarded: false,
  businessName: '',
  businessCategory: '',
  businessLocation: '',
  upiId: '',
  language: 'en',
  profileImage: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setOnboardingData: (state, action: PayloadAction<Omit<UserState, 'isOnboarded' | 'language' | 'profileImage'>>) => {
      return {
        ...state,
        ...action.payload,
        isOnboarded: true,
      };
    },
    setLanguage: (state, action: PayloadAction<UserState['language']>) => {
      state.language = action.payload;
    },
    setProfileImage: (state, action: PayloadAction<string>) => {
      state.profileImage = action.payload;
    },
    logout: () => initialState,
  },
});

export const { setOnboardingData, setLanguage, setProfileImage, logout } = userSlice.actions;

export const selectIsOnboarded = (state: RootState) => state.user.isOnboarded;
export const selectBusinessName = (state: RootState) => state.user.businessName;
export const selectLanguage = (state: RootState) => state.user.language;
export const selectUser = (state: RootState) => state.user;

export default userSlice.reducer;