import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './CSS/Loginsignup.css';

const LoginSignup = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState("Login");
  const [agree, setAgree] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setState("Sign Up");
    } else if (mode === "login") {
      setState("Login");
    }
  }, [searchParams]);

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!agree) {
      alert("Please accept the terms of use and privacy policy to continue.");
      return;
    }
    if (state === "Sign Up" && !formData.username.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!formData.email.trim() || !formData.password.trim()) {
      alert("Please enter both email and password.");
      return;
    }
    const BACKEND_URL = "http://localhost:4000"; 
    const endpoint = state === "Sign Up" 
      ? `${BACKEND_URL}/api/auth/signup` 
      : `${BACKEND_URL}/api/auth/login`;

    const payload = state === "Sign Up" 
      ? { name: formData.username, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        if (state === "Sign Up") {
          alert(data.message || "Account created successfully! Please log in.");
          setState("Login");
          return;
        }
        const userRole = data.user?.role || 'User';
        const token = data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data.user || { email: formData.email, role: userRole }));
        alert("Login successful!");
        if (userRole === 'Admin') {
          window.location.replace("/admin");
        } else {
          window.location.replace("/");
        }
      } else {
        alert(data.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("Authentication Error:", error);
      alert("Cannot connect to server. Check server terminal logs.");
    }
  };

  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>{state}</h1>
        
        <div className='loginsignup-fields'>
          {state === "Sign Up" && (
            <input 
              name='username' 
              value={formData.username} 
              onChange={changeHandler} 
              type="text" 
              placeholder='Your Name' 
            />
          )}
          <input 
            name='email' 
            value={formData.email}
            onChange={changeHandler} 
            type="email" 
            placeholder='Email Address' 
          />
          <input 
            name='password' 
            value={formData.password} 
            onChange={changeHandler} 
            type="password" 
            placeholder='Password' 
          />
        </div>

        <button onClick={handleSubmit}>Continue</button>

        {state === "Sign Up" ? (
          <p className='loginsignup-login'>
            Already have an account? <span onClick={() => setState("Login")}>Login here</span>
          </p>
        ) : (
          <p className='loginsignup-login'>
            Create an account? <span onClick={() => setState("Sign Up")}>Click here</span>
          </p>
        )}

        <div className='loginsignup-agree'>
          <input 
            type="checkbox" 
            id='agree-check' 
            checked={agree} 
            onChange={(e) => setAgree(e.target.checked)} 
          />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;