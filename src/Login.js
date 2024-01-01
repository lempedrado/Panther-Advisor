import './Login.css';
import { BrowserRouter, Routes, Route , Link} from 'react-router-dom';
import ScheduleBuilder from './ScheduleBuilder';

function Login() {

  return (
    <body className="App">
      <div className="Header">
        <header className="App-header">
          <div className="logo" style={{fontSize: 60}}>Panther Advisor</div>
        </header>
      </div>
      <img src='/pantherLogo.png' className="App-logo" alt="logo" />
      <div className="Login">
          <label for="email">Email</label> <br/>
          <input type="text" id="email" name="email" /> <br/><br/>
          <label for="password">Password</label> <br/>
          <input type="password" id="password" name="password" /> <br/><br/>
          <input type="submit" value="Login" />
      </div>
      <div>
        <button>Create account</button>
        <button>Forgot Password?</button>
        <Link to='/ScheduleBuilder'>Continue as Guest</Link>
      </div>
    </body>
  );
}

export default Login;