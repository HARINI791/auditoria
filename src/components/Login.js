// import React, { useState } from "react";
// import { useDispatch } from "react-redux"; // ✅ Import useDispatch
// import { setMessage } from "./AuthSlice"; // ✅ Import setMessage action
// import "../App.css"; // Import shared styles

// const Login = ({ switchToRegister }) => {
//   const dispatch = useDispatch(); // ✅ Initialize Redux dispatch
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [errors, setErrors] = useState({});

//   const validateField = (name, value) => {
//     let newErrors = { ...errors };

//     if (name === "email") {
//       if (!value) newErrors.email = "Email is required.";
//       else delete newErrors.email;
//     }

//     /*if (name === "password") {
//       if (value.length < 6) newErrors.password = "Password must be at least 6 characters.";
//       else delete newErrors.password;
//     }*/

//     setErrors(newErrors);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//     validateField(name, value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (Object.keys(errors).length === 0) {
//       try {
//         const response = await fetch("http://localhost:5000/login", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(formData),
//         });

//         const data = await response.json();
//         dispatch(setMessage(data.message)); // ✅ Store login message in Redux

//       } catch (error) {
//         dispatch(setMessage("Server error, try again.")); // ✅ Store error message in Redux
//       }
//     }
//   };

//   return (
//     <div className="auth-container login-container">
//       <h2 className="auth-title">Login</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           name="email"
//           className="auth-input"
//           placeholder="Email"
//           autoComplete="off"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         />
//         {errors.email && <p className="error">{errors.email}</p>}

//         <input
//           type="password"
//           name="password"
//           className="auth-input"
//           placeholder="Password"
//           autoComplete="new-password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//         />
//         {errors.password && <p className="error">{errors.password}</p>}

//         <button type="submit" className="auth-button">
//           Sign In
//         </button>
//       </form>

//       <p className="auth-toggle">
//         {/* Don't have an account? <button onClick={switchToRegister}>Register</button> */}
//         Already have an account? <a href="#" onClick={switchToRegister}>Register</a>
//       </p>
//     </div>
//   );
// };

// export default Login;

// // import React, { useState } from "react";
// // import "../App.css"; // Import shared styles

// // const Login = ({ switchToRegister }) => {
// //   const [formData, setFormData] = useState({ email: "", password: "" });
// //   const [errors, setErrors] = useState({});

// //   const validateField = (name, value) => {
// //     let newErrors = { ...errors };

// //     if (name === "email") {
// //       if (!value) newErrors.email = "Email is required.";
// //       else delete newErrors.email;
// //     }

// //     if (name === "password") {
// //       if (value.length < 6) newErrors.password = "Password must be at least 6 characters.";
// //       else delete newErrors.password;
// //     }

// //     setErrors(newErrors);
// //   };

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData({ ...formData, [name]: value });
// //     validateField(name, value);
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     if (Object.keys(errors).length === 0) {
// //       try {
// //         const response = await fetch("http://localhost:5000/login", {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify(formData),
// //         });

// //         const data = await response.json();
// //         alert(data.message);
// //       } catch (error) {
// //         alert("Server error, try again.");
// //       }
// //     }
// //   };

// //   return (
// //     <div className="auth-container login-container">
// //       <h2 className="auth-title">Login</h2>
// //       <form onSubmit={handleSubmit}>
// //         <input
// //           type="email"
// //           name="email"
// //           className="auth-input"
// //           placeholder="Email"
// //           autoComplete="off"
// //           value={formData.email}
// //           onChange={handleChange}
// //           required
// //         />
// //         {errors.email && <p className="error">{errors.email}</p>}

// //         <input
// //           type="password"
// //           name="password"
// //           className="auth-input"
// //           placeholder="Password"
// //           autoComplete="new-password"
// //           value={formData.password}
// //           onChange={handleChange}
// //           required
// //         />
// //         {errors.password && <p className="error">{errors.password}</p>}

// //         <button type="submit" className="auth-button">
// //           Sign In
// //         </button>
// //       </form>

// //       <p className="auth-toggle">
// //         Don't have an account? <button onClick={switchToRegister}>Register</button>
// //       </p>
// //     </div>
// //   );
// // };

// // export default Login;

// // /*import { useState } from "react";

// // const Login = () => {
// //   const [formData, setFormData] = useState({ email: "", password: "" });
// //   const [errors, setErrors] = useState({});

// //   const validateField = (name, value) => {
// //     let newErrors = { ...errors };

// //     if (name === "email") {
// //       if (!value) newErrors.email = "Email is required.";
// //       else delete newErrors.email;
// //     }

// //     if (name === "password") {
// //       if (value.length < 6) newErrors.password = "Password must be at least 6 characters.";
// //       else delete newErrors.password;
// //     }

// //     setErrors(newErrors);
// //   };

// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     if (Object.keys(errors).length === 0) {
// //       try {
// //         const response = await fetch("http://localhost:5000/login", {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify(formData),
// //         });

// //         const data = await response.json();
// //         alert(data.message);
// //       } catch (error) {
// //         alert("Server error, try again.");
// //       }
// //     }
// //   };

// //   return (
// //     <div>
// //       <h2>Login</h2>
// //       <form onSubmit={handleSubmit}>
// //         <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
// //         {errors.email && <p>{errors.email}</p>}
        
// //         <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
// //         {errors.password && <p>{errors.password}</p>}
        
// //         <button type="submit">Login</button>
// //       </form>
// //     </div>
// //   );
// // };

// // export default Login;*/

 // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await fetch("http://localhost:5000/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(formData),
  //     });

  //     const data = await response.json();

  //    console.log(data.message);
  //     toast(data.message);

      
  //     dispatch(setMessage(data.message));  // Store message
  //     dispatch(setUserEmail(formData.email)); // ✅ Store user email in Redux
  //      // 🔥 Delay redirect by 1.5 seconds
  //      setTimeout(() => {
  //       navigate("/eventsList");
  //     }, 1500);


  //   } catch (error) {
  //     //dispatch(setMessage("Server error, try again."));
  //     toast.error("Server error, try again."); // ✅ Error message
     
  //   }
  // };


import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUserEmail } from "./EmailSlice"; // Import setUserEmail
import { setMessage } from "./AuthSlice";
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
        toast.success(data.message);  // Show success message
  
        // Delay navigation after toast
        setTimeout(() => {
          navigate("/eventsList");
        }, 1500);  // Wait for 1.5 seconds before redirecting
      } else {
        toast.error(data.message || "Login failed");
      }
  
      dispatch(setMessage(data.message));  // Store message
      dispatch(setUserEmail(formData.email)); // ✅ Store user email in Redux
  
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
        <button
  type="button"  // <--- Add this to prevent form submission
  className="auth-button"
  onClick={() => navigate("/")}
>
  Back
</button>

         {/* <button className="auth-button" onClick={() => navigate("/")} >Back</button> */}
        <button type="submit" className="auth-button" >Sign In</button>
     
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
