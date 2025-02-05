# Invasive Species BC

[![img](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bcgov_invasivesbc&metric=alert_status)](https://sonarcloud.io/dashboard?id=bcgov_invasivesbc) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=bcgov_invasivesbc&metric=coverage)](https://sonarcloud.io/summary/new_code?id=bcgov_invasivesbc) [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=bcgov_invasivesbc&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=bcgov_invasivesbc)

## Introduction

Invasive species are non-native plants and animals whose introduction and spread in British Columbia cause significant economic, social or environmental damage. This application tracks the observation, treatment, and monitoring of invasive species in the Province of British Columbia.

This project is part of the Species and Ecosystems Information System Modernization (SEISM) program.

## Table of Contents

1. [Project Status](#project-status)
1. [Audience](#audience)
1. [Features](#features)
1. [Getting Help or Reporting an Issue](#getting-help-or-reporting-an-issue)
1. [How to Contribute](#how-to-contribute)
1. [Architecture](#architecture)
1. [Project Structure](#project-structure)
1. [Documentation](#documentation)
1. [Requirements](#requirements)
1. [Setup Instructions](#setup-instructions)
1. [Running the Application](#running-the-application)
1. [License](#license)

## Project Status

This application is in active development and has not yet been released.

## Audience

Anyone with a valid IDIR or BCeID login may access the application to view data that is being tracked.

In addition, the application is intended for use by:

- Surveyors who observe and record the absence, presence, and spread of invasive species
- Subject matter experts who perform a variety of duties, including to record and analyze data and create action plans
- Contractors who implement recommended treatments for observed invasive species
- Administrators who manage the application and its users

## Features

This application is anticipated to include the following main features:

1. Support for IDIR and BCeID access
1. User roles and permissions management
1. Interactive maps displaying multiple data layers
1. Observations of invasive species absence/presence
1. Recommendations, planning, and application records of treatments
1. Monitoring of treatment outcomes
1. Query and export of data
1. Auditing and reports
1. Bulk data entry and mobile device data entry

## Getting Help or Reporting an Issue

To report bugs/issues/features requests, please file an issue.

## How to Contribute

If you would like to contribute, please see our [contributing](CONTRIBUTING.md) guidelines.

Please note that this project is released with a [Contributor Code of Conduct](CODE-OF-CONDUCT.md). By participating in this project you agree to abide by its terms.

## Architecture

This application uses PostgreSQL (with PostGIS), Ionic/React (for Web, IOS and Android). Our environments run on an OpenShift container platform cluster.

## Project Structure

    .config/                   - Common application configuration
    .github/                   - Github actions
    .docker/                   - Common Dockerfiles
    .vscode/                   - IDE config for Visual Studio Code
    api/                       - API codebase
    app/                       - Capacitor APP Codebase
    sharedapi/                 - Files shared between App and API (enums, RJSF Schemas, etc)
    database/                  - Database Codebase
    env_config/                - ENV config files
    testing/                   - Test scripts, in particular Postman configs
    CODE-OF-CONDUCT.md         - Code of Conduct
    CONTRIBUTING.md            - Contributing Guidelines
    LICENSE                    - License

## Documentation

For additional Documentation about the InvasivesBC Application, see the [Wiki](https://github.com/bcgov/invasivesbc/wiki)

## Requirements

- XCode\* (for iOS builds only)
- Android Studio\* (for Android Builds only)
- Node >=20.0 or Docker

### Development

The ideal multi-platform supporting machine is the Mac, But Windows and Linux work for Web and Android development.

### Android Development

Install AndroidStudio and the Android SDK.

### IOS Development

On MacOS: Install xCode.

## Setup Instructions

Clone the repository to your own machine and follow instructions below.

### Run the app locally (terminal)

In the app directory:

1. `npm ci`
2. `npm start`

In the `api` directory:

1. `npm ci`
2. `npm run dev`

### Run the app locally (docker)

In the root directory

1. `make docker`

### Run the app on mobile

#### Android

On MacOS, Windows or Linux, in the app directory:

1. `npm install`
2. `npm run build:android`
3. `cd ..`
4. `make run-android`

Android Studio will open and, after a short delay, will allow you to run the application in the simulator or a connected device.

#### IOS

On MacOS, in the app directory:

1. `npm install`
2. `npm run build:ios`
3. `cd ..`
4. `make run-ios`

Xcode will open and, after a short delay, will allow you to run the application in the simulator or a connected device.

## Acknowledgements

[![SonarCloud](https://sonarcloud.io/images/project_badges/sonarcloud-black.svg)]()

## License

    Copyright 2019 Province of British Columbia

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
