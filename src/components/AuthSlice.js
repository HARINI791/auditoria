import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    message: "", // Stores the login alert message
  },
  reducers: {
    setMessage: (state, action) => {
      state.message = action.payload; // Updates message from login
    },
    clearMessage: (state) => {
      state.message = ""; // Clears message when needed
    },
  },
});

export const { setMessage, clearMessage } = authSlice.actions;
export default authSlice.reducer;



