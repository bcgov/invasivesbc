FROM node:20-alpine

# set variables
ENV HOME=/opt/app-root

# create source directory
RUN mkdir -p $HOME

WORKDIR $HOME

ADD ./api api
ADD ./sharedAPI sharedAPI

WORKDIR $HOME/sharedAPI

RUN [ "npm", "ci"]

WORKDIR $HOME/api

RUN [ "npm", "ci"]

CMD [ "npm", "run", "dev" ]
