import { createSlice } from "@reduxjs/toolkit";

const emailSlice = createSlice({
  name: "email",
  initialState: {
    userEmail: null,
    message: "",
  },
  reducers: {
    setUserEmail: (state, action) => {
      state.userEmail = action.payload;
    },
    // setMessage: (state, action) => {
    //   state.message = action.payload;
    // },
  },
});

export const { setUserEmail } = emailSlice.actions;
export default emailSlice.reducer;
