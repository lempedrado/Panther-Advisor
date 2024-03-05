import { useNavigate } from 'react-router-dom';
import './General.css';
import './ScheduleBuilder.css';
import { useState } from 'react';
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';

var JSSoup = require('jssoup').default;
const axios = require('axios');

const ScheduleBuilder = () => {
  const navigate = useNavigate();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timesOfDay = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm'];

  // State variables for search filters
  const [searchFilters, setSearchFilters] = useState({
    // "startTime": undefined,
    "department[]": undefined,    //allows multiple but we will limit to one option
    "level": "all",               //frosh, soph, junior, senior, ugrad
    "courseName": undefined,
    "professorName": undefined,
    "status": undefined,          //true if selected
    "distribution": undefined,
    "campus[]": undefined,
    "days[]": undefined,
    "methods[]": undefined,
    "learnGoals[]": undefined,
  });

  //creates the URL with form input values to ping results for scraper
  function appendURL(input) {
    const baseURL = "https://search.adelphi.edu/course-search/?";
    //semester=24/02/*&campus[]=&level=all&school=all&courseName=&professorName=&distribution=&submitted=1

    let post = "";
    searchFilters.forEach((key, value) => {
      if (value != undefined) {
        //if value has multiple values, append each element individually
        if (value instanceof Array)
          value.forEach(val => {
            post += key + val + "&";
          })
        //else append single value
        else
          post += key + value + "&";
      }
    });

    return baseURL + post + "submitted=1";
  }

  // Function to handle changes in search filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Function to handle search submission
  const handleSearch = async function () {
    // const link = appendURL()
    // const response = await axios.get(link);
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
              if (selected === "LogOut") {
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
        </header>
      </div>
      <div className="content">
        {/* Schedule container */}
        <div className="schedule-container column">
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
        <div className="search-container column">
          <form onSubmit={handleSearch}>
            <div className="search-filters">
              <div>
                <input className='search-box' type="text" name="department[]" placeholder="Department" value={searchFilters["department[]"]} onChange={handleFilterChange} />
                <br />
                {/* <select name='department[]'>
                generate options from file
                </select> */}
                <select className='search-box' name='level'>
                  <option value="all">All Course Levels</option>
                  <option value="frosh">Freshman</option>
                  <option value="soph">Sophomore</option>
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                  <option value="ugrad">Undergraduate</option>
                </select>
                <br />
                <input className='search-box' type="text" name="courseName" placeholder="Course" value={searchFilters["courseName"]} onChange={handleFilterChange} />
                <br />
                <input className='search-box' type="text" name="professorName" placeholder="Professor" value={searchFilters["professorName"]} onChange={handleFilterChange} />
                <br />
                <fieldset>
                  <legend><h3>Location:</h3></legend>
                  <label>
                    <input type="radio" name="campus[]" value="NY" />
                    &nbsp;Brooklyn Center
                  </label><br />
                  <label>
                    <input type="radio" name="campus[]" value="GC" />
                    &nbsp;Garden City
                  </label><br />
                  <label>
                    <input type="radio" name="campus[]" value="HG" />
                    &nbsp;Hauppauge
                  </label><br />
                  <label>
                    <input type="radio" name="campus[]" value="HV" />
                    &nbsp;Hudson Valley
                  </label><br />
                  <label>
                    <input type="radio" name="campus[]" value="ONL" />
                    &nbsp;Online
                  </label><br />
                  <label>
                    <input type="radio" name="campus[]" value="OCC" />
                    &nbsp;SUNY Orange County CC
                  </label>
                </fieldset>
                {/* check boxes */}
                <div>
                  <h3>Mode of Instruction:</h3>
                  <label>
                    <input type="checkbox" name="methods[]" value="T,B," />
                    &nbsp;Traditional
                  </label><br />
                  <label>
                    <input type="checkbox" name="methods[]" value="O,O1,OA,OC,OS" />
                    &nbsp;Online
                  </label><br />
                  <label>
                    <input type="checkbox" name="methods[]" value="B,HF" />
                    &nbsp;Blended
                  </label>
                </div>
              </div>
              <div>
                <div>
                  <h3>Days:</h3>
                  <label>
                    <input type="checkbox" name="days[]" value="U" />
                    &nbsp;Sunday
                  </label>
                  <label>
                    <input type="checkbox" name="days[]" value="M" />
                    &nbsp;Monday
                  </label>
                  <label>
                    <input type="checkbox" name="days[]" value="T" />
                    &nbsp;Tuesday
                  </label>
                  <label>
                    <input type="checkbox" name="days[]" value="W" />
                    &nbsp;Wednesday
                  </label>
                  <label>
                    <input type="checkbox" name="days[]" value="R" />
                    &nbsp;Thursday
                  </label>
                  <label>
                    <input type="checkbox" name="days[]" value="F" />
                    &nbsp;Friday
                  </label>
                  <label>
                    <input type="checkbox" name="days[]" value="S" />
                    &nbsp;Saturday
                  </label>
                  <label>
                    <input type="checkbox" name="days[]" value="X" />
                    &nbsp;TBA / Unspecified
                  </label>
                </div>
                <h3>Distribution Requirement:</h3>
                <select className='search-box' name='distribution'>
                  <option value>- Select One -</option>
                  <option value="A">Arts</option>
                  <option value="FS">Mathematics, Computing & Logic</option>
                  <option value="H">Humanities</option>
                  <option value="NS">Natural Science</option>
                  <option value="SS">Social Science</option>
                </select>
                <div>
                  <h3>Learning Goals:</h3>
                  <label>
                    <input type="checkbox" name="learnGoals[]" value="CO" />
                    &nbsp;Communication Oral
                  </label><br />
                  <label>
                    <input type="checkbox" name="learnGoals[]" value="CW" />
                    &nbsp;Communication Writing
                  </label><br />
                  <label>
                    <input type="checkbox" name="learnGoals[]" value="G" />
                    &nbsp;Global Learning/Civic Engagement
                  </label><br />
                  <label>
                    <input type="checkbox" name="learnGoals[]" value="L" />
                    &nbsp;Information Literacy
                  </label><br />
                  <label>
                    <input type="checkbox" name="learnGoals[]" value="Q" />
                    &nbsp;Quantitative Reasoning
                  </label>
                </div>
                {/* <input type="text" name="startTime" placeholder="Start Time" value={searchFilters.startTime} onChange={handleFilterChange} /> */}
                <br />
                <label>
                  <input type="checkbox" name="status" value="Y" onChange={handleFilterChange} />
                  &nbsp;Hide full, closed, and cancelled courses
                </label>
              </div>
            </div>
          </form>
          <input type="submit" value="Search" />
        </div>
      </div>
    </div>
  );
}

export default ScheduleBuilder