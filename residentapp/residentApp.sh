#!/bin/sh

LOGFILE=/opt/logs/residentapp.log

log()
{
    echo "$(date '+%Y %b %d %H:%M:%S.%6N') [#$$]: ${FUNCNAME[1]}: $*" >> $LOGFILE
}

# Check if all the commands used in this script are available
commandsRequired="echo date curl exit cat sed"
for cmd in $commandsRequired; do
    if ! command -v "$cmd" > /dev/null; then
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

partnerApps=`cat /usb/partnerapps/appmanagerregistry.conf|sed -e 's/[\r\n]//g'`
if [ -f /opt/appmanagerregistry.conf ]; then
  partnerApps=`cat /opt/appmanagerregistry.conf|sed -e 's/[\r\n]//g'`
fi
partnerApps=$(echo $partnerApps | sed -e 's/%/%25/g' -e 's/ /%20/g' -e 's/!/%21/g' -e 's/"/%22/g' -e 's/#/%23/g' -e 's/\$/%24/g' -e 's/\&/%26/g' -e 's/'\''/%27/g' -e 's/(/%28/g' -e 's/)/%29/g' -e 's/\*/%2a/g' -e 's/+/%2b/g' -e 's/,/%2c/g' -e 's/-/%2d/g' -e 's/\./%2e/g' -e 's/\//%2f/g' -e 's/:/%3a/g' -e 's/;/%3b/g' -e 's//%3e/g' -e 's/?/%3f/g' -e 's/@/%40/g' -e 's/\[/%5b/g' -e 's/\\/%5c/g' -e 's/\]/%5d/g' -e 's/\^/%5e/g' -e 's/_/%5f/g' -e 's/`/%60/g' -e 's/{/%7b/g' -e 's/|/%7c/g' -e 's/}/%7d/g' -e 's/~/%7e/g')
log "Got partnerApps config: ${partnerApps}"

curl -s -X POST -H "Content-Type: application/json" 'http://127.0.0.1:9998/jsonrpc' -d '{"jsonrpc": "2.0","id": 4,"method": "org.rdk.RDKShell.1.launch", "params": {"callsign":"ResidentApp","type": "ResidentApp","visible": true,"focus": true,"uri":'"$appurl?data=$partnerApps"'}}' >>$LOGFILE 2>&1
# RDKVREFPLT-4612: to start maintanence manager, RFC and Log Upload
sleep 2
curl -s -X POST 'http://127.0.0.1:9998/jsonrpc' -d '{"jsonrpc":"2.0","id":5,"method":"Controller.1.activate", "params":{"callsign":"org.rdk.MaintenanceManager"}}' >>$LOGFILE 2>&1
