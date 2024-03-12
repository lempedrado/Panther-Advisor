var JSSoup = require('jssoup').default;
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const axios = require('axios');

const scrape = async function scrapeAndWriteToCSV() {
  try {
    // Fetch HTML content of the webpage
    const response = await axios.get('https://catalog.adelphi.edu/preview_program.php?catoid=31&poid=15379');
    const html = response.data;

    // Parse HTML content with JSSoup
    var soup = new JSSoup(html);

    // extract data from the webpage
    const data = [];

    //get the different cores of the requirements
    let cores = soup.findAll('div', 'acalog-core');
    cores = cores.filter((item) => {
      return item.text.startsWith("Computer Science Core") || item.text.startsWith("Track ");
    });
    

    cores.forEach((core, index) => {
      //get the track title or general CS requirements
      let track = core.find('h2').text;
      track = track.split(": ").pop();

      //grab all course listings
      let listings = core.findAll('li', 'acalog-course');

      listings.forEach((listing, index) => {
        //parse the info
        //separates the course number and title
        let arr = listing.text.split(" - ");
        
        //get course department and course number
        const course = arr[0].split(" ");
        const department = course[0];
        const courseNum = course[2];
        
        //get course title and credit weight
        arr = arr[1].split("Credits: ");
        const title = arr[0];
        const credits = arr[1];
        
        data.push({
          "department": department,
          "num": courseNum,
          "title": title,
          "track": track,
          "credits": credits
        });
      });
    });

    // Define CSV file structure
    const csvWriter = createCsvWriter({
      path: 'Course_Info.csv',
      header: [
        { id: 'department', title: 'Department' },
        { id: 'num', title: 'CourseNumber' },
        { id: 'title', title: 'Title' },
        { id: 'track', title: 'Track' },
        { id: 'credits', title: 'Credits' }
      ]
    });

    // console.log(data); //LOG
    // Write data to CSV
    await csvWriter.writeRecords(data);
    console.log('CSV file has been written successfully.');
  } catch (error) {
    console.error('Error occurred:', error);
  }
}
scrape();