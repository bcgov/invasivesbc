#!/bin/sh

purgeTag() {                 
        export is=$1
        export env=$2
        oc get is/${is} -o yaml | grep tag: - | awk '{print $2}' | grep ${env} - | sort -Vr - | tail -n +10 | xargs -L 1 -I {} oc tag -d ${is}:{}
}
#% oc get is | grep invas - | awk '{print $1}' | xargs -L 1 -I {} echo purgeTag {} dev
purgeTag invasivesbc-api dev
purgeTag invasivesbc-api-backup dev
purgeTag invasivesbc-api-db dev
purgeTag invasivesbc-api-schemaspy dev
purgeTag invasivesbc-app dev
purgeTag invasivesbci-api dev
purgeTag invasivesbci-app dev
purgeTag invasivesbci-db dev
purgeTag invasivesbci-db-setup dev
#% oc get is | grep invas - | awk '{print $1}' | xargs -L 1 -I {} echo purgeTag {} test
purgeTag invasivesbc-api test
purgeTag invasivesbc-api-backup test
purgeTag invasivesbc-api-db test
purgeTag invasivesbc-api-schemaspy test
purgeTag invasivesbc-app test
purgeTag invasivesbci-api test
purgeTag invasivesbci-app test
purgeTag invasivesbci-db test
purgeTag invasivesbci-db-setup test
#% oc get is | grep invas - | awk '{print $1}' | xargs -L 1 -I {} echo purgeTag {} prod
purgeTag invasivesbc-api prod
purgeTag invasivesbc-api-backup prod
purgeTag invasivesbc-api-db prod
purgeTag invasivesbc-api-schemaspy prod
purgeTag invasivesbc-app prod
purgeTag invasivesbci-api prod
purgeTag invasivesbci-app prod
purgeTag invasivesbci-db prod
purgeTag invasivesbci-db-setup prod
