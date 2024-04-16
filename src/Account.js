import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Account.css';
import { useState, useEffect } from 'react';
import './General.css';
import './Account.css';

import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import { ref as dbRef, set, get } from 'firebase/database';  
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { auth, database, storage } from './firebase';

const Account = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [name, setName] = useState('');
  const [dob, setDOB] = useState('');
  const [adelphiID, setAdelphiID] = useState('');
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  useEffect(() => {
      const currentUser = auth.currentUser;
      if (currentUser) {
          setUserEmail(currentUser.email);
          get(dbRef(database, 'users/' + currentUser.uid))
              .then((snapshot) => {
                  if (snapshot.exists()) {
                      const userData = snapshot.val();
                      setName(userData.name);
                      setDOB(userData.dob);
                      setAdelphiID(userData.adelphiID);
                      setImageURL(userData.imageURL || '');
                      setUserDataLoaded(true);
                  } else {
                      console.log('No user data available');
                  }
              })
              .catch((error) => {
                  console.error('Error fetching user data:', error);
              });
      }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageURL(reader.result);
        };
        reader.readAsDataURL(file);
    }
};

const handleSave = () => {
  const userRef = dbRef(database, 'users/' + auth.currentUser.uid);
  const userData = {
      name,
      dob,
      adelphiID,
      email: userEmail,
      imageURL: imageURL // Save the image URL along with user data
  };

  set(userRef, userData) // Save user data to the database
  .then(() => {
      // Reset the image and imageURL states
      setImage(null);
      setImageURL('');

      // Reload user data to update the UI
      get(dbRef(database, 'users/' + auth.currentUser.uid))
          .then((snapshot) => {
              if (snapshot.exists()) {
                  const userData = snapshot.val();
                  setName(userData.name);
                  setDOB(userData.dob);
                  setAdelphiID(userData.adelphiID);
                  setImageURL(userData.imageURL || '');
                  setUserDataLoaded(true);
              } else {
                  console.log('No user data available');
              }
          })
          .catch((error) => {
              console.error('Error fetching user data:', error);
          });
  })
  .catch((error) => {
      console.error('Error saving user data:', error);
  });
};

  return (
      <div className="App">
          <div className="Header">
              <header className="App-header">
                  <SideNav
                      onSelect={(selected) => {
                          if(selected === "LogOut") {
                              navigate("/");
                          } else {
                              navigate('/' + selected);
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
                              <NavText>Schedule Builder</NavText>
                          </NavItem>
                          <NavItem eventKey="CourseMaps">
                              <NavIcon>
                                  <img className='sideNavIcon' src={require('./images/map.png')} alt='Course Maps' />
                              </NavIcon>
                              <NavText>Course Maps</NavText>
                          </NavItem>
                          <NavItem eventKey="Account">
                              <NavIcon>
                                  <img className='sideNavIcon' src={require('./images/account.png')} alt='Account' />
                              </NavIcon>
                              <NavText>Account</NavText>
                          </NavItem>
                          <NavItem eventKey="About">
                              <NavIcon>
                                  <img className='sideNavIcon' src={require('./images/info.png')} alt='About' />
                              </NavIcon>
                              <NavText>About</NavText>
                          </NavItem>
                          <NavItem eventKey="LogOut">
                              <NavIcon>
                                  <img className='sideNavIcon' src={require('./images/logout.png')} alt='Log out' />
                              </NavIcon>
                              <NavText>Logout</NavText>
                          </NavItem>
                      </Nav>
                  </SideNav>
                  <div className="logo" style={{ fontSize: 60 }}>Account</div>
              </header>
          </div>
          <div className="Profile">
          <div className="ProfileImage">
            <div className="file-upload-container">
                <input type="file" onChange={handleImageChange} />
            </div>
            {imageURL && <img src={imageURL} alt="Profile" className="centered-image" />}
        </div>
              <div className="ProfileInfo">
                  {userDataLoaded ? (
                      <>
                          <p>Name: {name}</p>
                          <p>DOB: {dob}</p>
                          <p>Adelphi ID number: {adelphiID}</p>
                          <p>Adelphi Email: {userEmail}</p>
                      </>
                  ) : (
                      <>
                          <p>Name: <input type="text" value={name} onChange={(e) => setName(e.target.value)} /></p>
                          <p>DOB: <input type="date" value={dob} onChange={(e) => setDOB(e.target.value)} /></p>
                          <p>Adelphi ID number: <input type="number" value={adelphiID} onChange={(e) => setAdelphiID(e.target.value)} /></p>
                          <p>Adelphi Email: {userEmail}</p>
                      </>
                  )}
              </div>
          </div>
          <div style={{ marginTop: '20px' }}>
              <button onClick={handleSave}>Save</button>
              <button><Link to='/'>Log Out</Link></button>
          </div>
      </div>
  );
}

export default Account;