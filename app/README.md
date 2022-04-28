# bcgov/invasivesbc/app



## Documenation

Ionic React: https://ionicframework.com/docs/react  
Ionic React API: https://ionicframework.com/docs/api/route React: https://reactjs.org/docs/getting-started.html

## Run the app locally (web)

In the app directory:

```
npm install

ionic serve
```

## Run the app on mobile

### Android

On MacOS, Windows or Linux, in the app directory:

1. `npm install`
2. `npm run build:android` to set correct capacitor config
3. `ionic build`
4. `ionic cap add android` (Only the first time, does not need to be repeated after)
5. `ionic cap sync android`

# to open it in android studio

6. `npx cap open android`

# to open it in android studio & trigger build / sim

6. `npx cap build android`

Android Studio will open and, after a short delay, will allow you to run the application in the simulator.

### IOS

On MacOS, in the app directory:

First time setup: Install Ionic CLI 6.16.1

1. npm install
2. npm run build:ios to set correct capacitor config

# edit: this should already be done:

#2. from the /app dir of the repo `ionic cap add ios` (Only the first time, does not need to be repeated after)

To build and open xcode:

1. ionic capacitor build ios
2. hit play in xcode to launch sim

xCode will open and, after a short delay, will allow you to run the application in the simulator.

For (mostly) hot reloading:

1. ionic cap run ios -l --external --dev
2. Open Safari Technology Preview and hit the Develop menu to connect to debugger for console logs
3. from the app dir, run `sh ./getSqliteDBeaver.sh` to open & connect dbeaver to simulator app db instance.

# React

## Environment Variables

- With the exception of `NODE_ENV`, any environment variable that needs to be accessible by the react app (via `process.env.<var>`) must be prefixed with `REACT_APP_`. If it is not prefixed, react will not read it, and it will be `undefined` when you try to access it.
  - See: https://create-react-app.dev/docs/adding-custom-environment-variables

## .env

- React will read a `.env` or similar file by default, and will read any variables prefixed with `REACT_APP_`.
  - See: https://create-react-app.dev/docs/adding-custom-environment-variables/#what-other-env-files-can-be-used

# Release to Test Flight (WIP)

- Assumptions:

  - You've got access to app store connect
  - You've got a provisioning profile
  - You're an admin or app manager
  - Xcode 11.6
  - You've already run ionic capacitor build ios

- Build:

  - From app/:

    - `sh build.sh`
    - `sh pack.sh`

  - Upload ZIP to mobile signing service here https://signing-web-devhub-prod.pathfinder.gov.bc.ca/.
  - Make sure you log in first as it will wipe the form once you do.
  - Download as 'signed.zip' in app/

  - From app/: - `export $APP_STORE_USERNAME=YourAppleIDEmail`

    - `export $APP_SPECIFIC_PASSWORD=MakeThisInAppleIDProfile`
    - or put these in env

    - `sh deploy.sh`

### Building to Mobile (iOS)

Before doing the following steps you have to build the app to iOS:

- `npx ionic cap sync ios`
- `brew install cocoapods`
- `cd ios/App && pod install`

1. Download XCode to your machine
2. Click on the XCode tab > Click Preferences
3. Now under accounts add your own Apple account
4. In XCode go to Project Editor by clicking the Project Navigator button (looks like a folder icon on left side of XCode)
5. Select General in the Project Editor
6. Under the 'Signing' section click the team dropdown and select Personal Team
7. Plug your mobile device into your MacBook
8. Now on your iOS device you have to go to General > 'VPN & Device Management' or 'Device Management' depending on iOS version.
9. If you click the Run button to build to your iOS device (make sure you have it selected on the top middle bar) on your iOS device it'll show a button at the bottom with your Apple ID. Click that button.
10. Then click the Trust "Your AppleId"

If you still have trouble use this link https://ionicframework.com/blog/deploying-to-a-device-without-an-apple-developer-account/

## Run Cypress Tests

# Quick start:

For local only env:

	- `npx cypress open`

For local app and dev api:

	- `npx cypress open --env configFile=development`

For custom: 

	- `npx cypress open --env configFile=myCustomConfigFile`

# Detailed setup:

1. Check if your configFile matches the environment you want to run in.

- Your config file should be located invasivesbc/app/cypress/config

2. Within the configFile you should see two json files:

- local.json
- development.json

3. Make sure your information about your container/database matches the dbconfig in the applicable file in step 2.
4. After when you run the cypress command above and select one of the tests in the GUI.
5. Once a test is selected you should be prompted with a browser and the Cypress testing tab.
6. In that browser open the app in another tab and login as you usually would when testing.
7. Go back to the previous tab and re-run the test.
