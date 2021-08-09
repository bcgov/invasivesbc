vim -s increment.vim ios/App/App.xcodeproj/project.pbxproj
sudo xcodebuild -allowProvisioningUpdates -workspace ios/App/App.xcworkspace -scheme App -configuration Release clean archive -archivePath buildArchive/App.xcarchive CODE_SIGN_IDENTITY="Invasive Species Plants and Animals" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO

