//import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ScheduleBuilder.css';
import { useState } from 'react';

import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';

const ScheduleBuilder = () => {
  const navigate = useNavigate();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timesOfDay = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm'];

  // State variables for search filters
  const [searchFilters, setSearchFilters] = useState({
    department: '',
    course: '',
    location: '',
    modeOfInstruction: '',
    startTime: '',
    instructor: ''
  });
  

  // Function to handle changes in search filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Function to handle search submission
  const handleSearch = () => {
    // Perform search based on searchFilters state
    console.log('Performing search with filters:', searchFilters);
  };

  return (
    <div className="App">
      <div className="Header">
        <header className="App-header">
          <div className="logo" style={{ fontSize: 60 }}>
            Schedule Builder
          </div>
          <SideNav
            onSelect={(selected) => {
              if(selected === "LogOut") {
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
        </header>
      </div>
      <div className="content">
        {/* Schedule container */}
        <div className="schedule-container">
          {/* Schedule header showing days of the week */}
          <div className="schedule-header">
            <div className="time">Days</div>
            {timesOfDay.map(time => (
              <div key={time} className="time">{time}</div>
            ))}
          </div>
          {/* Schedule body displaying time slots */}
          <div className="schedule-body">
            {daysOfWeek.map(day => (
              <div key={day} className="day-slot">
                <div className="day">{day}</div>
                {/* Render empty slots for each time */}
                {timesOfDay.map(() => (
                  <div className="slot"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Search bar and filters aligned to the right */}
        <div className="search-container">
          <div className="search-filters">
            <input type="text" name="department" placeholder="Department" value={searchFilters.department} onChange={handleFilterChange} />
            <input type="text" name="course" placeholder="Course" value={searchFilters.course} onChange={handleFilterChange} />
            <input type="text" name="location" placeholder="Location" value={searchFilters.location} onChange={handleFilterChange} />
            <input type="text" name="modeOfInstruction" placeholder="Mode of Instruction" value={searchFilters.modeOfInstruction} onChange={handleFilterChange} />
            <input type="text" name="startTime" placeholder="Start Time" value={searchFilters.startTime} onChange={handleFilterChange} />
            <input type="text" name="instructor" placeholder="Instructor" value={searchFilters.instructor} onChange={handleFilterChange} />
          </div>
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleBuilder;