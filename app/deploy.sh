sudo rm -rf signed.zip App
cp ~/Downloads/unsigned-signed.zip ./signed.zip
unzip signed.zip 
xcrun altool --upload-app -f App/App.ipa -u $APP_STORE_USERNAME -p $APP_SPECIFIC_PASSWORD
