mongodump -d lsa -c locations
mongodump -d lsa -c schools
mongodump -d lsa -c autocompletes
zip -r boundaries.zip boundaries
zip -r dump.zip dump
rm -rf boundaries
rm -rf dump
rm -rf data/education/*
rm -rf data/boundary/*
rm -rf tempAutocomplete