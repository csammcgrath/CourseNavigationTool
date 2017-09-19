/* THIS DOCUMENT CONTAINS SCRIPT RELATED TO STARTING UP THE PAGE (i.e. building buttons) */

/* ------------------------- FILL THE PAGE ------------------------- /
  Imports HTML to various elements throughout the main page. This helps
  simplify the code used for the main page and keeps things organized.
  To add a new page, add it as an HTML 5 import and then add a new line
  in this function to import it to a specific element ID. Make sure the
  imports are in the same order as each push to the locations array.
/ -------------------------- FILL THE PAGE ------------------------ */

function fillPage() {
  var pages = document.querySelectorAll('link[rel="import"]');
  var locations = [];

  locations.push(document.querySelector('#settingsSidenav'));
  //locations.push(document.querySelector(...)) ~ Next location by ID for each page being imported
  //locations.push(...) ~ Do one of these for each imported page

  console.log(pages);
  console.log(locations);

  for (count = 0; count < locations.length; count++) {
    locations[count].innerHTML = pages[count].import;
  }
}

/* ------------------------- START THE SHOW ------------------------- /
  Initiates the parsing sequence, getting the show going.
/ -------------------------- START THE SHOW ------------------------ */

window.onload = function() {
  //fillPage();
  parseFactory('daylight.csv', 0);
};
