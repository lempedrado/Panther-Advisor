//import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ScheduleBuilder.css';
import { useState } from 'react';
import Papa from 'papaparse'; //for importing from csv
import Modal from 'react-bootstrap/Modal'; // Import Modal component from React Bootstrap
import Button from 'react-bootstrap/Button'; 

import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';

const ScheduleBuilder = () => {
  
  const [showModal, setShowModal] = useState(false); // State variable to control modal visibility
  const [courseData, setCourseData] = useState([]);
  const navigate = useNavigate();
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timesOfDay = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm'];

  // State variables for search filters
  const [searchFilters, setSearchFilters] = useState({
    department: '',
    course: '',
    title: '',
    track: '',
    credits: '',
    instructor: ''
  });

  const [filteredCourses, setFilteredCourses] = useState([]); // State variable for filtered courses

  (async () => {
    const response = await fetch('/Users/adiskolenovic/PantherAdvisor/Panther-Advisor/Course_Info.csv'); // Adjust the path
    const reader = response.body.getReader();
    const result = await reader.read();
    const decoder = new TextDecoder('utf-8');
    const csv = decoder.decode(result.value);
    const parsedData = Papa.parse(csv, { header: true }).data;
    setCourseData(parsedData);
  })();

  // Function to handle changes in search filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSearch = () => {
    // Perform search based on searchFilters state
    console.log('Performing search with filters:', searchFilters);
    const filtered = courseData.filter(course => {
      return Object.entries(searchFilters).every(([key, value]) => {
        if (value === '') return true;
        if (!course[key]) return false;
        return course[key].toLowerCase().includes(value.toLowerCase());
      });
    });
    setFilteredCourses(filtered); // Update filtered courses state
    handleModal(); // Open the modal after filtering
  };

    //function to handle opening and closing modal
    const handleModal = () => {
      setShowModal(!showModal);
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
            <input type="text" name="title" placeholder="Title" value={searchFilters.title} onChange={handleFilterChange} />
            <input type="text" name="track" placeholder="Track" value={searchFilters.track} onChange={handleFilterChange} />
            <input type="text" name="credits" placeholder="Credits" value={searchFilters.credits} onChange={handleFilterChange} />
            <input type="text" name="instructor" placeholder="Instructor" value={searchFilters.instructor} onChange={handleFilterChange} />
          </div>
          <button onClick={handleSearch}>Search</button>
        </div>
          {/* Modal to display matched courses */}
          <Modal show={showModal} onHide={handleModal}>
            <Modal.Header closeButton>
              <Modal.Title>Matched Courses</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* List of matched courses */}
              <ul>
                {filteredCourses.map(course => (
                  <li key={course.CourseNumber}>{course.Department} - {course.Title}</li>
                ))}
              </ul>
            </Modal.Body>
            <Modal.Footer>
              {/* Close button to close the modal */}
              <Button variant="secondary" onClick={handleModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
      </div>
    </div>
  );
}

export default ScheduleBuilder;