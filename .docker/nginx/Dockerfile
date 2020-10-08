FROM nginx:stable-alpine

RUN apk update -q
RUN apk upgrade -q
RUN apk add -q --no-cache bash
RUN adduser -D -H -u 1000 -s /bin/bash www-data -G www-data

RUN mkdir -p /usr/app
WORKDIR /usr/app

# remove any existing conf file
RUN rm /etc/nginx/conf.d/default.conf

# copy our nginx conf file
COPY /dev.conf /etc/nginx/conf.d
