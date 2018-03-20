#!/bin/bash
#Stop the Node.JS web server that is listening on port 80 (whichever that happens to be) by PID
#first get the PID...
#netstat with grep finds what is listening on port 80, awk gives us the PID and process name, cut gives us just the PID

#DATA=$(netstat -tulpn | grep :2356 | awk '{print $7}' | cut -d'/' -f 1)

#next we use the PID to kill our webserver using 'forever stop' command.

forever stop "webserver"
#this should have stopped our node process.

echo "stopped node.js web server."

#now we are also going to stop the prerenderer
forever stop "prerender"

#now stop the blog
forever stop "blog"
