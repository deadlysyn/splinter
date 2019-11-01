#!/usr/bin/env bash

DOCKER=/usr/local/bin/docker
VERSION=6.4.3

case "$1" in
  start)
    ${DOCKER} run -d --name=grafana \
      -p 127.0.0.1:3001:3000/tcp \
      grafana/grafana:${VERSION}
    if [[ $? -eq 0 ]]; then
      echo "Grafana ${VERSION} running on http://localhost:3001"
      echo "Username: admin Password: admin"
    fi
    ;;
  stop)
    docker stop grafana
    docker rm grafana
    ;;
  *)
    echo "USAGE: $0 [start|stop]"
    exit 1
esac

exit $?

