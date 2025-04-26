import { createSlice } from "@reduxjs/toolkit";

const emailSlice = createSlice({
  name: "email",
  initialState: {
    userEmail: localStorage.getItem('userEmail') || null,
    message: "",
  },
  reducers: {
    setUserEmail: (state, action) => {
      state.userEmail = action.payload;
      localStorage.setItem('userEmail', action.payload);
    },
    clearUserEmail: (state) => {
      state.userEmail = null;
      localStorage.removeItem('userEmail');
    }
  },
});

export const { setUserEmail, clearUserEmail } = emailSlice.actions;
export default emailSlice.reducer;
