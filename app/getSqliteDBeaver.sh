device=$(ls -lt ~/Library/Developer/CoreSimulator/Devices/ | head -2 | tail -1 | awk 'NF{print $NF; exit}')
app=$(ls -lt ~/Library/Developer/CoreSimulator/Devices/"$device"/data/Containers/Data/Application | head -2 | tail -1 | awk 'NF{print $NF; exit}')
dbpath=$(ls ~/Library/Developer/CoreSimulator/Devices/"$device"/data/Containers/Data/Application/"$app"/Documents/localInvasivesBCSQLite.db)
#echo $dbpath
connectionString="driver=sqlite|database=$dbpath|name=InvasivesSQliteMobileIOS|openConsole=true|folder=SQLite"
echo $connectionString
sudo /Applications/DBeaver.app/Contents/MacOS/dbeaver -con $connectionString

