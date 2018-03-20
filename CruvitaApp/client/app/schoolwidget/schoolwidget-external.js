'use strict';

function submitForm() {
    var xmlhttp;
		var homeAddress = document.getElementById("homeAddress").value;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           	if(xmlhttp.status == 200){
				tableCreate(JSON.parse(xmlhttp.responseText));
           	}
        }
    }

    xmlhttp.open("GET", "https://www.cruvita.com/api/homes/schools?address=" + homeAddress, true);
		xmlhttp.setRequestHeader("Content-type", "text/plain");
    xmlhttp.send();
}

function tableCreate(input) {
    var tbl = document.getElementById("schoolsTable");
		tbl.innerHTML = "";
    var tbdy = document.createElement('tbody');
    if (window.a === 'link'){
      if(input.elementary && input.elementaryScore) {
        tbdy.appendChild(addSchoolWithLink(input, 'elementary'));
      }
      if(input.middle && input.middleScore) {
        tbdy.appendChild(addSchoolWithLink(input, 'middle'));
      }
      if(input.high && input.highScore) {
        tbdy.appendChild(addSchoolWithLink(input, 'high'));
      }
    } else {
      if(input.elementary && input.elementaryScore) {
        tbdy.appendChild(addSchool(input, 'elementary'));
      }
      if(input.middle && input.middleScore) {
        tbdy.appendChild(addSchool(input, 'middle'));
      }
      if(input.high && input.highScore) {
        tbdy.appendChild(addSchool(input, 'high'));
      }
    }

    tbl.appendChild(tbdy);
}

function addSchool(school, key) {
	var tr = document.createElement('tr');
      var schoolName = document.createElement('td');
	schoolName.innerHTML = school[key];
      tr.appendChild(schoolName);

	var schoolGrade = document.createElement('td');
	schoolGrade.innerHTML = school[key + 'Grade'];
	tr.appendChild(schoolGrade);

	return tr;
}

function addSchoolWithLink(school, key) {
	//Need to add a link back to the school page here.
	var tr = document.createElement('tr');

	var schoolName = document.createElement('td');
	schoolName.innerHTML = '<a href="https://www.cruvita.com/school/'
      + school[key + "Slug"]
      + '" target="_blank" title="'
      + school[key]
      + '" alt="'
      + school[key]
      + '">'
      + school[key]
      + '</a>';


      tr.appendChild(schoolName);

	var schoolGrade = document.createElement('td');
	schoolGrade.innerHTML = school[key + 'Grade'];
	tr.appendChild(schoolGrade);

	return tr;
}

function buildInitialHTML() {
	var mountingDiv = document.getElementById('cruvita-school-finder');
	mountingDiv.innerHTML = '<div class="school-widget-section">'+
      '<h3> Enter the Address. <br /> Find the Schools.</h3>' +
	'<form name="form" submit="javascript: submitForm()">' +
	  '<div class="cru-input-container">' +
	    '<input type="text" class="cru-input" id="homeAddress" required placeholder="Enter Street Address" />' +
	  '</div>' +
	  '<a href="javascript: submitForm()" type="submit" class="find-button">Find My Schools</a>' +
	'</form>' +
	'<table class="cru-table" id="schoolsTable"></table>' +
	'<div class="bottom-section"><a href="https://www.cruvita.com/cruvita-school-finder" target="_blank">Powered by the Real Estate Professionals at <img src="https://www.cruvita.com/assets/images/cruvita_175x40.png" alt="Cruvita Logo"/></a>' +
	'<small><p>Disclaimer:  Cruvita uses the most up to date information supplied by the U.S. Department of Education, however to be certain of the schools associated with a specific home address contact the school district, or specific school, directly.</p></small></div>' +
	'</div>';
}