import { useRef } from 'react';
import { Link } from 'react-router-dom';
import './ScheduleBuilder.css';

const ScheduleBuilder = () => {
  const sideNav = useRef(null);

  /* Set the width of the side navigation to 250px */
  const openNav = () => {
    if(sideNav.current)
      sideNav.current.style.width = "250px";
  }

  /* Set the width of the side navigation to 0 */
  const closeNav = () => {
    if(sideNav.current)
      sideNav.current.style.width = "0";
  }

  return (
    <body className="App">
      <div className="Header">
        <header className="App-header">
          {/* FIXME doesnt open
          <div ref={sideNav} class="sidenav" >
            <button class="closebtn" onClick={closeNav()}>&times;</button>
            <a href="#default">Schedule Builder</a>
            <a href="#default">Course Maps</a>
            <a href="#default">Account</a>
            <a href="#default">About</a>
          </div> */}
          <div className="logo" style={{fontSize: 60}}>
            {/* <span onClick={openNav()}>&#9776;</span> */}
            <Link to='/'>Panther Advisor</Link>
          </div>
        </header>
      </div>
      
    </body>
  );
}

export default ScheduleBuilder;