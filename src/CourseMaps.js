import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import { parse } from "papaparse";
//import Data from "./Course_Info.csv"
import Papa from "papaparse";
import './CourseMaps.css';

import SideNav, {
  Toggle,
  Nav,
  NavItem,
  NavIcon,
  NavText,
} from "@trendmicro/react-sidenav";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";

function CoursePlanner({ year, courses, selectedSemester }) {
  const courseMapping = {
    Freshman: [
      "CSC 190 Computer Science Orientation Seminar",
      "CSC 171 Introduction to Computer Programming (Lecture)",
      "MTH 141 Calculus I",
      "CSC 156 Discrete Structures",
      "CSC 175 Intermediate Computer Programming",
      "MTH 142 Calculus II",
    ],
    Sophomore: [
      "CSC 263 Database Management System",
      "CSC 301 C and C++ Programming",
      "CSC 273 Data Structures",
      "CSC 344 Algorithms and Complexity",
      "PHI 232 Computer and Information Ethics",
      "CSC 272 Principles of Programming Languages",
    ],
    Junior: [
      "CSC 360 Human-Computer Interaction",
      "CSC 338 Mobile Application Development",
      "CSC 370 Computer Architecture and Organization",
      "MTH 225 Statistics and Data Analytics",
      "CSC 470 Internship in Computer Science",
    ],
    Senior: [
      "CSC 440 Software Engineering",
      "CSC 481 Computer Science Senior Seminar I",
      "CSC 482 Computer Science Senior Seminar II",
      "CSC 450 Computer Networks",
      "CSC 453 Operating Systems",
    ],
  };

  if (!courses || courses.length === 0) {
    return <div>Loading...</div>;
  }
  let filteredCourses;
  if (year === "All Courses") {
    filteredCourses = courses;
  } else {
    filteredCourses = courses.filter((course) => {
      const courseIdentifier = `${course.Department} ${course.CourseNumber} ${course.Title}`;
      return courseMapping[year]?.includes(courseIdentifier);
    });
  }

  if (selectedSemester !== "All Semesters") {
    filteredCourses = filteredCourses.filter(
      (course) => course.Semester === selectedSemester
    );
  }

  return (
    <div>
      <h2>
        {year} Courses for {selectedSemester}
      </h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Course Number</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course, index) => (
              <tr key={index}>
                <td>{course.Department}</td>
                <td>{course.CourseNumber}</td>
                <td>{course.Title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CourseMaps = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All Courses");

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
          },
          error: (error) => console.error("Error parsing CSV: ", error),
        });
      } catch (error) {
        console.error("Error fetching CSV: ", error);
      }
    };
    fetchCourses();
  }, []);
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");

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
          <div className="course-planner">
            <h3>Select Year or Semester:</h3>
            <select
              className="dropdown-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="All Courses">All Courses</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
            </select>
            <select
              className="dropdown-semester"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="All Semesters">All Semesters</option>
              <option value="Spring">Spring</option>
              <option value="Fall">Fall</option>
            </select>
            <CoursePlanner
              year={selectedYear}
              courses={courses}
              selectedSemester={selectedSemester}
            />
          </div>
        </header>
      </div>
    </body>
  );
};

export default CourseMaps;
