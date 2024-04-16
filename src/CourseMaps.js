import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import { parse } from "papaparse";
//import Data from "./Course_Info.csv"
import Papa from "papaparse";
import "./CourseMaps.css";
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import './General.css';
import './CourseMaps.css';

import SideNav, {
  Toggle,
  Nav,
  NavItem,
  NavIcon,
  NavText,
} from "@trendmicro/react-sidenav";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";


const OPTIONAL_COURSE_GROUPS = {
  "Software Engineering": [
    {
      title: "Choose one of the following two options:",
      courses: ["233", "360"],
    },
    {
      title: "Choose one of the following two options:",
      courses: ["338", "350"],
    },
  ],
  "Computer Graphics Programming": [
    {
      title: "Choose one of the following two options:",
      courses: ["233", "360"],
    },
    {
      title: "Choose one of the following two options:",
      courses: ["337", "418"],
    },
  ],
  "Foundations of Computer Science": [
    {
      title: "Choose one of the following three options:",
      courses: ["351", "355", "384"],
    },
  ],
};

function CoursePlanner({ track, courses, onClose }) {
  if (!courses || courses.length === 0) {
    return <div>Loading...</div>;
  }

  let filteredCourses = courses.filter((course) => course.Track === track);
  console.log(`Filtered courses for ${track}:`, filteredCourses.length);

  let optionalGroups = OPTIONAL_COURSE_GROUPS[track] || [];

  const isOptionalCourse = (courseNumber) => {
    const found = optionalGroups.some(group => {
      const match = group.courses.includes(courseNumber);
      if (match) {
        // test on console
        console.log(`Matching optional course found: ${courseNumber}`);
      } else {
        // test on console
        console.log(`No match for: ${courseNumber} in group`, group.courses);
      }
      return match;
    });
    return found;
  };

  const regularCourses = filteredCourses.filter(course => !isOptionalCourse(course.CourseNumber));
  console.log(`Regular courses for ${track}:`, regularCourses.length);

  optionalGroups.forEach((group, index) => {
    const foundCourses = group.courses.filter(courseNumber => filteredCourses.some(c => c.CourseNumber === courseNumber));
    console.log(`Optional group ${index} for ${track}:`, foundCourses.length);
  });

  return (
    <div className="modal-background" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Courses for {track}</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Course Number</th>
                <th>Title</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {/* Render regular courses */}
              {regularCourses.map((course, index) => (
                <tr key={index}>
                  <td>{course.Department}</td>
                  <td>{course.CourseNumber}</td>
                  <td>{course.Title}</td>
                  <td>{course.Credits}</td>
                </tr>
              ))}
              {/* Dynamically render optional groups */}
              {optionalGroups.map((group, groupIndex) => (
                <React.Fragment key={`group-${groupIndex}`}>
                  <tr>
                    <td colSpan="4" style={{textAlign: "center"}}><strong>{group.title}</strong></td>
                  </tr>
                  {group.courses.map(courseNumber => {
                    const course = filteredCourses.find(c => c.CourseNumber === courseNumber);
                    return (
                      <tr key={`${courseNumber}-${groupIndex}`}>
                        <td>{course?.Department}</td>
                        <td>{course?.CourseNumber}</td>
                        <td>{course?.Title}</td>
                        <td>{course?.Credits}</td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const CourseMaps = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [flipState, setFlipState] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [trackInfo, setTrackInfo] = useState({});

  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/Course_Info.csv");
        const reader = response.body.getReader();
        const { value } = await reader.read();
        const decoder = new TextDecoder("utf-8");
        const csvData = decoder.decode(value);
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setCourses(results.data);
            const uniqueTracks = [
              ...new Set(results.data.map((course) => course.Track)),
            ];
            setTracks(uniqueTracks);

            setFlipState(
              uniqueTracks.reduce(
                (acc, track) => ({ ...acc, [track]: false }),
                {}
              )
            );
          },
          error: (error) => console.error("Error parsing CSV: ", error),
        });
      } catch (error) {
        console.error("Error fetching CSV: ", error);
      }
      try {
        const response = await fetch("/Track_Info.csv");
        const reader = response.body.getReader();
        const { value } = await reader.read();
        const decoder = new TextDecoder("utf-8");
        const csvData = decoder.decode(value);
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const descriptions = {};
            results.data.forEach((item) => {
              descriptions[item.Track] = item.Description;
            });
            setTrackInfo(descriptions);
          }
        });
      } catch (error) {
        console.error("Error fetching Track_Info.csv: ", error);
      }
    };
    fetchCourses();
  }, []);
  //const [selectedSemester, setSelectedSemester] = useState("All Semesters");

  const handleFlip = (track) => {
    setSelectedTrack(track); 
    setIsModalOpen(true); 
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <body className="App">
      <div className="Header">
        <header className="App-header">
          <SideNav
            onSelect={(selected) => {
              if (selected === "LogOut") {
                navigate("/");
              } else {
                const to = '/' + selected;
                navigate(to);
              }
              const to = "/" + selected;
              navigate(to);
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
          <div className="logo" style={{ fontSize: 60 }}>
            {/* Make a logo that links to Profile
            <Link to='/'>Panther Advisor</Link> */}
            Course Maps
          </div>
          <h3>Computer Science B.S</h3>
          <div className="course-planner">
            {tracks.map((track) => (
              <div
                key={track}
                className="flip-card"
                onClick={() => handleFlip(track)}
              >
                <div
                  className={`flip-card-inner ${
                    flipState[track] ? "flipped" : ""
                  }`}
                >
                  <div className="flip-card-front">
                    <h4>{track}</h4>
                  </div>
                  <div className="flip-card-back">
                    <h4>Click to view courses</h4>{" "}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isModalOpen && (
            <CoursePlanner
              track={selectedTrack}
              courses={courses}
              onClose={handleCloseModal}
            />
          )}
          <div className="track-descriptions">
            <h2>Track Descriptions</h2>
            {Object.entries(trackInfo).map(([track, description], index) => (
              <div key={index}>
                <h3>{track}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </header>
      </div>
      
    </body>
  );
};

export default CourseMaps;
