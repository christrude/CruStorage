angular.module('cruvitaApp').constant('Config', {
  autocompleteService: 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCc2xSsYmFpNiHcRk-DuHkSVVxi9Rt9xFA&components=country:us',
  maintenance: false,
  mapDefaults: {
    center: { latitude: 0, longitude: 0 },
    zoom: null,
    dragging: false,
    polylines: [],
    bounds: { },
    polys: [],
    draw: undefined
  },
  mapOptions: {
    scrollwheel: false,
    mapTypeControl: false,
    streetViewControl: false
  },
  defaultPolyline: {
    stroke: {
      color: '#6060FB',
      weight: 1
    },
    editable: true,
    draggable: false,
    geodesic: false,
    visible: true,
    clickable: true
  },
	locationTypes: {
		'z':'zip',
		'c':'city',
		'y':'county',
		's':'state',
		'h':'school',
		'e':'school',
		'm':'school'
	},
	schoolTypes: {
		'1': 'e',
		'2': 'm',
		'3': 'h'
	},
  advancedSchoolFilters: {
    edLevel: {
      defaultText: 'Education Level',
      options: [{
        label: 'Elem School',
        key: 'ed_level',
        type: 'equals',
        value: '1'
      },{
        label: 'Middle School',
        key: 'ed_level',
        type: 'equals',
        value: '2'
      },{
        label: 'High School',
        key: 'ed_level',
        type: 'equals',
        value: '3'
      },{
        label: 'All Schools',
        key: 'ed_level',
        type: 'equals',
        value: 'all'
      }]
    },
    score: {
      label: 'Grade',
      options: [{
        value: 44,
        label: 'A and Better',
        key: 'score.overall',
        type: 'max'
      },{
        value: 912,
        label: 'B and Better',
        key: 'score.overall',
        type: 'max'
      },{
        value: 14034,
        label: 'C and Better',
        key: 'score.overall',
        type: 'max'
      },{
        value: 223670,
        label: 'D and Better',
        key: 'score.overall',
        type: 'max'
      }]
    },
  },
  zoomAreaMap: [{
    min: 1,
    zoom: 8
  },{
    min: 0.5,
    zoom: 9
  },{
    min: 0.1,
    zoom: 10
  },{
    min: 0.05,
    zoom: 11
  },{
    min: 0.02,
    zoom: 12
  },{
    min: 0.005,
    zoom: 13
  },{
    min: 0.0005,
    zoom: 14
  },{
    min: 0.0001,
    zoom: 15
  },{
    min: 0,
    zoom: 16
  }],
  areasServed: [
    {
      label: "Florida",
      areas: [{
        label: "Boca Raton",
        urlLocation: "boca-raton-fl"
        },{
        label: "Delray Beach",
        urlLocation: "delray-beach-fl"
        },{
        label: "Lake Worth",
        urlLocation: "lake-worth-fl"
        },{
        label: "Wellington",
        urlLocation: "wellington-fl"
        },{
        label: "Royal Palm Beach",
        urlLocation: "royal-palm-beach-fl"
        },{
        label: "West Palm Beach",
        urlLocation: "west-palm-beach-fl"
        },{
        label: "Palm Beach Gardens",
        urlLocation: "palm-beach-gardens-fl"
        },{
        label: "Jupiter",
        urlLocation: "jupiter-fl"
        },{
        label: "Stuart",
        urlLocation: "stuart-fl"
        },{
        label: "Port St. Lucie",
        urlLocation: "port-st.-lucie-fl"
        },{
        label: "Fort Pierce",
        urlLocation: "fort-pierce-fl"
        }
      ]
    },{
      label: "Maryland",
      areas: [{
        label: "Annapolis",
        urlLocation: "annapolis-md"
        },{
        label: "Baltimore",
        urlLocation: "baltimore-md"
        },{
        label: "Bethesda",
        urlLocation: "bethesda-md"
        },{
        label: "Beltsville",
        urlLocation: "beltsville-md"
        },{
        label: "Columbia",
        urlLocation: "columbia-md"
        },{
        label: "College Park",
        urlLocation: "college-park-md"
        },{
        label: "Frederick",
        urlLocation: "frederick-md"
        },{
        label: "Gaithersburg",
        urlLocation: "gaithersburg-md"
        },{
        label: "Glen Burnie",
        urlLocation: "glen-burnie-md"
        },{
        label: "Hagerstown",
        urlLocation: "hagerstown-md"
        },{
        label: "New Carrollton",
        urlLocation: "new-carrollton-md"
        },{
        label: "Potomac",
        urlLocation: "potomac-md"
        },{
        label: "Rockville",
        urlLocation: "rockville-md"
        },{
        label: "Silver Spring",
        urlLocation: "silver-spring-md"
        },{
        label: "Towson",
        urlLocation: "towson-md"
        },{
        label: "Waldorf",
        urlLocation: "waldorf-md"
        },{
        label: "Wheaton-Glenmont",
        urlLocation: "wheaton-md"
        }
      ]
    },{
      label: "Michigan",
      areas: [{
        label: "Ann Arbor",
        urlLocation: "ann-arbor-mi"
        },{
        label: "Chelsea",
        urlLocation: "chelsea-mi"
        },{
        label: "Dexter",
        urlLocation: "dexter-mi"
        },{
        label: "Saline",
        urlLocation: "saline-mi"
        },{
        label: "Northville",
        urlLocation: "northville-mi"
        },{
        label: "Ypsilanti",
        urlLocation: "ypsilanti-mi"
        }
      ]
    },{
      label: "North Carolina",
      areas: [{
        label: "Raleigh",
        urlLocation: "raleigh-nc"
        },{
        label: "Durham",
        urlLocation: "durham-nc"
        },{
        label: "Chapel Hill",
        urlLocation: "chapel-hill-nc"
        },{
        label: "Wake Forest",
        urlLocation: "wake-forest-nc"
        },{
        label: "Rolesville",
        urlLocation: "rolesville-nc"
        },{
        label: "Cary",
        urlLocation: "cary-nc"
        },{
        label: "Apex",
        urlLocation: "apex-nc"
        },{
        label: "Holly Springs",
        urlLocation: "holly-springs-nc"
        }
      ]
    },{
      label: "Texas",
      areas: [{
        label: "Arlington",
        urlLocation: "arlington-tx"
        },{
        label: "Carrollton",
        urlLocation: "carrollton-tx"
        },{
        label: "Dallas",
        urlLocation: "dallas-tx"
        },{
        label: "Denton",
        urlLocation: "denton-tx"
        },{
        label: "Flower Mound",
        urlLocation: "flower-mound-tx"
        },{
        label: "Fort Worth",
        urlLocation: "fort-worth-tx"
        },{
        label: "Frisco",
        urlLocation: "frisco-tx"
        },{
        label: "Garland",
        urlLocation: "garland-tx"
        },{
        label: "Grand Prairie",
        urlLocation: "grand-prairie-tx"
        },{
        label: "Grapevine",
        urlLocation: "grapevine-tx"
        },{
        label: "Irving",
        urlLocation: "irving-tx"
        },{
        label: "Lewisville",
        urlLocation: "lewisville-tx"
        },{
        label: "McKinney",
        urlLocation: "mckinney-tx"
        },{
        label: "Mesquite",
        urlLocation: "mesquite-tx"
        },{
        label: "North Richland Hills",
        urlLocation: "north-richland-hills-tx"
        },{
        label: "Plano",
        urlLocation: "plano-tx"
        },{
        label: "Richardson",
        urlLocation: "richardson-tx"
        },{
        label: "Rockwall",
        urlLocation: "rockwall-tx"
        },{
        label: "Southlake",
        urlLocation: "southlake-tx"
        }
      ]
    },{
      label: "Virginia",
      areas: [{
        label: "Arlington",
        urlLocation: "arlington-va"
        },{
        label: "Alexandria",
        urlLocation: "alexandria-va"
        },{
        label: "Ashburn",
        urlLocation: "ashburn-va"
        },{
        label: "Burke",
        urlLocation: "burke-va"
        },{
        label: "Chantilly",
        urlLocation: "chantilly-va"
        },{
        label: "Chesapeake",
        urlLocation: "chesapeake-va"
        },{
        label: "Fairfax City",
        urlLocation: "fairfax-va"
        },{
        label: "Falls Church",
        urlLocation: "falls-church-va"
        },{
        label: "Great Falls",
        urlLocation: "great-falls-va"
        },{
        label: "Gainesville",
        urlLocation: "gainesville-va"
        },{
        label: "Hampton",
        urlLocation: "hampton-va"
        },{
        label: "Herndon",
        urlLocation: "herndon-va"
        },{
        label: "Leesburg",
        urlLocation: "leesburg-va"
        },{
        label: "Manassas",
        urlLocation: "manassas-va"
        },{
        label: "Newport News",
        urlLocation: "newport-news-va"
        },{
        label: "Norfolk",
        urlLocation: "norfolk-va"
        },{
        label: "Oakton",
        urlLocation: "oakton-va"
        },{
        label: "Reston",
        urlLocation: "reston-va"
        },{
        label: "Springfield",
        urlLocation: "springfield-va"
        },{
        label: "Sterling",
        urlLocation: "sterling-va"
        },{
        label: "Suffolk",
        urlLocation: "suffolk-va"
        },{
        label: "Tysons Corner",
        urlLocation: "tysons-corner-va"
        },{
        label: "Vienna",
        urlLocation: "vienna-va"
        },{
        label: "Virginia Beach",
        urlLocation: "virginia-beach-va"
        },{
        label: "Portsmouth",
        urlLocation: "portsmouth-va"
        },{
        label: "Warrenton",
        urlLocation: "warrenton-va"
        },{
        label: "Woodbridge",
        urlLocation: "woodbridge-va"
        }
      ]
    },{
      label: "Washington, DC",
      areas: [
        {
        label: "District of Columbia",
        urlLocation: "washington-dc"
        }
      ]
    }
  ],
	gradeScale: [
		{
			low: 0,
			value: 'A+',
			icon: '/assets/images/ic-school-a.png',
			color: 'rgba(0, 179, 0, 1)'
		},
		{
			low: 102,
			value: 'A',
			icon: '/assets/images/ic-school-a.png',
			color: 'rgba(0, 179, 0, 1)'
		},
		{
			low: 476,
			value: 'A-',
			icon: '/assets/images/ic-school-a.png',
			color: 'rgba(0, 179, 0, 1)'
		},
		{
			low: 1245,
			value: 'B+',
			icon: '/assets/images/ic-school-b.png',
			color: 'rgba(134, 179, 0, 1)'
		},
		{
			low: 2470,
			value: 'B',
			icon: '/assets/images/ic-school-b.png',
			color: 'rgba(134, 179, 0, 1)'
		},
		{
			low: 4287,
			value: 'B-',
			icon: '/assets/images/ic-school-b.png',
			color: 'rgba(134, 179, 0, 1)'
		},
		{
			low: 6746,
			value: 'C+',
			icon: '/assets/images/ic-school-c.png',
			color: 'rgba(253, 219, 82, 1)'
		},
		{
			low: 17900,
			value: 'C',
			icon: '/assets/images/ic-school-c.png',
			color: 'rgba(253, 219, 82, 1)'
		},
		{
			low: 40870,
			value: 'C-',
			icon: '/assets/images/ic-school-c.png',
			color: 'rgba(253, 219, 82, 1)'
		},
		{
			low: 93996,
			value: 'D+',
			icon: '/assets/images/ic-school-d.png',
			color: 'rgba(216, 143, 78, 1)'
		},
		{
			low: 130257,
			value: 'D',
			icon: '/assets/images/ic-school-d.png',
			color: 'rgba(216, 143, 78, 1)'
		},
		{
			low: 179260,
			value: 'D-',
			icon: '/assets/images/ic-school-d.png',
			color: 'rgba(216, 143, 78, 1)'
		},
		{
			low: 259755,
			value: 'F',
			icon: '/assets/images/ic-school-f.png',
			color: 'rgba(197, 0, 0, 1)'
		}
	]
});
