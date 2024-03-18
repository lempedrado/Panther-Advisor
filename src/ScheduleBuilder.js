import { useNavigate } from 'react-router-dom';
import './General.css';
import './ScheduleBuilder.css';
import { useState } from 'react';
import axios from 'axios';
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';

var JSSoup = require('jssoup').default;

const ScheduleBuilder = () => {
  const navigate = useNavigate();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timesOfDay = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm'];

  const [results, setResults] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  // State variables for search filters
  const [searchFilters, setSearchFilters] = useState({
    //TODO "startTime": undefined,
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
  const baseURL = "https://search.adelphi.edu/course-search/";

  //creates the URL with form input values to ping results for scraper
  function appendURL() {
    let post = "?semester=all&";
    Object.keys(searchFilters).map((key) => {
      var val = searchFilters[key];
      if (val !== undefined) {
        //if value has multiple values, append each element individually
        if (val instanceof Array)
          val.forEach(val => {
            post += key + "=" + val + "&";
          })
        //else append single value
        else
          post += key + "=" + val + "&";
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
  const handleSearch = async (event) => {
    //prevents the page from refreshing on form submission
    event.preventDefault();
    //get the link of the search results
    const link = appendURL();
    console.log(link); //LOG
    const proxy = 'https://cors-anywhere.herokuapp.com/' + link;
    try {
      //Fetch HTML content of the search results
      const response = await axios.get(proxy);
      const html = response.data;
      //Parse HTML content with JSSoup
      var soup = new JSSoup(html);

      let data = [];

      //address tag is only present when there are no results
      let res = soup.findAll('address');
      //if no address tag is found, there are results for this search
      if (res.length == 0) {
        //get the table of results
        res = soup.findAll("table", "course-search-results")[0];

        //get all rows of data
        let rows = res.findAll("tr");
        // rows.map((e) => { console.log(e.text) }); //LOG

        //skip first row, because it is a blank spacer
        //iterate through each row of results to parse
        for (let i = 1; i < rows.length; i++) {
          let row = rows[i];
          let child = row.nextElement;
          if (child.attrs.class == "dep")
            var dep = child.text;
          else if (child.attrs.class == "crs")
            var course = child.text;
          else if (row.attrs.class == "details") {
            //DOCS course row
            let num = row.nextElement;  //DOCS td
            const children = num.nextSiblings;  //DOCS remaining tds
            let ref = "";
            if (num.nextElement.attrs.href != undefined)
              ref = baseURL + num.nextElement.attrs.href.replace("&amp;", "&");
            num = num.text;

            //DOCS instructor row
            let instructor = children[0].text;
            let tempRef = children[0].nextElement;
            let iRef = (tempRef.attrs != undefined && tempRef.attrs.href != undefined) ? tempRef.attrs.href : "";

            //DOCS semester info
            let sem = children[1].text;

            //DOCS meeting days
            let days = children[2].text.split("/");

            //DOCS meeting times
            let times = [];
            console.log("times pre: " + children[3].prettify()); //LOG
            if (children[3].text == "") { times = ["", ""]; }
            else {
              let t = children[3].text.split(" - ");
              let start = t[0].split(":");
              let end = t[1].split(":");
              let d = new Date();
              if (start[1].endsWith("pm"))
                d.setHours(12 + (start[0] % 12));
              else
                d.setHours(start[0]);

              d.setMinutes(start[1].slice(0, 3));
              //TODO save as Date object and parse in render
              times.push(d.toISOString());

              if (end[1].endsWith("pm"))
                d.setHours(12 + (end[0] % 12));
              else
                d.setHours(end[0]);

              d.setMinutes(end[1].slice(0, 3));
              times.push(d.toISOString());
            }
            console.log(times); //LOG
            let startTime = times[0];
            let endTime = times[1];

            //DOCS location, credits and notes
            let location = children[4].text;
            let credits = children[5].text;
            let cap = children[6].text;

            //create a dictionary for this listing
            let item = {
              "department": dep,
              "title": course,
              "number": num,
              "courseRef": ref,
              "instructor": instructor,
              "instructorRef": iRef,
              "semester": sem,
              "days": days ?? "",
              "startTime": startTime,
              "endTime": endTime,
              "location": location,
              "credits": credits ?? "",
              "cap": cap ?? ""
            };
            console.log("item: " + item);
            //append item to results
            data.push(item);
          }
        }
      }
      else
        data.push([{ "title": "No courses match your parameters." }]);

      setSubmitted(true);
      setResults(data);
    } catch (error) {
      console.error('Error occured: ', error);
    }
    // Perform search based on searchFilters state
    console.log('Performing search with filters:', searchFilters);
  };

  const renderResults = () => {
    if (results.length == 0)
      return <p>No courses match your parameters.</p>
    else {
      //render all results with map
      return results.map((e, index) => {
        return (
          <div key={index} style={{ border: "2px solid black", borderRadius: "25px" }}>
            <h3>{e.title}</h3>
            <p><a className="courseLink" target="_blank" href={"" + e.courseRef}>{e.number}</a></p>
            <p><a className="courseLink" target="_blank" href={"" + e.instructorRef}>{e.instructor}</a></p>
          </div>);
      });
    }
  }

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
        <div className="schedule-container">
        </div>
        {/* Search bar and filters aligned to the right */}
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <div className="search-filters">
              <div className='column'>
                <input className='search-box' type="text" name="department[]" placeholder="Department" value={searchFilters["department[]"] ?? ""} onChange={handleFilterChange} />
                <br />
                {/* <select name='department[]'>
                generate options from file
                </select> */}
                <select className='search-box' name='level' onChange={handleFilterChange}>
                  <option value="all">All Course Levels</option>
                  <option value="frosh">Freshman</option>
                  <option value="soph">Sophomore</option>
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                  <option value="ugrad">Undergraduate</option>
                </select>
                <br />
                <input className='search-box' type="text" name="courseName" placeholder="Course" value={searchFilters["courseName"] ?? ""} onChange={handleFilterChange} />
                <br />
                <input className='search-box' type="text" name="professorName" placeholder="Professor" value={searchFilters["professorName"] ?? ""} onChange={handleFilterChange} />
                <br />
                <fieldset onChange={handleFilterChange}>
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
                <div>
                  <fieldset onChange={handleFilterChange}>
                    <legend><h3>Mode of Instruction:</h3></legend>
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
                  </fieldset>
                </div>
              </div>
              <div className='column'>
                <fieldset onChange={handleFilterChange}>
                  <h3>Days:</h3>
                  <label>
                    <input type="checkbox" name="days[]" value="M" />
                    &nbsp;Monday
                  </label>
                  <br />
                  <label>
                    <input type="checkbox" name="days[]" value="T" />
                    &nbsp;Tuesday
                  </label>
                  <br />
                  <label>
                    <input type="checkbox" name="days[]" value="W" />
                    &nbsp;Wednesday
                  </label>
                  <br />
                  <label>
                    <input type="checkbox" name="days[]" value="R" />
                    &nbsp;Thursday
                  </label>
                  <br />
                  <label>
                    <input type="checkbox" name="days[]" value="F" />
                    &nbsp;Friday
                  </label>
                  <br />
                  <label>
                    <input type="checkbox" name="days[]" value="X" />
                    &nbsp;TBA / Unspecified
                  </label>
                </fieldset>
                <h3>Distribution Requirement:</h3>
                <select className='search-box' name='distribution' onChange={handleFilterChange}>
                  <option value="">- Select One -</option>
                  <option value="A">Arts</option>
                  <option value="FS">Mathematics, Computing & Logic</option>
                  <option value="H">Humanities</option>
                  <option value="NS">Natural Science</option>
                  <option value="SS">Social Science</option>
                </select>
                <fieldset onChange={handleFilterChange}>
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
                </fieldset>
                {/* TODO <input type="text" name="startTime" placeholder="Start Time" value={searchFilters.startTime} onChange={handleFilterChange} /> */}
                <br />
                <label>
                  <input type="checkbox" name="status" value="Y" onChange={handleFilterChange} />
                  &nbsp;Hide full, closed, and cancelled courses
                </label>
              </div>
            </div>
            <input type="submit" value="Search" />
          </form>
          <div className='header'>
            {submitted && renderResults()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleBuilder;