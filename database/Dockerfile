FROM node:10

RUN echo "'11111111111111111111111111'"

RUN apt-get -qq update
RUN npm install -g npm

# set variables
ENV HOME_ROOT=/opt/app-root
ENV HOME=/opt/app-root/src

RUN mkdir -p $HOME

WORKDIR $HOME_ROOT

WORKDIR $HOME

COPY . .

RUN echo "'222222222222222222222222222222222'"

# If you are building your code for production
# RUN npm install --only=production
# RUN npm set progress=false
RUN npm install

RUN echo "'33333333333333333333333333333'"

# run tthe database migrations and then the database seeding
CMD [ "npm", "run", "setup" ]
