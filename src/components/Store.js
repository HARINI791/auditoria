// import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "./AuthSlice";
// import adminReducer from "./AdminSlice";

// const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     admin: adminReducer
//   },
// });

// export default store;


import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthSlice";
import adminReducer from "./AdminSlice";
import emailReducer from "./EmailSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    email: emailReducer
  },
});

export default store;

