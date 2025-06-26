import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  language: string;
  isRTL: boolean;
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  language: 'en',
  isRTL: false,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      state.isRTL = action.payload === 'ar';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

export const { setLanguage, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
