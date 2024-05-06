# Panther Advisor

This project is a Senior Computer Science Capstone project. It is designed to aid Adelphi University students in their course advising and plan out their college careers. This project primarily focuses on Undergraduate Computer Science students with the implication of being able to expand to support all majors and minors. 

## Features
Users can create an account or continue as a guest to use Panther Advisor's services. 
Upon login, users are directed to the Schedule Builder, which searches through Adelphi's course catalog to find courses that meet the specified parameters. 
It will compile all the results into a list of items that can then be dragged and dropped onto the schedule to give users a visual aid in viewing their tentative schedule wholistically. 
The Schedule Builder is a planning tool, so users are able to add different sections of the same course, or courses with time conflicts. 
This allows them to better plan which courses fit into the rest of their scheudle better before finalizing it, a feature that Adelphi's current system does not support.
From the schedule, users can then double-click on a course to view all of its related information, along with links to the course's listing and instructor if it exists.

The next feature is the Course Maps. 
At the moment, only Undergraduate Computer Science is supported.
From this page, users would be able to select a major's course map to view if they are a guest, or it would display the associated major if the user has an account and has declared a major. 
In the case of CS, there are different tracks within the major that students can declare. 
Course Maps provides a description, as well as the required courses for each respective track.

From the Account page, users can update their account information with a profile image, their name, DOB, ID number and update their password. 

## How It Works
Panther Advisor heavily utilizes web scraping with JSSoup, in order to provide users with accurate information sourced from Adelphi University's own websites.
Data for Course Maps were scraped and parsed before being saved on the server side to then display to users.
Schedule Builder's form works by formulating a POST request with the form's input.
This request is then passed through a proxy server in order to bypass CORS policy and allow Panther Advisor to scrape the search results in real time.
This data is then parsed in order to make the course objects that the user can drag and drop into their schedule.

If you want to test Panther Advisor yourself, you can fork this repository.
If hosting the project locally, you may have to visit the proxy server [here](https://cors-anywhere.herokuapp.com/) periodically in order to request access to the demo server that allows Schedule Builder's form to work.
If hosting the project on a server, you will need to edit the proxy constant in `ScheduleBuilder.js` from `https://cors-anywhere.herokuapp.com/` to your server's URL in order to redirect traffic through there.

# Future improvements
In the future, users would be able to upload their Degree Audit to the Account page for Panther Advisor to parse and grab any necessary information.
This includes their name, DOB, ID number, along with records of their completed and unfulfilled requirements. 
This information will be used to filter out courses that the student has already taken, as well as update their views in the Course Maps to only courses that they still need to complete.
By uploading their Degree Audit, users consent to allow Panther Advisor to view their student records in order to receive more personalized services to better assist in advising.
Users are still able to use Panther Advisor's services, should they choose not to upload their Degree Audit.

## Resources
Web scraping was done with [JSSoup](https://github.com/chishui/JSSoup)

Site navigation done with [react-sidenav](https://github.com/trendmicro-frontend/react-sidenav)

Schedule Builder's calendar and draggable objecs done with [react-big-calendar](https://github.com/jquense/react-big-calendar)

Account information stored with [Google's Firebase](https://firebase.google.com/)

Hosted by Microsoft Azure on [pantheradvisor.azurewebsites.net](pantheradvisor.azurewebsites.net)