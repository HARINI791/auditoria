import React, { useState } from "react";
import { FaTimes } from "react-icons/fa"; // Import close icon
import Login from "./Login";
import Register from "./Register";

function AuthPage({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      {/* Close icon */}
      {/* <button className="close-button" onClick={onClose}>
        <FaTimes />
      </button> */}

      {isLogin ? (
        <Login switchToRegister={() => setIsLogin(false)} />
      ) : (
        <Register switchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
}

export default AuthPage;
// import React, { useState } from "react";
// import Login from "./Login";
// import Register from "./Register";
// //import Home from "./components/Home";
// //import "./App.css"; // Make sure to import your CSS file

// function AuthPage() {
//   const [isLogin, setIsLogin] = useState(true);

//   return (
//     <div className="auth-page">
    
//       {isLogin ? (
//         <Login switchToRegister={() => setIsLogin(false)} />
//       ) : (
//         <Register switchToLogin={() => setIsLogin(true)} />
//       )} 
//     </div>
//   );
// }

// export default AuthPage;
