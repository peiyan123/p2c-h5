#!/usr/bin/bash

docker rm -f p2c
docker build -t p2c .
docker run -d -p 8020:80 --name p2c p2c
