#!make

# ------------------------------------------------------------------------------
# Makefile -- InvasivesBC
# ------------------------------------------------------------------------------


# You must manually create an empty `.env` file at the root level (this level), otherwise the below commands will fail.
-include .env

export $(shell sed 's/=.*//' .env)

all : help
.DEFAULT : help
.PHONY : local local-debug build-local setup-local run-local run-debug close-local cclean-local test-local database app api help

# ------------------------------------------------------------------------------
# Task Aliases
# ------------------------------------------------------------------------------

# Note: If you need to edit the .env file before running the build:
# 1. Run `make setup-docker`
# 2. Edit the `.env` file
# 3. Run `make local` or `make local-debug`

local: | setup-docker close-local build-local run-local log ## Performs all commands necessary to run api in docker

local-debug: | setup-docker close-local build-local run-debug ## Performs all commands necessary to run api in docker in debug mode

# ------------------------------------------------------------------------------
# Development Commands
# ------------------------------------------------------------------------------

setup-docker: ## Prepares the environment variables for local development using docker (will not overwrite an existing .env file)
	@echo "==============================================="
	@echo "Make: setup-local - copying env.docker to .env"
	@echo "==============================================="
	@cp -i env_config/env.docker .env

build-local: ## Builds the local development containers
	@echo "==============================================="
	@echo "Make: build-local - building Docker images"
	@echo "==============================================="
	@docker-compose -f docker-compose.local.yml build

run-local: ## Runs the local development containers
	@echo "==============================================="
	@echo "Make: run-local - running api/app images"
	@echo "==============================================="
	@docker-compose -f docker-compose.local.yml up -d

run-debug: ## Runs the local development containers in debug mode, where all container output is printed to the console
	@echo "==============================================="
	@echo "Make: run-debug - running api/app images in debug mode"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up

close-local: ## Closes the local development containers
	@echo "==============================================="
	@echo "Make: close-local - closing Docker containers"
	@echo "==============================================="
	@docker-compose -f docker-compose.local.yml down

clean-local: ## Closes and cleans (removes) local development containers
	@echo "==============================================="
	@echo "Make: clean-local - closing and cleaning Docker containers"
	@echo "==============================================="
	@docker-compose -f docker-compose.local.yml down -v --rmi all --remove-orphans

# ------------------------------------------------------------------------------
# Helper Commands
# ------------------------------------------------------------------------------

database: ## Executes into database container.
	@echo "==============================================="
	@echo "Make: Shelling into database container"
	@echo "==============================================="
	@export PGPASSWORD=$(DB_PASS)
	@docker-compose exec db psql -U $(DB_USER) $(DB_DATABASE)

app: ## Executes into the app container.
	@echo "==============================================="
	@echo "Shelling into app container"
	@echo "==============================================="
	@docker-compose exec app bash

api: ## Executes into the workspace container.
	@echo "==============================================="
	@echo "Shelling into api container"
	@echo "==============================================="
	@docker-compose exec api bash

build-ios: ## Builds the app for mobile
	@echo "==============================================="
	@echo "Make: build-mobile - building app for mobile"
	@echo "==============================================="
	@cd app && npm install && npm run build:ios && cd ..

run-ios: ## Runs the app for mobile
	@echo "==============================================="
	@echo "Make: run-mobile - running app for mobile"
	@echo "==============================================="
	@cd app && npx cap sync ios && npx cap open ios && cd ..

log: ## Prints the logs of the local development containers
	@echo "==============================================="
	@echo "Make: log - printing app logs"
	@echo "==============================================="
	@docker-compose -f docker-compose.local.yml logs -f

ios: | build-ios run-ios ## Builds and runs the app for mobile

help:	## Display this help screen.
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
