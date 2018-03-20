mongoexport --db lsa-dev --collection schools --csv --fields slug,mx_id,nces_disid,nces_schid,medianIncome,sch_name,sch_name_maponics,ed_level,phone,website,color,freeLunch,freeLunchP,redLunch,member,income,titleOne,stRatio,schoolDistrict,score,gradeLow,gradeHigh,schoolGenders,schoolDiversity,relver,allReading,mathAch,langAch,medianListing,location,hasBoundaries,allMath,locations,coordinates,address,rank,schoolType,fullTimeTeachers -o schools.csv

mongoexport --db lsa-dev --collection locations --csv --fields _id,dispName,components,type,schools,centroid,viewport,boundaries,count -o locations.csv

mongoexport --db lsa-dev --collection autocompletes --csv --fields _id,nGram,locations -o autocompletes.csv

mongoexport --db lsa --collection homes --csv --fields listing.listingparticipants.0.participant.0.primarycontactphone.0,listing.listingparticipants.0.participant.0.email.0,listing.listingparticipants.0.participant.0.firstname.0,listing.listingparticipants.0.participant.0.lastname.0 -o agents.csv

mongoexport --db lsa --collection users --csv --fields name,email,phone,realtyName,website,state,licenseNumber --query '{agentType:"realtor"}' -o agents.csv