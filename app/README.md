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
