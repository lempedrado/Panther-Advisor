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
    "department[]": undefined,    //allows multiple but we will limit to one option
    "level": "all",               //frosh, soph, junior, senior, ugrad
    "semester": "all",
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
  const baseURL = "https://search.adelphi.edu/course-search/?";

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
    let post = "&";
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
        //get the number of total results for this search
        let total = soup.find('strong');
        if(searchFilters.sem === "all")
          total = total?.text?.split("\n")?.[0]?.slice(0, -10)?.split(" ");
        else
          total = total?.text?.split(" ");
        total = parseInt(total?.[2]);
        let pages = total / 100;

        //compile the results from all the results pages
        for (let i = 0; i < pages; i += 1) {
          let page = await getResults(link, i * 100);
          data = [...data, ...page];
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

  // Scrapes and returns the results from the search page
  const getResults = async (link, offset) => {
    const proxy = 'https://cors-anywhere.herokuapp.com/' + link + "&startrow=" + offset;
    try {
      //Fetch HTML content of the search results
      const response = await axios.get(proxy);
      const html = response.data;
      //Parse HTML content with JSSoup
      var soup = new JSSoup(html);

      let data = [];
      //get the table of results
      let res = soup.findAll("table", "course-search-results")[0];

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
          if (sem === "") {
            let s = searchFilters.semester.split("/");
            if (s[1] === "02")
              sem = "Spring 20" + s[0];
            if (s[1] === "09")
              sem = "Fall 20" + s[0];
          }

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
      return data;
    }
    catch (error) {
      console.error('Error occured: ', error);
    }
  }

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
                <select name="department[]" className='search-box' onChange={handleFilterChange}>
                  <option value="0201">Accounting</option>
                  <option value="0602">Adult Bac Learning Experience</option>
                  <option value="0503">Advanced Clinical Psychology</option>
                  <option value="0101">African, Blk & Caribb Studies</option>
                  <option value="0103">Anthropology</option>
                  <option value="0104">Art</option>
                  <option value="0111">Art History</option>
                  <option value="0105">Biology</option>
                  <option value="0204">Business Administration</option>
                  <option value="0213">Business Fundamentals</option>
                  <option value="0106">Chemistry</option>
                  <option value="0129">Chinese Mandarin</option>
                  <option value="0811">Cla English Requirements</option>
                  <option value="0873,0876,0878,0879">Communication Sciences and Disorders</option>
                  <option value="0108">Communications</option>
                  <option value="0145">Computer Science</option>
                  <option value="0171">Criminal Justice</option>
                  <option value="0191">Dance</option>
                  <option value="0207">Decision Sciences</option>
                  <option value="0112">Earth Science</option>
                  <option value="0203">Economics</option>
                  <option value="0801">Education</option>
                  <option value="0809">Education - Adolescent Ed</option>
                  <option value="0803">Education - Art</option>
                  <option value="0804">Education - Bilingual Ed</option>
                  <option value="0820">Education - Early Child Speced</option>
                  <option value="0814">Education - Early Childhood</option>
                  <option value="0807">Education - Elementary Ed</option>
                  <option value="0802">Education - Literacy</option>
                  <option value="0810">Education - Special Education</option>
                  <option value="0836">Education - STEP</option>
                  <option value="0806">Educational Leadership & Tech</option>
                  <option value="0858">Educational Technology</option>
                  <option value="0893">Educational Theatre</option>
                  <option value="0616">Emergency Management</option>
                  <option value="0122">English</option>
                  <option value="0215">Entrepreneurship</option>
                  <option value="0125">Environmental Studies & Sciences</option>
                  <option value="0155">Ethics And Public Policy</option>
                  <option value="0854">Exercise Science</option>
                  <option value="0209">Finance</option>
                  <option value="0952">First-year Experience</option>
                  <option value="0128">French</option>
                  <option value="0502">General Psychology</option>
                  <option value="0131">Greek</option>
                  <option value="0206">Health Services Administration</option>
                  <option value="0834">Health Studies</option>
                  <option value="0308">Healthcare Informatics</option>
                  <option value="0136">History</option>
                  <option value="0083">Honors</option>
                  <option value="0208">Human Resource Management</option>
                  <option value="0137">Interdisciplinary Studies</option>
                  <option value="0187">International Studies Program</option>
                  <option value="0138">Italian</option>
                  <option value="0141">Japanese</option>
                  <option value="0139">Languages</option>
                  <option value="0140">Latin</option>
                  <option value="0143">Latin Amer And Latinx Studies</option>
                  <option value="0960">Levermore Global Scholars</option>
                  <option value="0142">Linguistics</option>
                  <option value="0210">Management</option>
                  <option value="0212">Marketing</option>
                  <option value="0148">Math Teachers Program</option>
                  <option value="0144">Mathematics</option>
                  <option value="0507">Mental Health Counseling</option>
                  <option value="0149">Museum Studies</option>
                  <option value="0199,0832">Music Education</option>
                  <option value="0196">Music History</option>
                  <option value="0197">Music Performance Groups</option>
                  <option value="0198">Music Private Instruction</option>
                  <option value="0195">Music Theory</option>
                  <option value="0302">Nursing</option>
                  <option value="0856">Nutrition</option>
                  <option value="0154">Philosophy</option>
                  <option value="0853">Physical Activity And Fitness</option>
                  <option value="0852">Physical Education</option>
                  <option value="0156">Physics</option>
                  <option value="0158">Political Science</option>
                  <option value="0160">Portuguese</option>
                  <option value="0505">Postgraduate Certificate Pgm</option>
                  <option value="0508">Postgraduate Psychoanalytic</option>
                  <option value="0501">Psychology</option>
                  <option value="0304">Public Health</option>
                  <option value="0504">School Psychology</option>
                  <option value="0404">Social Work</option>
                  <option value="0170">Sociology</option>
                  <option value="0172">Spanish</option>
                  <option value="0216,0855">Sport Management</option>
                  <option value="0813">Steam</option>
                  <option value="0192">Theatre-acting</option>
                  <option value="0193">Theatre-tech & Design</option>
                  <option value="0173">Translation Studies</option>
                  <option value="0610">UC Fine & Applied Art</option>
                  <option value="0611">UC Humanistic Studies</option>
                  <option value="0637">UC Interdisciplinary Studies</option>
                  <option value="0615">UC Mgmt & Communications</option>
                  <option value="0612">UC Natural Science</option>
                  <option value="0613">UC Social Science</option>
                </select>
                <br />
                <select className='search-box' name='level' onChange={handleFilterChange}>
                  <option value="all">All Course Levels</option>
                  <option value="frosh">Freshman</option>
                  <option value="soph">Sophomore</option>
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                  <option value="ugrad">Undergraduate</option>
                </select>
                <br />
                <select className='search-box' name="semester" onChange={handleFilterChange}>
                  <option value="all">All Semesters</option>
                  <option value="24/02/*">Spring 2024</option>
                  <option value="24/09/*">Fall 2024</option>
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