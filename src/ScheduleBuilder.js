import { useNavigate } from 'react-router-dom';
import './General.css';
import './ScheduleBuilder.css';
import { useState, useCallback } from 'react';
import axios from 'axios';
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';

import Dialog from "@material-ui/core/Dialog";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

var JSSoup = require('jssoup').default;

const DnDCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment) // or globalizeLocalizer
const COLORS = ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Beige", "Bisque", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chocolate", "Coral", "CornflowerBlue", "Crimson", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "Darkorange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkTurquoise", "DarkViolet", "DeepSkyBlue", "DimGray", "DodgerBlue", "FireBrick", "ForestGreen", "Gold", "GoldenRod", "Gray", "Green", "HotPink", "IndianRed", "Indigo", "Khaki", "Lavender", "LavenderBlush", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightGray", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSteelBlue", "LimeGreen", "Maroon", "MediumAquaMarine", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MistyRose", "Moccasin", "Navy", "Olive", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat"];
let color = 0;

const ScheduleBuilder = () => {
  const navigate = useNavigate();

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  //Date reference for easy offsets; January is 0; is a Monday
  const dateRef = new Date(2024, 0, 1);
  //holds the search results
  const [results, setResults] = useState([]);
  //state var checking if the form was submitted to render the results
  const [submitted, setSubmitted] = useState(false);
  //the events added to the schedule
  const [events, setEvents] = useState([]);
  //the event being dragged
  const [draggedEvent, setDraggedEvent] = useState();
  //the event to view in the Dialog box
  const [clickedEvent, setClickedEvent] = useState();
  //state to toggle the course info Dialog
  const [isOpen, setIsOpen] = useState(false);
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

  //adds a new event to the schedule
  const newEvent = useCallback((event) => {
    setEvents((prev) => {
      return [...prev, { ...event }];
    })
  },
    [setEvents]
  );

  //handles courses being dropped onto the schedule
  const onDropFromOutside = () => {
    //if this course is already in the schedule, do nothing
    if (events.filter(e => e.number == draggedEvent.number && e.semester == draggedEvent.semester).length > 0) {
      setDraggedEvent(null);
      return;
    }
    const days = draggedEvent.days ?? [];
    const length = days.length;
    const backgroundColor = COLORS[color];
    color = (color + 1) % COLORS.length;
    if (length === 0) {
      var event = { ...draggedEvent, backgroundColor };
      newEvent(event);
    }
    else {
      let newId = 0;
      if (events.length > 0) {
        let idList = events.map((item) => item.id);
        //the new id of the new event is 1 greater than the largest id
        newId = Math.max(...idList) + 1;
      }
      //creates an array of the ids for each new event
      let ids = days.map((val, idx) => newId + idx);
      for (var i = 0; i < length; i++) {
        var start = new Date(draggedEvent.start);
        var end = new Date(draggedEvent.end);
        start.setDate(days[i]);
        end.setDate(days[i]);
        //get the ids of the other events that refer to this course
        let refs = ids.filter((val) => val != newId);
        var event = { ...draggedEvent, start, end, id: newId, refs: refs, backgroundColor };
        newId++;
        newEvent(event);
      }
    }
    setDraggedEvent(null);
  }

  const removeEvent = () => {
    let newEvents = events;
    //array of ids of all references to the clicked event
    let refs = [clickedEvent.id, ...(clickedEvent.refs)];
    newEvents = newEvents.filter((e) => !(refs.includes(e.id)));
    setEvents(newEvents);
    setIsOpen(false);
  }

  //Shows a course's information and option to remove when double clicked
  const showDialog = () => {
    let days = [];
    clickedEvent.days.forEach((val) => days.push(daysOfWeek[val - 1]));
    let start = clickedEvent.start.toLocaleTimeString([], { "hour": '2-digit', "minute": '2-digit' });
    let end = clickedEvent.end.toLocaleTimeString([], { "hour": '2-digit', "minute": '2-digit' });
    let t;
    if (start != "Invalid Date")
      t = start + " - " + end;
    else
      t = "Online";
    return (
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogTitle>{clickedEvent.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <div><strong>Department: </strong>{clickedEvent.department}</div>
            <div><strong>Semester: </strong>{clickedEvent.semester}</div>
            <div><strong>Instructor: </strong><a target='_blank' href={"" + clickedEvent.instructorRef}>{clickedEvent.instructor}</a></div>
            <div><strong>Number: </strong><a target='_blank' href={"" + clickedEvent.courseRef}>{clickedEvent.number}</a></div>
            <div><strong>Meeting Dates:</strong> {days.join("/")} {t}</div>
            <div><strong>Location: </strong>{clickedEvent.location}</div>
            <div><strong>Credits: </strong>{clickedEvent.credits}</div>
            <div><strong>{clickedEvent.cap}</strong></div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <button onClick={removeEvent}>
            Remove
          </button>
          <button onClick={() => setIsOpen(false)}>
            Close
          </button>
        </DialogActions>
      </Dialog>);
  }

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
            //course row
            let num = row.nextElement;  //td
            const children = num.nextSiblings;  //remaining tds
            let ref = "";
            if (num.nextElement.attrs.href != undefined)
              ref = baseURL + num.nextElement.attrs.href.replace("&amp;", "&");
            num = num.text;

            //instructor row
            let instructor = children[0].text;
            let tempRef = children[0].nextElement;
            let iRef = (tempRef.attrs != undefined && tempRef.attrs.href != undefined) ? tempRef.attrs.href : "";

            //semester info
            let sem = children[1].text;

            //meeting days
            let temp = children[2].text.split("/");
            //days is a list of numbers that correspond to the day of the week
            let days = [];
            temp.forEach((day) => {
              if (daysOfWeek.indexOf(day) != -1)
                //+1 to get the day number for the Date object
                days.push(daysOfWeek.indexOf(day) + 1);
            });

            //meeting times
            let times = [];
            if (children[3].text == "") { times = [undefined, undefined]; }
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

            //location, credits and notes
            let location = children[4].text;
            let credits = children[5].text;
            let cap = children[6].text;

            let allDay = (startTime == undefined && endTime == undefined);

            //create an object for this listing
            let item = {
              "title": course,
              "start": new Date(startTime),
              "end": new Date(endTime),
              "allDay": allDay,
              "number": num,
              "department": dep,
              "courseRef": ref,
              "instructor": instructor,
              "instructorRef": iRef,
              "semester": sem,
              "days": days ?? [],
              "location": location,
              "credits": credits ?? "",
              "cap": cap ?? "",
              "isDraggable": false
            };
            //append item to results
            data.push(item);
          }
        }
      }

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
        let t;
        if (start != "Invalid Date")
          t = start + " - " + end;
        else
          t = "Online";
        let days = "";
        e.days.forEach((val) => days += daysOfWeek[val - 1] + " ");
        return (
          <div
            key={index}
            className="results-item"
            draggable="true"
            onDragStart={() => { handleDragStart({ ...e }) }}
          >
            <h3>{e.title}</h3>
            <p><a className="courseLink" target="_blank" href={"" + e.instructorRef}>{e.instructor}</a></p>
            <p>{t}</p>
            <p>{days}</p>
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
            eventPropGetter={event => {
              var backgroundColor = event.backgroundColor
              return { style: { backgroundColor, color: "black" } }
            }}
            dayLayoutAlgorithm={'no-overlap'}
            onDoubleClickEvent={(event) => { setClickedEvent(event); setIsOpen(true); }}
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
                <label>
                  <input type="checkbox" name="status" value="Y" onChange={handleFilterChange} />
                  &nbsp;Hide full, closed, and cancelled courses
                </label>
              </div>
              <div className='column'>
                <fieldset onChange={handleFilterChange}>
                  <h3>Days:</h3>
                  <label>
                    <input type="checkbox" name="days[]" value="N" />
                    &nbsp;Sunday
                  </label>
                  <br />
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
                    <input type="checkbox" name="days[]" value="S" />
                    &nbsp;Saturday
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
              </div>
            </div>
            <input type="submit" value="Search" />
          </form>
        </div>
      </div>
      {isOpen && showDialog()}
    </div>
  );
}

export default ScheduleBuilder;