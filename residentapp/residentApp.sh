#!/bin/bash

LOGFILE=/opt/logs/residentapp.log

log()
{
    echo "$(date '+%Y %b %d %H:%M:%S.%6N') [#$$]: ${FUNCNAME[1]}: $*" >> $LOGFILE
}

# Check if all the commands used in this script are available
commandsRequired="echo date curl exit"
for cmd in $commandsRequired; do
    if ! command -v $cmd > /dev/null; then
        log "Required command '$cmd' not found; cannot proceed, exiting."
        exit 1
    fi
done

if [ $# -gt 0 ]; then
   if [[ $1 == "stop" ]]; then
      curl -s -X POST -H "Content-Type: application/json" 'http://127.0.0.1:9998/jsonrpc' -d '{"jsonrpc": "2.0","id": 4,"method": "org.rdk.RDKShell.1.destroy", "params": {"callsign":"ResidentApp","type": "ResidentApp"}}' >>$LOGFILE 2>&1
      log "Stop called. Exiting gracefully"
      exit 0
   fi
fi

appurl="http://127.0.0.1:50050/lxresui/index.html#splash"

log "Selected reference app is $appurl"

curl -s -X POST -H "Content-Type: application/json" 'http://127.0.0.1:9998/jsonrpc' -d '{"jsonrpc": "2.0","id": 4,"method": "org.rdk.RDKShell.1.launch", "params": {"callsign":"ResidentApp","type": "ResidentApp","visible": true,"focus": true,"uri":'"$appurl?data=$partnerApps"'}}' >>$LOGFILE 2>&1
