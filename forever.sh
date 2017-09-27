#!/bin/sh

# PROVIDE: dash
# REQUIRE: NETWORKING SERVERS DAEMON
# BEFORE:  LOGIN
# KEYWORD: shutdown

. /etc/rc.subr

name="dash"
forever="/usr/local/bin/node /usr/local/bin/forever"
workdir="/usr/home/neo/code/kodi-harmony-dash"
script="index.js"

rcvar=`set_rcvar`

start_cmd="start"
stop_cmd="stop"
restart_cmd="restart"

load_rc_config $name
eval "${rcvar}=\${${rcvar}:-'NO'}"

start()
{
  USER=root
  PATH=/sbin:/bin:/usr/sbin:/usr/bin:/usr/local/sbin:/usr/local/bin:/root/bin
  PWD=/root
  HOME=/root
  NODE_ENV=production
  ${forever} start -a -l /var/log/forever.log -o /dev/null -e ${workdir}/logs/node_err.log --sourceDir ${workdir} ${workdir}/node/${script}
}

stop()
{
  ${forever} stop ${workdir}/node/${script}
}

restart()
{
  ${forever} restart ${workdir}/node/${script}
}

run_rc_command "$1"