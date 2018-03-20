mongoimport --db lsa --collection schools --type csv --fields slug,mx_id,nces_disid,nces_schid,medianIncome,sch_name,sch_name_maponics,ed_level,phone,website,color,freeLunch,freeLunchP,redLunch,member,income,titleOne,stRatio,schoolDistrict,score,gradeLow,gradeHigh,schoolGenders,schoolDiversity,relver,allReading,mathAch,langAch,medianListing,location,hasBoundaries,allMath,locations,coordinates,address,rank,schoolType,fullTimeTeachers --file schools.csv

mongoimport --db lsa --collection locations --type csv --fields _id,dispName,components,type,schools,centroid,viewport,boundaries,count --file locations.csv

mongoimport --db lsa --collection autocompletes --type csv --fields _id,nGram,locations -file autocompletes.csv
