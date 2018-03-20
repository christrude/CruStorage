#!/bin/bash

# Initial Setup Server scripts
passwd
echo 'Set new password'
adduser cruvita

echo 'Set in bashrc: export PATH=/usr/local/bin/phantomJS:/usr/src/mongodb/mongodb-linux-x86_64-2.6.7/bin:$PATH
export NODE_ENV=production'
vi ~/.bashrc

# Dev requirements
yum groupinstall 'Development Tools'
yum install -y gcc libpng libjpeg libpng-devel libjpeg-devel ghostscript libtiff libtiff-devel freetype freetype-devel wget


# GraphicksMagic
wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/1.3/GraphicsMagick-1.3.21.tar.gz
tar zxvf GraphicsMagick-1.3.21.tar.gz
cd GraphicsMagick-1.3.21
./configure --enable-sharded
make
make install
gm version

# Node, NPM, MongoDB, Ruby, Compass
curl --silent --location https://rpm.nodesource.com/setup_7.x | bash -
yum install -y nodejs
npm install npm -g
yum install -y mongodb-org-2.6.11
mkdir /data
mkdir /data/db
echo "Update mongodb conf with proper db location, and change ulimits to 64k"
vi /etc/mongod.conf
yum install ruby
yum install g++ make automake autoconf curl-devel openssl-devel zlib-devel httpd-devel apr-devel apr-util-devel sqlite-devel
yum install ruby-rdoc ruby-devel
yum install rubygems
gem update
curl -L get.rvm.io | bash -s stable
source /usr/local/rvm/bin/rvm
rvm install ruby --latest
gem update --system
gem install rails
gem install compass


# New Relic Install
rpm -Uvh https://yum.newrelic.com/pub/newrelic/el5/x86_64/newrelic-repo-5-3.noarch.rpm
yum install newrelic-sysmond
nrsysmond-config --set license_key=6acc88f7d25776a848cc9d30fa116b102ea36fa5
echo "Add hostname"
vi /etc/newrelic/nrsysmond.cfg

# Start NR and Mongo
/etc/init.d/newrelic-sysmond start
mongod --fork --logpath /data/db/mongod.log

# Cruvita Repos
cd /opt
git clone https://github.com/prerender/prerender.git
git clone https://cruvitaDev@github.com/Cruvita/CruvitaApp.git
git clone https://cruvitaDev@github.com/Cruvita/CruvitaBlog.git
git clone https://cruvitaDev@github.com/Cruvita/CruvitaIngest.git
cd prerender
npm install
cd /opt/CruvitaIngest/
mkdir data
mkdir data/boundary
mkdir data/education
mkdir data/income
/bin/bash /opt/CruvitaIngest/downloads.sh
npm install
npm install -g bower
npm install -g forever
npm install -g grunt-cli
cd /opt/CruvitaApp/
npm link CruvitaServerCommon
npm install
bower install --allow-root
#forever start -m 1 --uid 'ingest' --append ingest.js
#tail -f /root/.forever/ingest.log
echo "Check IPTABLES - iptables -L : iptables -I INPUT -p tcp -m tcp --dport 27017 -j ACCEPT ; service iptables save"
echo "Check STORAGE VOLUMES - df -ah"
exit 0