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
    // console.log("Soup" + soup.findAll('td', 'block_content')); //LOG

    // extract data from the webpage
    const data = [];

    //grab all course listings
    const listings = soup.findAll('li', 'acalog-course');
    // console.log("Listings: " + listings);   //LOG

    listings.forEach((listing, index) => {
      //parse the info
      let course = listing.find('a');
      // console.log("Course: " + course);  //LOG
      //separates the course number and title
      const arr = course.text.split(" - ");
      //get course department and course number
      const code = arr[0].split(" ");
      let department = code[0];
      let courseNum = code[2];

      let title = arr[1];
      data.push({
        "department": department,
        "num": courseNum,
        "title": title
      });
    });
    // console.log(data);  //LOG

    // Define CSV file structure
    const csvWriter = createCsvWriter({
        path: 'Course_Info.csv',
        header: [
            { id: 'department', title: 'Department' },
            { id: 'num', title: 'Course Number' },
            { id: 'title', title: 'Title' }
        ]
    });

    // Write data to CSV
    await csvWriter.writeRecords(data);
    console.log('CSV file has been written successfully.');
  } catch (error) {
    console.error('Error occurred:', error);
  }
}
scrape();