#!/bin/bash
# Stop Webserver, go to location, pull git, grunt build, go to dist start Webserver

forever stop webserver
cd /opt/CruvitaApp
git pull
grunt build
cd dist/
forever start --uid 'webserver' --append server/app.js

