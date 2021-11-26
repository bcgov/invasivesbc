# ################################# W A R N I N G ####################################################################
# This DockerFile is used for deployments only, please do not change for other purposes. It will break our deployment.
# ####################################################################################################################

FROM node:16

# Create app directory
RUN mkdir -p /opt/app-root/src
WORKDIR /opt/app-root/src
RUN chown -R 1001:1001 /opt/app-root
USER 1001

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# COPY PACKAGE JSON
COPY ./package*.json ./

# INSTALL NODE DEPENDENCIES
RUN npm install
RUN npm install -g @ionic/cli

# Copy All the sources
COPY ./ .

# BUILD APP
RUN npm run build-prod

EXPOSE 3030

# RUN APP
CMD ["npm", "run", "deploy_start"]
