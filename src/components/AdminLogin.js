import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setMessage } from "./AdminSlice"; // Make sure AuthSlice exists
//import "../App.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // also add this if not done yet

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
    dispatch(setMessage(data.message)); // ✅ Store login message in Redux

    if (!response.ok) {
      setServerError(data.message); // Show error message
      toast.error(data.message); // Show error toast
      return;
    }

    dispatch(setMessage(data.message)); // Store success message in Redux
    toast.success("Login successful!"); // Show success toast
    
    // Navigate to the admin panel after login
    navigate("/adminPanel");

  } catch (error) {
    dispatch(setMessage("Server error, try again.")); // ✅ Store error message in Redux
    setServerError("Server error, try again.");
    toast.error("Server error, try again."); // Show error toast
  }
};

  // const handleAdminLogin = async (e) => {
  //   e.preventDefault();

  //   // Ensure no validation errors
  //   if (Object.keys(errors).length > 0) {
  //     setServerError("Please fix the errors before submitting.");
  //     return;
  //   }

  //   try {
  //     const response = await fetch("http://localhost:5000/adminlogin", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(formData),
  //     });

  //     const data = await response.json();
  //     dispatch(setMessage(data.message)); // ✅ Store login message in Redux

  //     if (!response.ok) {
  //       setServerError(data.message); // Show error message
  //       return;
  //     }

  //     dispatch(setMessage(data.message)); // Store success message in Redux
  //     alert("Login successful!");
  //     // Redirect admin or set auth state here if needed

  //   } catch (error) {
  //     dispatch(setMessage("Server error, try again.")); // ✅ Store error message in Redux
  //     setServerError("Server error, try again.");
  //   }
  // };

  return (
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
        
        <button
  type="button"  // <--- Add this to prevent form submission
  className="auth-button"
  onClick={() => navigate("/")}
>
  Back
</button>

        <button type="submit" className="auth-button">Login</button>
      </form>

      <ToastContainer/>

    </div>

  );
};

export default AdminLogin;
