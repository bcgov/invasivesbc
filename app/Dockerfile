# ################################# W A R N I N G ####################################################################
# This DockerFile is used for deployments only, please do not change for other purposes. It will break our deployment.
# ####################################################################################################################

FROM node:16

COPY ./package.json $HOME
COPY ./package-lock.json $HOME

RUN chmod 0666 package.json
RUN chmod 0666 package-lock.json

RUN ls -la $HOME

# INSTALL NODE DEPENDENCIES
RUN npm install
RUN npm install -g @ionic/cli

# Copy All the sources
COPY ./ $HOME

# BUILD APP
RUN npm run build-prod

EXPOSE 3030

# RUN APP
CMD ["npm", "run", "deploy_start"]

