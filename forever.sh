#!/bin/sh

# PROVIDE: dash
# REQUIRE: NETWORKING SERVERS DAEMON
# BEFORE:  LOGIN
# KEYWORD: shutdown

# Taken from http://habrahabr.ru/post/137857/

. /etc/rc.subr

name="dash"
forever="/usr/local/bin/node /usr/local/bin/forever"
workdir="/usr/home/neo/code/kodi-harmony-dash"
script="index.js"

rcvar=dash_enable
extra_commands="status"

start_cmd="start"
status_cmd="status"
stop_cmd="stop"
restart_cmd="restart"

load_rc_config $name
eval "${rcvar}=\${${rcvar}:-'NO'}"

HOME=/var/run/forever
start()
{
  NODE_ENV=production
  su -m www -c "exec ${forever} start -a -l /var/log/forever.log -o /dev/null -e /var/log/node_err.log -p /var/run/forever ${script}"
}

status()
{
  su -m www -c "exec ${forever} list"
}

stop()
{
  su -m www -c "exec ${forever} stop ${script}"
}

restart()
{
  su -m www -c "exec ${forever} restart ${script}"
}

run_rc_command "$1"