import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Account.css';
import { useState, useEffect } from 'react';
import './General.css';
import './Account.css';

import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import { auth, database } from './firebase';

const Account = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [name, setName] = useState('');
  const [dob, setDOB] = useState('');
  const [adelphiID, setAdelphiID] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    // Fetch user's email from Firebase Auth
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserEmail(currentUser.email);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const databaseRef = database.ref('users');
    // Prepare user data object
    const userData = {
      name: name,
      dob: dob,
      adelphiID: adelphiID,
      email: userEmail,
      // Add more fields if needed
    };

    // Save user data to Firebase Realtime Database
    database.ref('users/' + auth.currentUser.uid).set(userData)
      .then(() => {
        console.log('User data saved successfully');
        // You may want to show a success message to the user
      })
      .catch((error) => {
        console.error('Error saving user data:', error);
        // Handle error, display error message to the user, etc.
      });
  };
  return (
    <div className="App">
      <div className="Header">
        <header className="App-header">
          <SideNav
            onSelect={(selected) => {
              if(selected === "LogOut")
              {
                navigate("/");
              } else {
                const to = '/' + selected;
                navigate(to);
              }
            }}
            className="sidenav"
          >
            <Toggle />
            <Nav>
              <NavItem eventKey="ScheduleBuilder">
                <NavIcon>
                  <img className='sideNavIcon' src={require('./images/schedule.png')} alt='Schedule Builder' />
                </NavIcon>
                <NavText>
                  Schedule Builder
                </NavText>
              </NavItem>
              <NavItem eventKey="CourseMaps">
                <NavIcon>
                  <img className='sideNavIcon' src={require('./images/map.png')} alt='Course Maps' />
                </NavIcon>
                <NavText>
                  Course Maps
                </NavText>
              </NavItem>
              <NavItem eventKey="Account">
                <NavIcon>
                  <img className='sideNavIcon' src={require('./images/account.png')} alt='Account' />
                </NavIcon>
                <NavText>
                  Account
                </NavText>
              </NavItem>
              <NavItem eventKey="About">
                <NavIcon>
                  <img className='sideNavIcon' src={require('./images/info.png')} alt='About' />
                </NavIcon>
                <NavText>
                  About
                </NavText>
              </NavItem>
              <NavItem eventKey="LogOut">
                <NavIcon>
                  <img className='sideNavIcon' src={require('./images/logout.png')} alt='Log out' />
                </NavIcon>
                <NavText>
                  Logout
                </NavText>
              </NavItem>
            </Nav>
          </SideNav>
          <div className="logo" style={{ fontSize: 60 }}>
            Account
          </div>
        </header>
      </div>
      <div className="Profile">
      <div className="ProfileImage">
          <input type="file" onChange={handleImageChange} />
          {image && (
            <img src={image} alt="Profile" style={{ width: 520, height: 400 }} />
          )}
        </div>
        <div className="ProfileInfo">
          {/* Display user's email */}
          <p>Name: <input type="text" value={name} onChange={(e) => setName(e.target.value)} /></p>
          {/* make input type "date" and "number" */}
          <p>DOB: <input type="text" value={dob} onChange={(e) => setDOB(e.target.value)} /></p>
          <p>Adelphi ID number: <input type="text" value={adelphiID} onChange={(e) => setAdelphiID(e.target.value)} /></p>
          <p>Adelphi Email: {userEmail}</p>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}> {}
        <button onClick={handleSave}>Save</button>
        <button><Link to='/'>Log Out</Link></button>
      </div>
    </div>
  );
}

export default Account;