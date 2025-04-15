import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
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

export const { setMessage, clearMessage } = adminSlice.actions;
export default adminSlice.reducer;
