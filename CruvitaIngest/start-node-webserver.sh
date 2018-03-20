#!/bin/bash
export PATH=/usr/local/bin/phantomJS:/usr/src/mongodb/mongodb-linux-x86_64-2.6.7/bin:/usr/lib64/qt-3.3/bin:/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin:/root/bin
export NODE_ENV=production
### this script now uses /usr/local/bin/forever instead of just forever to overcome any reliance on the $PATH being correct at boot.


#Capture the directory that we are starting in whatever that is.
STARTDIR="$(pwd)"

#change directory to the one that is needed to run the webserver.
cd /opt/CruvitaApp/dist

#run forever start against the node.js server script, give it the "webserver" uid and tell it to keep using the same log file.
/usr/local/bin/forever start --uid "webserver" --append  server/app.js

#let the user know that the web server has been started.
echo "started node.js web server."

#now we are going to add the prerender service to the web server for SEO
cd /opt/prerender

#now start the prerenderer, give it the "prerenderer" uid and tell it to use the same log file.
/usr/local/bin/forever start --uid "prerender" --append server.js

#now start the ghost blog software.

cd /opt/CruvitaBlog

nvm exec v0.12.3 /usr/local/bin/forever start --uid 'blog' --append index.js --production
echo "started ghost blog server"

#reset the working directory to whatever we started with.
cd $STARTDIR
