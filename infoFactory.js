/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\
| Brigham Young University - COURSE NAVIGATION TOOL                            |
|                                                                              |
| Developed by:         Testing by:                                            |
| - Sam McGrath         - Course Support                                       |
| - Zach Williams                                                              |
\>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

/* GLOBAL VARIABLES */
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NEED TO REMOVE GLOBAL VARIABLES
var parseResults = [];
var cleanArray = [];

// Object Array
var courseArray = [];
var courseCSSArray = [];
var sectionArray = [];

var unitArray = [];
var unitHeaders = [];
var sectionButtons = [];
var semester = 'Fall 2017';

// categoryArray[category][categoryTitle(0)/courses(1)][specificCourse][specificSection]

// Files to be parsed
var files = [
  'daylight.csv',           // Brightspace Sections, Pilots, and References
  'pathway-reference.csv',  // Pathway References
  'pathway-sections.csv',   // Pathway sections, and Pilots
  'only-campus.csv'         // Campus sections and References -- need to be updated
                            // NOTE: The only-campus file should be cleansed by
                            // the Sam McGrath script first (to remove campus)
];

/* END OF GLOBAL VARIABLES */

/* ---------------------------- PARSE FILES ---------------------------- /
 This function parses the provided files. It will recursively call the function
 until all files are parsed. This is to prevent parse-time issues caused when
 asychronously parsing all files. They need to be completed in order.
/ ----------------------------- PARSE FILES --------------------------- */

function parseFactory(file, count) {
  // Establish how many files have been parsed so far
  var parseCount = count;
  // Parse the next file
  Papa.parse(file, {
    download: true,
    delimiter: 'auto',
    complete: function(results) {
      //Push the parsed results to the full array
      parseResults.push(results);
      //If all files are parsed, then sort the results into arrays
      if (parseResults.length >= files.length) {
        sortFactory();
      } else {
        // Up the parseCount so it knows how many files were parsed
        parseCount++;
        // Start the next file parsing
        parseFactory(files[parseCount], parseCount);
      }
    }
  });
}

/* -------------------------- CLEAN PARSE RESULTS -------------------------- /
  Cleanses the results from parsing the files, getting rid of any sandboxes,
  blank courses, duplicates, course council copies, development courses,
  and the like. It also creates the objects needed for each object array.
/ --------------------------- CLEAN PARSE RESULTS ------------------------- */

function sortFactory() {

  var temp = 'default';

  // For each array of parsed results from each file
  $.each(parseResults, function(index, array) {
    // For each row from the array of parsed data
    $.each(array.data, function(row, contents) {

      var cells = contents[0].split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);

      // Create new object
      var unit = {
        name: '',     // Unit's full course title
        url: '',      // URL directly to the unit in Brightspace
        ID: '',       // Org Unit ID (Number at end of URL)
        type: '',     // Type: Reference, Block-Reference, Pilot-Reference, Pilot-Section
        platform: '', // Platform: Campus, Online, Pathway
        code: ''      // Code: Course Code (Trimmed name)
      };

      unit.name = cells[1];
      unit.url = cells[0];
      unit.ID = cells[2];
      unit.platform = getPlatform(cells[1]);
      unit.type = getType(cells[1]);
      unit.code = trimName(cells[1], unit.type);

      if (unit.name === undefined                 ||
          unit.name.includes('OL')                ||
          unit.name.includes('Approved')          ||
          unit.type.toLowerCase() === 'other'     ||
          unit.platform.toLowerCase() === 'other' ||
          unit.code === 'Invalid'                 ||
          unit.name.includes('SMM')) {

        return true;
      }

      unitArray.push(unit);

    });
  });
  getHeaders(unitArray);
}

/* -------------------------- TRIM NAME -------------------------- /
  Returns the trimmed name of the course (what appears on the button).
/ --------------------------- TRIM NAME ------------------------- */

function trimName(name, type) {
  var code = 'Default';

  // If it's empty, skip it
  // Return the correct code based on if it is a section or reference
  if (name === undefined) {
    return 'Empty';
  } else if (type === 'Section') {
    code = name.split(':')[0];
  } else {
    if (name.split(' - ').length < 2) {
      return 'Invalid';
    }
    code = name.split(' - ')[0];
  }

  // If the trimmed code still contains quotes, get rid of them
  if (code.includes('"')) {
    code = code.replace('"', '');
  }
  return code;
}

/* -------------------------- FIND COURSE PLATFORM -------------------------- /
  Returns the platform the given course is on. Campus, Online, or Pathway.
/ --------------------------- FIND COURSE PLATFORM ------------------------- */

function getPlatform(course) {

  var typeChecks = ['Online','Pathway','Campus'];
  var platform = 'Other';

  $.each(typeChecks, function(index, type) {
    if (course === undefined) {
      return true;
    } else if (course.includes(type)) {
      if (course.includes('Online') &&
          course.includes('Gathering')) {
        platform = 'Pathway';
      } else {
        platform = type;
      }
    }
  });
  return platform;
}

/* -------------------------- FIND COURSE TYPE -------------------------- /
  Returns the unit type. Section, Reference, Block Reference, Pilot Ref,
  Pilot Section, etc.
/ --------------------------- FIND COURSE TYPE ------------------------- */

function getType(course) {
  var typeChecks = ['Preview','Old','Block Reference','Reference',
  'Pilot',':'];
  var unitType = 'Other';

  $.each(typeChecks, function(index, type) {
    if (course === undefined) {
      return false;
    } else if (course.includes(type)) {
      if (index < 2) {
        unitType = 'Other';
      } else if (index === 5) {
        if (course.includes(semester)) {
          unitType = 'Section';
        } else {
          unitType = 'Other';
        }
      } else {
        unitType = type;
      }
      return false;
    }
  });
  return unitType;
}

/* -------------------------- CATEGORIZE OBJECTS -------------------------- /
  Dynamically creates and then saves the index of each unit within the
  unitArray so it can be easily pulled from it. Creates an array of each
  category, with all the courses of that category.
/ --------------------------- CATEGORIZE OBJECTS ------------------------- */

function getHeaders(units) {
  var exists = false;
  $.each(units, function(unitIndex, unit) {
    // Get just the course header (i.e. ACCTG)
    var category = unit.code.split(' ')[0];

    if (category.includes('Approved') ||
        category.includes('Invalid')  ||
        category === ('OL')) {
      return true;
    }

    $.each(unitHeaders, function(index, header) {
      exists = false;
      // See if we have a header for this course already
      if (category === header) {
        exists = true;
        return false;
      }
    });
    // If we don't have a header, add one
    if (!exists) {
      unitHeaders.push(category);
    }
  });
  removeQuickNavs();
}

/* -------------------------- BUILD CATEGORY BUTTONS -------------------------- /
  When a user selects a quick-nav button, it builds all of the different
  category buttons using this function.
/ --------------------------- BUILD CATEGORY BUTTONS ------------------------- */

function giveCategories(letter) {
  $('#course-group-container').empty();
  $.each(unitHeaders, function(index, header) {
    if (letter === header[0]) {
      $('#course-group-container').append('<div' +
      ' class="pane-clear course-group"' +
      ' onclick="generateButtons(this.innerHTML);">' + header + '</div>');
    }
  });
  if (letter != 'All') {
    document.querySelector('.course-group').click();
  } else {
    $('#course-group-container').html('<div style="text-align:center">' +
    'All courses are available below.</div>');
    generateButtons('All');
  }
}

/* -------------------------- GENERATE QUICK-NAVS -------------------------- /
  After the headers are all found, this function removes any of the 26 quick-nav
  buttons that don't have any headers related to them (no "J" courses).
/ --------------------------- GENERATE QUICK-NAVS ------------------------- */

function removeQuickNavs() {
  var quickNavs = document.querySelectorAll('.btn-quick-nav');
  $.each(quickNavs, function(count, quickNav) {
    var exists = false;
    $.each(unitHeaders, function(index, header) {
      if (quickNavs[count].innerHTML === header[0]) {
        exists = true;
        return false;
      }
    });
    if (!exists) {
      quickNavs[count].style.display = 'none';
    }
  });
  document.querySelector('#quick-nav').style.visibility = 'visible';
  document.querySelector('.btn-quick-nav').click();
  document.querySelector('#course-group-container').firstChild.click();
}

/* -------------------------- GENERATE COURSE BUTTONS ------------------------ /
  After the headers are all found, this function removes any of the 26 quick-nav
  buttons that don't have any headers related to them (no "J" courses).
/ --------------------------- GENERATE COURSE BUTTONS ----------------------- */

function generateButtons(category) {

  currentCategory = category;

  $('#buttonContainer').empty();
  var temp;

  $.each(unitArray, function(index, unit) {
    if (unit.code === temp ||
        (unit.platform === 'Online' &&
        document.querySelector('#onlineToggle').checked === false) ||
        (unit.platform === 'Pathway' &&
        document.querySelector('#pathwayToggle').checked === false) ||
        (unit.platform === 'Campus' &&
        document.querySelector('#campusToggle').checked === false)) {

      return true;

    }
    temp = unit.code;
    var classes = unit.platform.toLowerCase();
    if (unit.platform === 'Pilot') {
      classes = unit.type.toLowerCase();
    }

    if (unit.code.split(' ')[0] === category ||
        category === 'All') {
      $('#buttonContainer').append(
        '<div class="btn-' + unit.platform.toLowerCase() +
        '" onclick="showSidenav(this)"' + ' style="width: calc(25% - 12px);">' +
         unit.code + '</div>'
      );
      return true;
    }
  });
  if (document.querySelector('#buttonContainer').children.length === 0) {
    $('#buttonContainer').html('<div style="text-align:center;">There ' +
    'are no available courses. This may be because of selected filters in ' +
    'the \"settings\" menu.');
  }
}

/* -------------------------- BUILD SECTION BUTTONS ------------------------ /
  When a user clicks on a course button, this function generates all of the
  section buttons inside the sideNav.
/ --------------------------- BUILD SECTION BUTTONS ----------------------- */

function buildSections(button) {

  document.querySelector('#btn-all').style.display = '';
  $('#section-button-container').empty();
  $('#multi-section').empty();

  $.each(unitArray, function(index, unit) {

    var classes = 'btn-section btn-' + unit.platform.toLowerCase();
    var title;

    if (unit.type === 'Reference') {
      title = 'Reference';
    } else if (unit.type === 'Block Reference') {
      title = 'Block Reference';
    } else if (unit.type === 'Pilot') {
      title = 'Pilot Reference';
    } else if (unit.type === 'Section') {
      title = 'Section ' + unit.name.split(': ')[1].split(' ')[0];
    }

    if (button.innerHTML === unit.code &&
        button.className.toLowerCase().includes(unit.platform.toLowerCase())) {

      $('#section-button-container').append(
        '<div class="' + classes +
         '" onclick="openCourse(\'' + unit.url + '\')">' +
          title + '</div>'
      );
    }
  });

  sectionButtons = document.querySelectorAll('.btn-section');

  if (sectionButtons.length > 25) {
    document.querySelector('#btn-all').style.display = 'none';

    var startCount = 0;
    var endCount = 15;
    var startSection = 'XX';
    var endSection = 'YY';

    for (x = 0; x <= sectionButtons.length; x++) {

      // Every fifteenth button... Or if we're on the last button.
      if (x % 15 === 0 ||
      x === sectionButtons.length) {

        if (x === sectionButtons.length) {
          break;
        }
        // If we're on the first button, then set it as the reference
        if (x === 0) {
          startSection = 'R';
        } else {
          try {
            startSection = sectionButtons[startCount].innerHTML.split(' ')[1];
          } catch (error) {
            //Do nothing;
          }
        }
        endSection = sectionButtons[endCount].innerHTML.split(' ')[1];

        $('#multi-section')
        .append('<div class="btn-section" ' +
        'onclick="openFifteen(this.innerHTML)">Open ' +
        startSection + ' - ' + endSection + '</div>');
        startCount = endCount + 1;

        if (endCount + 15 >= sectionButtons.length) {
          endCount = sectionButtons.length - 1;
        } else {
          endCount += 15;
        }
      }
    }
  }
}

/* ------------------------- SLEEP ------------------------- /
  Used to cause a delay. Sometimes useful.
/ -------------------------- SLEEP ------------------------ */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
