'use strict';

angular.module('cruvitaApp')
  .factory('RankClasses', function () {
    var a = 5e-2,
        b = 1e-1,
        c = 25e-2;

    var aa = 2500,
        bb = 5000,
        cc = 15000,
        dd = 25000;

    return {
      rankClasses:function(school, locale, size){
        if(school && school.rank){
          var rankPct = school.rank[locale].rank/school.rank[locale].total;
        }

				if(school && school.rank) {
	        if (size === 'small' || !size){
	          if ((school.rank[locale].total > 20 && rankPct <= a ) || (school.rank[locale].total < 20 && school.rank[locale].rank == 1)){
	            return 'gold-small medal-small';
	          } else if ((school.rank[locale].total > 20 && (rankPct > a && rankPct <= b)) || (school.rank[locale].total < 20 && school.rank[locale].rank == 2)){
	            return 'silver-small medal-small';
	          } else if ((school.rank[locale].total > 20 && (rankPct > b && rankPct <= c)) || (school.rank[locale].total < 20 && school.rank[locale].rank == 3)){
	            return 'bronze-small medal-small';
	          }
	        } else if (size === 'med'){
	          if ((school.rank[locale].total > 20 && rankPct <= a ) || (school.rank[locale].total < 20 && school.rank[locale].rank == 1)){
	            return 'gold-med medal-med';
	          } else if ((school.rank[locale].total > 20 && (rankPct > a && rankPct <= b)) || (school.rank[locale].total < 20 && school.rank[locale].rank == 2)){
	            return 'silver-med medal-med';
	          } else if ((school.rank[locale].total > 20 && (rankPct > b && rankPct <= c)) || (school.rank[locale].total < 20 && school.rank[locale].rank == 3)){
	            return 'bronze-med medal-med';
	          }
	        } else if (size === 'large'){
	          if ((school.rank[locale].total > 20 && rankPct <= a ) || (school.rank[locale].total < 20 && school.rank[locale].rank == 1)){
	            return 'gold-large medal-large';
	          } else if ((school.rank[locale].total > 20 && (rankPct > a && rankPct <= b)) || (school.rank[locale].total < 20 && school.rank[locale].rank == 2)){
	            return 'silver-large medal-large';
	          } else if ((school.rank[locale].total > 20 && (rankPct > b && rankPct <= c)) || (school.rank[locale].total < 20 && school.rank[locale].rank == 3)){
	            return 'bronze-large medal-large';
	          }
	        }
				}
      },
      scoreClasses: function(school){
        if(school && school.score){
          var scorernk = school.score.overall;
        }

        if (scorernk <= aa){
          return 'super-score';
        } else if(scorernk > aa && scorernk <= bb) {
            return 'good-score';
        } else if(scorernk > bb && scorernk <= cc) {
            return 'above-avg-score';
        } else if(scorernk > cc && scorernk <= dd) {
            return 'avg-score';
        } else if(scorernk > dd) {
            return 'below-avg-score';
        }
      },
      specialtySchool: function(school) {
        if (school && school.schoolType){
          if (school.schoolType.magnet || school.schoolType.charter || school.schoolType.bies || school.schoolType.shared || ( school.schoolType.type == "")){
            return true;
          } else {
            return false;
          }
        }
      },
      rankImg:function(school, locale, size){
        if(school && school.rank){
          var rankPct = school.rank[locale].rank/school.rank[locale].total;
        }

        if(school && school.rank) {
          if (size === 'small' || !size){
            if ((school.rank[locale].total > 20 && rankPct <= a ) || (school.rank[locale].total < 20 && school.rank[locale].rank == 1)){
              return '/assets/images/gold-small.png';
            } else if ((school.rank[locale].total > 20 && (rankPct > a && rankPct <= b)) || (school.rank[locale].total < 20 && school.rank[locale].rank == 2)){
              return '/assets/images/silver-small.png';
            } else if ((school.rank[locale].total > 20 && (rankPct > b && rankPct <= c)) || (school.rank[locale].total < 20 && school.rank[locale].rank == 3)){
              return '/assets/images/bronze-small.png';
            }
          } else if (size === 'med'){
            if ((school.rank[locale].total > 20 && rankPct <= a ) || (school.rank[locale].total < 20 && school.rank[locale].rank == 1)){
              return '/assets/images/gold-med.png';
            } else if ((school.rank[locale].total > 20 && (rankPct > a && rankPct <= b)) || (school.rank[locale].total < 20 && school.rank[locale].rank == 2)){
              return '/assets/images/silver-med.png';
            } else if ((school.rank[locale].total > 20 && (rankPct > b && rankPct <= c)) || (school.rank[locale].total < 20 && school.rank[locale].rank == 3)){
              return '/assets/images/bronze-med.png';
            }
          } else if (size === 'large'){
            if ((school.rank[locale].total > 20 && rankPct <= a ) || (school.rank[locale].total < 20 && school.rank[locale].rank == 1)){
              return '/assets/images/gold-large.png';
            } else if ((school.rank[locale].total > 20 && (rankPct > a && rankPct <= b)) || (school.rank[locale].total < 20 && school.rank[locale].rank == 2)){
              return '/assets/images/silver-large.png';
            } else if ((school.rank[locale].total > 20 && (rankPct > b && rankPct <= c)) || (school.rank[locale].total < 20 && school.rank[locale].rank == 3)){
              return '/assets/images/bronze-large.png';
            }
          }
        }
      },
    };
  });