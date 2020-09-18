# bcgov/invasivesbc/app

## Documenation

Ionic React: https://ionicframework.com/docs/react  
Ionic React API: https://ionicframework.com/docs/api/route

React: https://reactjs.org/docs/getting-started.html

## Run the app locally (web)

```
npm install

ionic serve
```

## Run the app on mobile

### Android

1. `ionic build`
2. `ionic cap add android` (Only once, does not need to be repeated)
3. `ionic cap copy`
4. Open Android Studio and under the "Refactor" Menu, choose "Migrate to AndroidX", make sure that follow up by agreeing to do the full migration (bottom left of your main IDE). [Migrating to AndroidX](https://flutter.dev/docs/development/androidx-migration#how-do-i-migrate-my-existing-app-plugin-or-host-editable-module-project-to-androidx)
5. Save and close Android Studio
6. `ionic cap sync`
7. The GitHub Workflow will now build your Android (Debug) APK that you can download and install.

### IOS

TODO

