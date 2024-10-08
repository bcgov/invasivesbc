FROM node:20-alpine

RUN apk --no-cache add git
# set variables
ENV HOME=/opt/app-root

RUN mkdir -p $HOME

WORKDIR $HOME

ADD ./app app
ADD ./sharedAPI sharedAPI
ADD ./.git .git

WORKDIR $HOME/sharedAPI

RUN ["npm", "ci"]

WORKDIR $HOME/app

RUN ["npm", "ci"]

CMD ["npm", "run", "docker"]
