unzip signed.zip 
xcrun altool --upload-app -f App/App.ipa -u $APP_STORE_USERNAME -p $APP_SPECIFIC_PASSWORD
