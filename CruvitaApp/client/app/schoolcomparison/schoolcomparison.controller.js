'use strict';

angular.module('cruvitaApp')
  .controller('SchoolcomparisonCtrl', function ($scope, $stateParams, $window, Homes, Config, $filter, $state, User, SchoolComparisonStorageService, RankClasses) {
    $scope.ethnicData = {};
    $scope.ethnicDataLabels = ['American Indian', 'Asian', 'Hispanic', 'Black', 'White', 'Pacific Islander', 'Multi-Ethnic'];
    $scope.genderData = {};
    $scope.genderDataLabels = ['Male', 'Female'];
    $scope.comparedSchools = [];
    $scope.agent = SchoolComparisonStorageService.agent();
    $scope.location = SchoolComparisonStorageService.address();

    // if($stateParams.user){
    //   var userPromise = User.get({id: $stateParams.user}, function(response) {
    //     $scope.agent = response;
    //   }).$promise
    // }


    /*********************************** ******\
       start of functions for pdf processing
    \*****************************************/

  function _getOrdinal(n){
     var s=["th","st","nd","rd"],
      v=n%100;
      return (s[(v-20)%10]||s[v]||s[0]);
  }

  function _slugify(text){
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
    }

  function _makePdfData(){

    // add correct banner to each school
    var schoolData = {
      "1": {banner: "https://www.cruvita.com/assets/images/elementary.png", class: "elementary"},
      "2": {banner: "https://www.cruvita.com/assets/images/middle.png", class: "middle"},
      "3": {banner: "https://www.cruvita.com/assets/images/high.png", class: "high"}
    }

    angular.forEach($scope.comparedSchools, function(school){
      school.pdf = {};
      school.pdf.banner = schoolData[(school.ed_level)].banner;
      school.pdf.class = schoolData[(school.ed_level)].class;
      school.pdf.phone = $filter('tel')(school.phone)
    })

    // add ethnic and gender data
    var ethnicLabels = {
      numAmInd: 'American Indian',
      numAsian: 'Asian',
      numHisp: 'Hispanic',
      numBlack: 'Black',
      numWhite: 'White',
      numPacific: 'Pacific Islander',
      numMulti: 'Multi-Ethnic'
    }

    angular.forEach($scope.comparedSchools, function(school){
          school.pdf.ethnicDataHighCharts = [];
          angular.forEach(school.schoolDiversity, function(v, k){
            school.pdf.ethnicDataHighCharts.push({name: ethnicLabels[k], y: parseFloat(v)})
          });

          school.pdf.percentMale = Math.round(100*parseFloat(school.schoolGenders.male)  / (parseFloat(school.schoolGenders.male) + parseFloat(school.schoolGenders.female)));
          school.pdf.percentFemale = Math.round(100*parseFloat(school.schoolGenders.female)  / (parseFloat(school.schoolGenders.male) + parseFloat(school.schoolGenders.female)));

          school.pdf.stRatio = Math.round(school.stRatio*10) / 10;
          school.pdf.freeLunchP = Math.round(100*school.freeLunchP)

    });


    // format the rankings
    angular.forEach($scope.comparedSchools, function(school){
      school.pdf.county = {rank: school.rank.county.rank.toLocaleString(), ordinal: _getOrdinal(school.rank.county.rank), total: school.rank.county.total.toLocaleString()};
      school.pdf.state  = {rank: school.rank.state.rank.toLocaleString(), ordinal:  _getOrdinal(school.rank.state.rank), total: school.rank.state.total.toLocaleString()};
      school.pdf.nation  = {rank: school.rank.nation.rank.toLocaleString(), ordinal:  _getOrdinal(school.rank.nation.rank), total: school.rank.nation.total.toLocaleString()};
    })

    $scope.pdfData = {schools: $scope.comparedSchools, agent: $scope.agent, location: $scope.location}
  }

  function _arrayBufferToBase64(buffer) {
      var binary = '';
      var bytes = new Uint8Array( buffer );
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
      }
      return window.btoa( binary );
  }


  function _makePdf(data){

      var b = _arrayBufferToBase64(data.data);
      var pdf = 'data:application/pdf;base64,' + b ;

      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";
      a.href = pdf;
      a.download = _slugify($scope.location) + ".pdf";
      a.click();

  }

    $scope.printDocument = function(){
      $scope.pdfPromise = SchoolComparisonStorageService.getPdf($scope.pdfData).then(function(data){
        _makePdf(data)
      },function(err){
        console.log('error getting pdf', err)
      })
    }

    /*****************************************\
       end of functions for pdf processing
    \*****************************************/




		if($stateParams.address) {
	    $scope.schoolsPromise = Homes.schools({address: $stateParams.address}, function(response) {
				if(response.elementarySchool){
          $scope.comparedSchools.push(response.elementarySchool);
        }
        if(response.middleSchool){
          $scope.comparedSchools.push(response.middleSchool);
        }
        if(response.highSchool){
          $scope.comparedSchools.push(response.highSchool);
        }

        _.each(Config.gradeScale, function(grade, index) {
          _.forEach($scope.comparedSchools, function(school, i){
            if (school.score && school.score.overall >= grade.low && (index === Config.gradeScale.length - 1 || school.score.overall < Config.gradeScale[index+1].low)) {
              $scope.comparedSchools[i].icon = grade.icon;
              $scope.comparedSchools[i].grade = grade.value;
              $scope.comparedSchools[i].color = grade.color;
            }
          })
        });

        $scope.scoreExists = function(score) {
          if (score < 999999999){
            return true;
          }
        };

        _.forEach($scope.comparedSchools, function(school){
          $scope.ethnicData[school.sch_name] = [];
          $scope.genderData[school.sch_name] = [];

          _.forEach(school.schoolDiversity, function(k, v){
            k = k / school.member;
            k = k * 100;
            k = $filter('number')(k, 0);
            $scope.ethnicData[school.sch_name].push(k);
          });
          _.forEach(school.schoolGenders, function(k, v){
            $scope.genderData[school.sch_name].push(k);
          });
        });

        _makePdfData();

	    }).$promise;

      $scope.goToSchool = function(slug) {
        $state.go('school', {id: slug});
      }
      $scope.setCountyRank = function(school){
        return RankClasses.rankClasses(school, 'county', 'med');
      };
      $scope.setStateRank = function(school){
        return RankClasses.rankClasses(school, 'state', 'med');
      };
      $scope.setNationRank = function(school){
        return RankClasses.rankClasses(school, 'nation', 'med');
      };
      $scope.setCountyRankImg = function(school){
        return RankClasses.rankImg(school, 'county', 'med');
      };
      $scope.setStateRankImg = function(school){
        return RankClasses.rankImg(school, 'state', 'med');
      };
      $scope.setNationRankImg = function(school){
        return RankClasses.rankImg(school, 'nation', 'med');
      };
		}
  });
