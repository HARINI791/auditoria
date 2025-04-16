import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setMessage, setToken, setUserType } from "./AuthSlice";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminLogin.css';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  // 🔹 Validate fields
  const validateField = (name, value) => {
    let newErrors = { ...errors };

    if (name === "email") {
      if (!value.trim()) newErrors.email = "Email is required.";
      else delete newErrors.email;
    }

    setErrors(newErrors);
  };

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  // 🔹 Handle login submission
  const handleAdminLogin = async (e) => {
    e.preventDefault();

    // Ensure no validation errors
    if (Object.keys(errors).length > 0) {
      setServerError("Please fix the errors before submitting.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/adminlogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.message === "Login successful") {
        // Store token and user type
        dispatch(setToken(data.token));
        dispatch(setUserType('admin'));
        dispatch(setMessage(data.message));

        toast.success(data.message);

        setTimeout(() => {
          navigate("/adminPanel");
        }, 1500);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      setServerError("Server error, try again.");
      toast.error("Server error, try again.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container login-container">
        <h2 className="auth-title">Admin Login</h2>
        {/* {serverError && <p className="error">{serverError}</p>} */}

        <form onSubmit={handleAdminLogin}>
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
          {errors.email && <p className="error">{errors.email}</p>}

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
          {errors.password && <p className="error">{errors.password}</p>}
          <div className="auth-button-row">
            <button
              type="button"
              className="auth-button"
              onClick={() => navigate("/")}
            >
              Back
            </button>
            <button type="submit" className="auth-button">Login</button>
          </div>
        </form>

        <ToastContainer/>

      </div>
    </div>
  );
};

export default AdminLogin;