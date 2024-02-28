import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import { parse } from "papaparse";
//import Data from "./Course_Info.csv"
import Papa from "papaparse";
import "./CourseMaps.css";

import SideNav, {
  Toggle,
  Nav,
  NavItem,
  NavIcon,
  NavText,
} from "@trendmicro/react-sidenav";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";

function CoursePlanner({ track, courses, onClose }) {
  if (!courses || courses.length === 0) {
    return <div>Loading...</div>;
  }

  let filteredCourses = courses.filter((course) => course.Track === track);

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
              {filteredCourses.map((course, index) => (
                <tr key={index}>
                  <td>{course.Department}</td>
                  <td>{course.CourseNumber}</td>
                  <td>{course.Title}</td>
                  <td>{course.Credits}</td>
                </tr>
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
              if (selected == "LogOut") {
                navigate("/");
                return;
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
                  <i style={{ fontSize: "1.75em" }} />
                </NavIcon>
                <NavText>Schedule Builder</NavText>
              </NavItem>
              <NavItem eventKey="CourseMaps">
                <NavIcon>
                  <i style={{ fontSize: "1.75em" }} />
                </NavIcon>
                <NavText>Course Maps</NavText>
              </NavItem>
              <NavItem eventKey="Account">
                <NavIcon>
                  <i style={{ fontSize: "1.75em" }} />
                </NavIcon>
                <NavText>Account</NavText>
              </NavItem>
              <NavItem eventKey="About">
                <NavIcon>
                  <i style={{ fontSize: "1.75em" }} />
                </NavIcon>
                <NavText>About</NavText>
              </NavItem>
              <NavItem eventKey="LogOut">
                <NavIcon>
                  <i style={{ fontSize: "1.75em" }} />
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
        </header>
      </div>
    </body>
  );
};

export default CourseMaps;
