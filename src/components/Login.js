import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUserEmail } from "./EmailSlice";
import { setMessage, setToken, setUserType } from "./AuthSlice";
import { useNavigate } from "react-router-dom";
//import toast, {Toaster}from 'react-hot-toast';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // also add this if not done yet


const Login = ({ switchToRegister }) => {
  const [hover, setHover] = useState(false);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
 
  const navigate = useNavigate(); 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      console.log(data.message);
  
      if (data.message === "Login successful") {
        // Store token and user type
        dispatch(setToken(data.token));
        dispatch(setUserType('user'));
        dispatch(setUserEmail(formData.email));
        dispatch(setMessage(data.message));
  
        toast.success(data.message);  // Show success message
  
        // Delay navigation after toast
        setTimeout(() => {
          navigate("/eventsList");
        }, 1500);  // Wait for 1.5 seconds before redirecting
      } else {
        toast.error(data.message || "Login failed");
      }
  
    } catch (error) {
      toast.error("Server error, try again.");
    }
  };

  return (
    <div className="auth-container login-container">
      <h2 className="auth-title">Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          className="auth-input"
          placeholder="Email"
          autoComplete="off"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          className="auth-input"
          placeholder="Password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <div className="auth-button-row">
          <button
            type="button"
            className="auth-button"
            onClick={() => navigate("/")}
          >
            Back
          </button>
          <button type="submit" className="auth-button">Sign In</button>
        </div>
      </form>
      <p>
      Don't have an account?{" "}
      <span
        onClick={switchToRegister}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          color: hover ? "#00bcd4" : "#00ffff",
          textDecoration: "none",
          cursor: "pointer",
          transition: "color 0.3s ease",
        }}
      >
        Register
      </span>
    </p>

    <ToastContainer/>
     
   

      {/* <p>
        Don't have an account? <button onClick={switchToRegister} >Register</button>
      </p> */}

    </div>
  );
};

export default Login;
