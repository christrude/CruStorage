# Cruvita
https://github.com/Cruvita/CruvitaApp
http://www.cruvita.com
v1.2.7
===

Before deploying the app, ensure the Ingest is upto date - https://github.com/Cruvita/CruvitaIngest

Every Time the server is restarted, please remember to run the following
```sh
$ /etc/init.d/newrelic-sysmond start
$ cd /opt/CruvitaIngest/
$ forever start cron.js
$ mongod --fork --logpath /data/db/mongod.log
```

## Run App in Production
Run the following calls-

```sh
$ Login to the server as 'root'
$ forever list (See if the server is running)
$ ~/stop-node-webserver
$ ~/start-node-webserver

```

Starting the apps from the opt folder helps out a bit in the 'forever list' when looking at app state and logs

## If Deploying in Staging, follow the following process

```sh
$ Login to the server as 'staging'
$ cd /opt/Staging/CruvitaApp
$ git checkout develop - pull the latest develop state
$ git pull
$ export NODE_ENV='staging'
$ npm install
$ bower install
$ grunt build
$ cd /opt/Staging/CruvitaApp/dist/
$ forever start server/app.js
```

### To see logs

```sh
$ forever list
$ tail -f /root/.forever/<foreverId>.log -f /root/.forever/<foreverId>.log -f /root/.forever/<foreverId>.log -f /root/.forever/<foreverId>.log
```

