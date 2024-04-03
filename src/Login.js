import './General.css';
import './Login.css';
import {Link} from 'react-router-dom';
import { auth } from './firebase';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/ScheduleBuilder');
      // If login is successful, you can redirect the user to another page
    } catch (error) {
      setError("Invalid Credentials");
    }
  };

  return (
    <body className="App">
      <div className="Header">
        <header className="App-header">
          <div className="logo" style={{ fontSize: 60 }}>Panther Advisor</div>
        </header>
      </div>
      <img src='/pantherLogo.png' className="App-logo" alt="logo" />
      <div className="Login">
        <label htmlFor="email">Email</label> <br />
        <input type="text" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} /> <br /><br />
        <label htmlFor="password">Password</label> <br />
        <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} /> <br /><br />
        <button onClick={handleLogin}>Login</button>
      </div>
      {error && <div className="error" style={{ margin: '10px 0', color: 'red' }}>{error}</div>}
      <div>
        <button><Link to='/Registration'>Create Account</Link></button>
        <button><Link to='/NewPassword'>Forgot Password?</Link></button>
        <Link to='/ScheduleBuilder'>Continue as Guest</Link>
      </div>
    </body>
  );
}

export default Login;