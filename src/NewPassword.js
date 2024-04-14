import './NewPassword.css';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { auth } from './firebase'; // Ensure this path is correct
import { sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


function NewPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      setError('');
    } catch (error) {
      setError("Email does not exist.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const actionCode = window.location.href; 
      await updatePassword(auth.currentUser, newPassword);
      setError('');
      setSuccessMessage('Password has been successfully changed.'); // Set success message
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
      <div className="NewPassword">
        {!isEmailSent ? (
          <form onSubmit={handleResetPassword}>
            <label htmlFor="email">Email</label> <br />
            <input type="text" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required /> <br /><br />
            <input type="submit" value="Reset Password" />
          </form>
        ) : (
          <form onSubmit={handleChangePassword}>
            <label htmlFor="newPassword">New Password</label> <br />
            <input type="password" id="newPassword" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /> <br /><br />
            <label htmlFor="confirmPassword">Confirm Password</label> <br />
            <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /> <br /><br />
            <input type="submit" value="Change Password" />
          </form>
        )}
      </div>
      {successMessage && <div className="success">{successMessage}</div>}
      {error && <div className="error">{error}</div>}
      <div>
        <button><Link to='/'>Back</Link></button>
      </div>
    </body>
  );
}

export default NewPassword;