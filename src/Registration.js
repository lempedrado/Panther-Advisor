import './Registration.css';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './firebase'; // Adjust the path as necessary
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';

function Registration() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      // Create user with email and password
      await createUserWithEmailAndPassword(auth, email, password);
      // Redirect to login screen after successful registration
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <body className="App">
      <div className="Header">
        <header className="App-header">
          <div className="logo" style={{ fontSize: 60 }}>Panther Advisor</div>
        </header>
      </div>
      <div className="Login">
        <form onSubmit={handleRegister}> {/* Add an onSubmit event here */}
          <label htmlFor="email">Email</label> <br />
          <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required /> <br /><br />
          <label htmlFor="password">Password</label> <br />
          <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required /> <br /><br />
          <label htmlFor="confirmPassword">Confirm Password</label> <br />
          <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /> <br /><br />
          <button type="submit">Confirm</button> {/* Change this to a submit button */}
        </form>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <button><Link to='/'>Back</Link></button>
      </div>
    </body>
  );
}

export default Registration;