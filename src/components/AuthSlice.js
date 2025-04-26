import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    message: "", // Stores the login alert message
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    userType: localStorage.getItem('userType') || null // 'user' or 'admin'
  },
  reducers: {
    setMessage: (state, action) => {
      state.message = action.payload; // Updates message from login
    },
    clearMessage: (state) => {
      state.message = ""; // Clears message when needed
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      localStorage.setItem('token', action.payload);
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
      localStorage.setItem('userType', action.payload);
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.userType = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('userEmail');
    }
  },
});

export const { setMessage, clearMessage, setToken, setUserType, logout } = authSlice.actions;
export default authSlice.reducer;



