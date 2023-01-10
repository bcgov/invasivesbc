FROM node:18-alpine

RUN apk update && apk add curl
RUN npm install -g @ionic/cli

# set variables
ENV HOME_ROOT=/opt/app-root
ENV HOME=/opt/app-root/src

# create source directory
RUN mkdir -p $HOME

WORKDIR $HOME_ROOT

WORKDIR $HOME

# Bundle app source
COPY ./ .

VOLUME ${HOME}

ENV PATH ${HOME}/node_modules/.bin/:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH
ARG REACT_APP_REAL_NODE_ENV
ENV REACT_APP_REAL_NODE_ENV ${REACT_APP_REAL_NODE_ENV}
# run the ionic app in reload mode (will reload on file changes)
CMD [ "npm", "run", "start:ionic:reload" ]
