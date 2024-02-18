import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ScheduleBuilder.css';

import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';

const Requirements = () => {
  const navigate = useNavigate();

  return (
    <body className="App">
      <div className="Header">
        <header className="App-header">
        <SideNav
            onSelect={(selected) => {
              if(selected == "LogOut")
              {
                navigate("/");
                return;
              }
              const to = '/' + selected;
              navigate(to);
            }}
            className="sidenav"
          >
            <Toggle />
            <Nav>
              <NavItem eventKey="ScheduleBuilder">
                <NavIcon>
                  <i style={{ fontSize: '1.75em' }} />
                </NavIcon>
                <NavText>
                  Schedule Builder
                </NavText>
              </NavItem>
              <NavItem eventKey="CourseMaps">
                <NavIcon>
                  <i style={{ fontSize: '1.75em' }} />
                </NavIcon>
                <NavText>
                  Course Maps
                </NavText>
              </NavItem>
              <NavItem eventKey="Account">
                <NavIcon>
                  <i style={{ fontSize: '1.75em' }} />
                </NavIcon>
                <NavText>
                  Account
                </NavText>
              </NavItem>
              <NavItem eventKey="About">
                <NavIcon>
                  <i style={{ fontSize: '1.75em' }} />
                </NavIcon>
                <NavText>
                  About
                </NavText>
              </NavItem>
              <NavItem eventKey="LogOut">
                <NavIcon>
                  <i style={{ fontSize: '1.75em' }} />
                </NavIcon>
                <NavText>
                  Logout
                </NavText>
              </NavItem>
            </Nav>
          </SideNav>
          <div className="logo" style={{ fontSize: 60 }}>
            {/* Make a logo that links to Profile
            <Link to='/'>Panther Advisor</Link> */}
            Requirements
          </div>
        </header>
      </div>
      
    </body>
  );
}

export default Requirements;