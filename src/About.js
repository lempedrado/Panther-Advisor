import { useNavigate } from 'react-router-dom';
import './General.css';
import './About.css';

import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';

const About = () => {
  const navigate = useNavigate();

  return (
    <body className="App">
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
            {/* Make a logo that links to Profile
            <Link to='/'>Panther Advisor</Link> */}
            About
          </div>
        </header>
      </div>
      {/* Add the text content here */}
      <div className="about-content">
        <h2>What the website is for?</h2>
        <p>
          Panther Advisor is the ultimate companion for Undergraduate Computer Science students at Adelphi University.
          It will automate the advising process and be available any time. With the Panther Advisor, we seek to provide
          the user with a simple yet concise tool to easily manage and view which courses are required, available, best
          fit into their schedule, and more. We aspire to streamline the registration process in order to relieve
          students of the stress from choosing courses as well as the workload on their advisors.
        </p>
        <h2>Who will benefit from the Panther Advisor?</h2>
        <p>
          Our goal with the Panther advisor is to help undergraduate CS students with registering and deciding which
          classes they need to take as well as providing a clear understanding of the courses they need to register for
          so they can fit into their schedules in an organized manner. The intended user base is Adelphi Undergraduate
          CS students but we plan to expand to other majors and possibly other universities if possible.
        </p>
        <h2>Why?</h2>
        <p>
          As seniors, we all know how stressful the advising and registration period can be, especially during our
          earlier college years when there are more courses to choose from. Advising meetings are also limited and a few
          minutes long. From experience talking to other students, they often don’t know which courses they need to take
          and when. Advisors are responsible for many students and it’s hard to keep track of where everyone is in their
          college standing so they often don’t know either until you attend your advising session. We aim to provide
          students with a simple yet concise tool to easily manage and view which courses are required, available, best
          fit into their schedule, and more.
        </p>
      </div>
    </body>
  );
}

export default About;