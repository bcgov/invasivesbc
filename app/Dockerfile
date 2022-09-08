# ################################# W A R N I N G ####################################################################
# This DockerFile is used for deployments only, please do not change for other purposes. It will break our deployment.
# ####################################################################################################################

FROM node:16

COPY --chown=1001:0 ./package.json $HOME
COPY --chown=1001:0 ./package-lock.json $HOME

RUN id
RUN ls -la $HOME

# INSTALL NODE DEPENDENCIES
RUN npm install
RUN npm install -g @ionic/cli

# Copy All the sources
COPY ./ $HOME

# BUILD APP
RUN npm run build-prod:legacy

EXPOSE 3030

# RUN APP
CMD ["npm", "run", "deploy_start"]

