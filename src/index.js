import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./components/Store"; // Import Redux store
import App from "./App"; // Import main App component

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />  {/* This should contain Home component */}
    </BrowserRouter>
  </Provider>
);


// import React from "react";


// import React from "react";
// import ReactDOM from "react-dom/client";
// import { Provider } from "react-redux";
// import store from "./components/Store";
// import App from "./App";
// import { BrowserRouter } from "react-router-dom";
// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <Provider store={store}>
//     <BrowserRouter>
//     <App />
//     </BrowserRouter>
//   </Provider>,
//   document.getElementById("root")
// );

// // import ReactDOM from "react-dom/client"; // ✅ Use createRoot instead of render
// // import { Provider } from "react-redux"; // ✅ Import Redux Provider
// // import store from "./components/Store"; // ✅ Import your Redux store
// // import App from "./App";

// // const root = ReactDOM.createRoot(document.getElementById("root")); // ✅ Use createRoot
// // root.render(
// //   <React.StrictMode>
// //     <Provider store={store}> 
// //       <App />
// //     </Provider>
// //   </React.StrictMode>
// // );
