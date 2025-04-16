import React, { useState } from "react";
//import "../App.css"; // Import shared styles
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // also add this if not done yet


const Register = ({ switchToLogin }) => {
  const [hover, setHover] = useState(false);
  const [formData, setFormData] = useState({ email: "", id: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); 
  const validateField = (name, value) => {
    let newErrors = { ...errors };

    if (name === "email") {
      if (!value) newErrors.email = "Email is required.";
      else if (!value.endsWith("@rguktn.ac.in"))
        newErrors.email = "Use your institutional email (user@rguktn.ac.in).";
      else delete newErrors.email;
    }

    if (name === "id") {
      if (!/^(n|N)\d{6}$/.test(value)) newErrors.id = "Invalid ID format.";
      else delete newErrors.id;
    }

    if (name === "password") {
      if (value.length < 6) newErrors.password = "Password must be at least 6 characters.";
      else delete newErrors.password;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetch("http://localhost:5000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        toast.success(data.message);
      } catch (error) {
        toast.error("Server error, try again.");
      }
    }
  };

  return (
    <div className="auth-container register-container">
      <h2 className="auth-title">Register</h2>
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
        {errors.email && <p className="error">{errors.email}</p>}

        <input
          type="text"
          name="id"
          className="auth-input"
          placeholder="ID"
          value={formData.id}
          onChange={handleChange}
          required
        />
        {errors.id && <p className="error">{errors.id}</p>}

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
          <button className="auth-button" type="button" onClick={() => navigate("/")}>Back</button>
          <button type="submit" className="auth-button">Sign Up</button>
        </div>
      </form>
      <p>
     Already have an account?{" "}
      <span
        onClick={switchToLogin}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          color: hover ? "#00bcd4" : "#00ffff",
          textDecoration: "none",
          cursor: "pointer",
          transition: "color 0.3s ease",
        }}
      >
        Login
      </span>
    </p>
      {/* <p>
        Already have an account? <button onClick={switchToLogin} className="isRegister">Login</button>
      </p> */}

<ToastContainer/>

    </div>
  );
};

export default Register;

/*import { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({ email: "", id: "", password: "" });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let newErrors = { ...errors };

    if (name === "email") {
      if (!value) newErrors.email = "Email is required.";
      else if (!value.endsWith("@rguktn.ac.in"))
        newErrors.email = "Use your institutional email (user@rguktn.ac.in).";
      else delete newErrors.email;
    }

    if (name === "id") {
      if (!/^(n|N)\d{6}$/.test(value)) newErrors.id = "Invalid ID format.";
      else delete newErrors.id;
    }

    if (name === "password") {
      if (value.length < 6) newErrors.password = "Password must be at least 6 characters.";
      else delete newErrors.password;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetch("http://localhost:5000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        alert(data.message);
      } catch (error) {
        alert("Server error, try again.");
      }
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        {errors.email && <p>{errors.email}</p>}
        
        <input type="text" name="id" placeholder="ID" onChange={handleChange} required />
        {errors.id && <p>{errors.id}</p>}
        
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        {errors.password && <p>{errors.password}</p>}
        
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;*/
