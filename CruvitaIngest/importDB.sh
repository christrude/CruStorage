unzip dump.zip
unzip boundaries.zip
mongorestore -d lsa -c locations-new dump/lsa/locations.bson
mongorestore -d lsa -c schools-new dump/lsa/schools.bson
mongorestore -d lsa -c autocompletes-new dump/lsa/autocompletes.bson
rm -rf dump*
rm -rf boundaries.zip