#!/bin/sh
REMOTE_IP=$1

while true; do
	echo "Establishing Websocket tunnel ..."
	node ./wsproxy-cli.js $REMOTE_IP 2>&1 | xargs echo "#$$: "
	echo "Websocket tunnel closed, restart ..."
	sleep 3
done
