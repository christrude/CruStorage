
#  Cruvita Ingestion - https://github.com/Cruvita/CruvitaIngest
http://www.cruvita.com
v1.2.7


Every Time the server is restarted, please remember to run the following
```sh
$ /etc/init.d/newrelic-sysmond start
$ cd /opt/CruvitaIngest/
$ forever start cron.js
$ mongod --fork --logpath /data/db/mongod.log
```


## New Server Setup Steps -
From Hostway Image-

Install yum developers packages

Install GraphicsMagick

Install node, npm, bower

```sh
$ ./newServer.sh
```
Update Linux config to open more concurrent connections for image ingest:
```sh
sudo sysctl -w net.ipv4.ip_local_port_range="15000 64000"
sudo sysctl -w net.ipv4.tcp_fin_timeout=30
sudo sysctl -w net.ipv4.tcp_tw_recycle=1
sudo sysctl -w net.ipv4.tcp_tw_reuse=1
```


## Getting Started

### Getting the data files
For education and boundary files, use the following script
```sh
$ cd /opt/CruvitaIngest
$ ./downloads.sh
```
Place income data files into data/income/

```sh
$ npm install
$ forever start -m 1 --uid 'ingest' --append ingest.js
$ forever start --uid 'cron' --append cron.js
```

If running in Staging, follow the following process
```sh

$ cd /opt/Staging/CruvitaIngest
$ export NODE_ENV='staging'
$ npm install
$ forever start -m 1 --uid 'ingest' --append ingest.js
$ forever start --uid 'cron' --append cron.js
```



## Documentation

_(Coming soon)_


## Examples

_(Coming soon)_


## Contributing



## License

Copyright (c) 2014
Licensed under the MIT license.
