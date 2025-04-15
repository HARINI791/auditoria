import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import './App.css';
import './components/Toast.css';
import { ToastContainer, Bounce } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';



function App() {
  return (

        <div>
           <Home /> 
            <ToastContainer 
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}/>
         </div>
         );
}
export default App;

// import React, { useState } from "react";
// //import Login from "./components/Login";
// //import Register from "./components/Register";
// //import EventsList from "./components/Eventslist";
// import AdminPage from "./components/AdminPage";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./components/Home";
// import "./App.css"; // Make sure to import your CSS file

// function App() {
//   //const [isLogin, setIsLogin] = useState(true);

//   return (
//     <div className="auth-page">
//        <Home />; 
//        <Route path="/admin" element={<AdminPage />} />
//      {/* <EventsList /> */}
//     </div>
//   );
// }

// export default App;
