# bcgov/invasivesbc/app

## Documenation

Ionic React: https://ionicframework.com/docs/react  
Ionic React API: https://ionicframework.com/docs/api/route

React: https://reactjs.org/docs/getting-started.html

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
2. `ionic build`
3. `ionic cap add android` (Only the first time, does not need to be repeated after)
4. `ionic cap copy`
5. `ionic cap sync`
6. `npx cap open Android`

Android Studio will open and, after a short delay, will allow you to run the application in the simulator.


### IOS

On MacOS, in the app directory:

1. `npm install`
2. `ionic build`
3. `ionic cap add android` (Only the first time, does not need to be repeated after)
4. `ionic cap copy`
5. `ionic cap sync`
6. `npx cap open ios`

xCode will open and, after a short delay, will allow you to run the application in the simulator.

# React

## Environment Variables
- With the exception of `NODE_ENV`, any environment variable that needs to be accessible by the react app (via `process.env.<var>`) must be prefixed with `REACT_APP_`.  If it is not prefixed, react will not read it, and it will be `undefined` when you try to access it.
  - See: https://create-react-app.dev/docs/adding-custom-environment-variables

## .env
- React will read a `.env` or similar file by default, and will read any variables prefixed with `REACT_APP_`.
  - See: https://create-react-app.dev/docs/adding-custom-environment-variables/#what-other-env-files-can-be-used

# Release to Test Flight (WIP)
- Assumptions:  
	- You've got access to app store connect.
	- You've got a provisioning profile
	- You're an admin or app manager
	- Xcode 11.6
	- You've already run ionic capacitor build ios

- Build: 
	- From app/:
		- sh build.sh
		- sh pack.sh

	- Upload ZIP to mobile signing service here https://signing-web-devhub-prod.pathfinder.gov.bc.ca/.  
	- Make sure you log in first as it will wipe the form once you do.
	- Download as 'signed.zip' in app/

	- From app/:
- `export $APP_STORE_USERNAME=YourAppleIDEmail`
		- export $APP_SPECIFIC_PASSWORD=MakeThisInAppleIDProfile
		- or put these in env
 	
		- sh deploy.sh
