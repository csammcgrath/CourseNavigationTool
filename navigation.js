
/* ------------------------- MOVE TO LOCATION ------------------------- /
  Moves the user to a specific location on the page.
/ -------------------------- MOVE TO LOCATION ------------------------ */

function goHere(value) {
  var headers = document.getElementsByTagName('h2');
  for (r = 0; r < headers.length; r++) {
    if (headers[r].innerHTML.indexOf(value) == 0) {
      window.location.hash = headers[r].parentElement.parentElement.id;
      break;
    } else {
      console.log('Unable to find any courses');
    }
  }
  window.location.hash = location;
}

/* ------------------------- SCROLL TO TOP ------------------------- /
  Moves the user to the top of the page.
/ -------------------------- SCROLL TO TOP ------------------------ */

function scrollUp() {
  $(document.body).scrollTop(0);
}

/* ------------------------- SET UP QUICK-NAVS ------------------------- /
  Determines whether or not each quick-nav link is needed. These are the
  "A-Z" buttons located near the top of the page. If they are not needed,
  it simply hides them. This needs to be called when a filter is applied
  or removed.
/ -------------------------- SET UP QUICK-NAVS ------------------------ */

function setQuickNavs() {
  var buttons = document.getElementsByClassName('btn-quick-nav');
  var headers = document.getElementsByTagName('h2');

  for (b = 0; b < buttons.length; b++) {
    var color = true;
    for (r = 0; r < headers.length; r++) {
      //console.log(headers[r].inerHTML);
      //console.log(butts[b].innerHTML);
      if (headers[r].innerHTML.indexOf(buttons[b].innerHTML) == 0) {
        color = false;
        break;
      } else {
        color = true;
      }
    }
    if (color) {
      buttons[b].style.display = 'none';
    }
  }
}

/* ------------------------- TOGGLE CONTAINER ------------------------- /
  Toggles the visibility of a container.
/ -------------------------- TOGGLE CONTAINER ------------------------ */

function toggleContainer(container) {
  if (container.style.display === 'none') {
    container.style.display = '';
  } else {
    container.style.display = 'none';
  }
}

/* ------------------------- OPEN SIDE NAVIGATION -------------------------- /
  The first function displays the side navigation menu. The second closes it.
/ -------------------------- CLOSE SIDE NAVIGATION ------------------------ */

function showSidenav(button) {
  if (button.innerHTML != 'Online' ||
      button.innerHTML != 'Pathway' ||
      button.innerHTML != 'Campus') {

    document.getElementById('sidenav-title').innerHTML = button.textContent;
    document.getElementById('sidenav-closer').style.display = '';
    document.getElementById('mySidenav').style.marginRight = '0px';
    document.getElementById('mySidenav').style.width = '250px';

    buildSections(button);
  }
}

function hideSidenav() {
  document.getElementById('sidenav-closer').style.display = 'none';
  document.getElementById('mySidenav').style.marginRight = '-27px';
  document.getElementById('mySidenav').style.width = '0';
  document.getElementById('settingsSidenav').style.marginRight = '-27px';
  document.getElementById('settingsSidenav').style.width = '0';
}

/* ------------------------- SHOW SETTINGS SIDEBAR ------------------------- /
  The first function shows the settings sidebar. The second hides it.
/ -------------------------- HIDE SETTINGS SIDEBAR ------------------------ */

function showSettings() {
  document.getElementById('sidenav-closer').style.display = '';
  document.getElementById('settingsSidenav').style.marginRight = '0px';
  document.getElementById('settingsSidenav').style.width = '250px';
}

function hideSettings() {
  document.getElementById('sidenav-closer').style.display = 'none';
  document.getElementById('settingsSidenav').style.marginRight = '-27px';
  document.getElementById('settingsSidenav').style.width = '0';
}

/* ------------------------- OPEN ALL ------------------------- /
  Opens all sections, references, etc. for a course at once.
  Delays are built in as a precaution to prevent RAM overbearance.
/ -------------------------- OPEN ALL ------------------------ */

async function openAll() {
  var sectionButtons = document.querySelectorAll('.btn-section');
  $.each(sectionButtons, function(index, button) {
    button.click();
  });
}

/* ------------------------- OPEN COURSE ------------------------- /
  Opens a single url in a new tab.
/ -------------------------- OPEN COURSE ------------------------ */

function openCourse(url) {
  window.open(url, '_blank');
}

/* ------------------------- OPEN FIFTEEN ------------------------- /
  Opens list of courses between sections listed in button text.
/ -------------------------- OPEN FIFTEEN ------------------------ */

function openFifteen(sections) {

  var min = sections.split(' ')[1];
  var max = sections.split(' ')[3];
  console.log(min);
  console.log('Max: ' + max);

  if (sections.split(' ')[1] === 'R') {
    sectionButtons[0].click();
    min = 0;
  }

  $.each(sectionButtons, function(index, sectionButton) {

    if (sectionButton.innerHTML.split(' ')[1] >= min &&
        sectionButton.innerHTML.split(' ')[1] <= max) {

      sectionButton.click();
    }
  });

}

/* ------------------------- CURRENT DATE ------------------------- /
  Retrieves the current semester, based on the week of the year.
/ -------------------------- CURRENT DATE ------------------------ */

function getSemester() {
  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1;
  var year = dateObj.getUTCFullYear();

  if (month >= 1 && month < 4) {
    return 'Winter ' + year;
  } else if (month >= 4 && month <= 7) {
    return 'Spring ' + year;
  } else if (month == 8) {
    return 'Summer ' + year;
  } else if (month >= 9 && month <= 12) {
    return 'Fall ' + year;
  }
}

/* ------------------------- COURSE SEARCH ------------------------- /
  This function activates on each keystroke in the search bar. It is
  what changes the buttons at the top of the page, by the search bar,
  to the course most similar to what the user has typed.
/ -------------------------- COURSE SEARCH ------------------------ */

function courseSearch(keyed) {
  console.log(keyed);

  $.each(unitArray, function(index, unit) {

    if (unit.code.toLowerCase().includes(keyed.toLowerCase()) &&
        unit.platform.toLowerCase != 'other') {

      console.log(unit.platform.toLowerCase());
      console.log(unit.name);
      console.log(document.querySelector('#search-' +
      unit.platform.toLowerCase()).innerHTML);

      document.querySelector('#search-' +
      unit.platform.toLowerCase()).innerHTML = unit.code;

      return true;
    }
  });
}
