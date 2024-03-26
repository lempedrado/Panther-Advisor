import { useNavigate } from 'react-router-dom';
import './General.css';
import './ScheduleBuilder.css';
import { useState, useCallback } from 'react';
import axios from 'axios';
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';

import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from 'moment';

var JSSoup = require('jssoup').default;

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment) // or globalizeLocalizer

const ScheduleBuilder = () => {
  const navigate = useNavigate();

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  //Date reference for easy offsets; January is 0; is a Monday
  const dateRef = new Date(2024, 0, 1);

  const [results, setResults] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [events, setEvents] = useState([]);
  const [draggedEvent, setDraggedEvent] = useState();
  const [counters, setCounters] = useState();
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
  //format the days of the week in Calendar
  const formats = { "dayFormat": "ddd" };
  const baseURL = "https://search.adelphi.edu/course-search/";

  const handleDragStart = useCallback((event) => setDraggedEvent(event), []);

  const newEvent = useCallback((event) => {
    setEvents((prev) => {
      //list of the ids
      const idList = prev.map((item) => item.id);
      //the new id of the new event is 1 greater than the largest id
      const newId = Math.max(...idList) + 1;
      //add the new event with the newID to the list
      return [...prev, { ...event, id: newId }];
    })
  },
    [setEvents]
  );

  //FIXME creates duplicates but all in the same date even though start and end are different
  const onDropFromOutside = useCallback(({ start, end, allDay: isAllDay }) => {
    if (draggedEvent === 'undroppable') {
      setDraggedEvent(null);
      return
    }

    console.log(draggedEvent);  //LOG
    const days = draggedEvent.days ?? [];
    const length = days.length;
    if(length === 0)
    {
      newEvent(draggedEvent);
    }
    else
    {
      const start2 = draggedEvent.start;
      const end2 = draggedEvent.end;
      for(var i = 0; i < length; i++)
      {
        start2.setDate(days[i]);
        end2.setDate(days[i]);
        console.log("start: " + start2.toISOString());
        console.log("end: " + end2.toISOString());
        const event = { ...draggedEvent, "start": start2, "end": end2 };
        newEvent(event);
      }
    }
    setDraggedEvent(null);
  },
    [draggedEvent, counters, setDraggedEvent, setCounters, newEvent]
  );

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
        let id = 0;

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
            let temp = children[2].text.split("/");
            //DOCS days is a list of numbers that correspond to the day of the week
            let days = [];
            temp.forEach((day) => {
              if (daysOfWeek.indexOf(day) != -1)
                //+1 to get the day number for the Date object
                days.push(daysOfWeek.indexOf(day) + 1);
            });

            //DOCS meeting times
            let times = [];
            if (children[3].text == "") { times = ["", ""]; }
            else {
              let t = children[3].text.split(" - ");
              let start = t[0].split(":");
              let end = t[1].split(":");
              let d = dateRef;
              if (start[1].endsWith("pm"))
                d.setHours(12 + (start[0] % 12));
              else
                d.setHours(start[0]);

              d.setMinutes(start[1].slice(0, 3));
              times.push(d.getTime());

              if (end[1].endsWith("pm"))
                d.setHours(12 + (end[0] % 12));
              else
                d.setHours(end[0]);

              d.setMinutes(end[1].slice(0, 3));
              times.push(d.getTime());
            }
            let startTime = times[0];
            let endTime = times[1];

            //DOCS location, credits and notes
            let location = children[4].text;
            let credits = children[5].text;
            let cap = children[6].text;

            //create a dictionary for this listing
            //DOCS formatted like Event for BigCalendar
            let item = {
              "id": id,
              "title": course,
              "start": new Date(startTime),
              "end": new Date(endTime),
              "allDay": location == "Online",
              "number": num,
              "department": dep,
              "courseRef": ref,
              "instructor": instructor,
              "instructorRef": iRef,
              "semester": sem,
              "days": days ?? "",
              "location": location,
              "credits": credits ?? "",
              "cap": cap ?? "",
              "isDraggable": false
            };
            id++;
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
        let start = e.start.toLocaleTimeString([], { "hour": '2-digit', "minute": '2-digit' });
        let end = e.end.toLocaleTimeString([], { "hour": '2-digit', "minute": '2-digit' });
        let d;
        if (start != "Invalid Date")
          d = start + " - " + end;
        else
          d = "Online";
        return (
          <div
            key={index}
            className="results-item"
            draggable="true"
            onDragStart={() => {console.log(e); handleDragStart({...e})}}
          >
            <h3>{e.title}</h3>
            <p><a className="courseLink" target="_blank" href={"" + e.courseRef}>{e.number}</a></p>
            <p><a className="courseLink" target="_blank" href={"" + e.instructorRef}>{e.instructor}</a></p>
            <p>{d}</p>
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
          <DnDCalendar
            localizer={localizer}
            toolbar={false}
            defaultView='week'
            defaultDate={dateRef}
            min={dateRef.setHours(8)}
            max={dateRef.setHours(21)}
            events={events}
            onDropFromOutside={onDropFromOutside}
            formats={formats}
            dayLayoutAlgorithm={'no-overlap'}
          // TODO onDoubleClickEvent={} to display info and delete from schedule
          />
        </div>
        <div className="results-container">
          {submitted && renderResults()}
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
        </div>
      </div>
    </div>
  );
}

export default ScheduleBuilder;