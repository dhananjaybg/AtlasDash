#!/bin/bash

echo "
/***
 *                                                                                                             
 * Mongo Atlas Dash   
 *
 */
"

echo "This script configures a MongoDB App Services app which extracts data from the Atlas Billing API"
echo "and writes it to an Atlas Cluster"
echo 
echo "Before you run this script, make sure you have:"
echo "1. Created a new MongoDB Atlas project for your AtlasDash app"
echo "2. Created a new cluster inside that project for storing AtlasDash data"
echo "3. Created an API Key inside that project, and recorded the public and private key details"
echo "4. Created an API Key for your Organization and recorded the public and private key details"
echo "5. Installed dependencies for this script: node, mongodb-realm-cli"
echo "For more details on these steps, see the README.md file."
echo

# Prompt for API Keys
echo "Enter the PUBLIC Key for your PROJECT level API Key:"
read publicKeyProject
echo "Enter the PRIVATE Key for your PROJECT level API Key:"
read privateKeyProject
echo "Enter the PUBLIC Key for your ORGANIZATION level API Key:"
read publicKeyOrg
echo "Enter the PRIVATE Key for your ORGANIZATION level API Key:"
read privateKeyOrg
echo "Enter the name of the running Atlas cluster that will store the AtlasDash data:"
read clusterName

echo "Thanks....."

# Obtain Organization ID and Cluster info from Atlas API
orgID=$(curl -s https://cloud.mongodb.com/api/atlas/v1.0 --digest -u $publicKeyOrg:$privateKeyOrg | sed -e 's/[{}]/''/g' | awk -v RS=',"' -F/ '/^href/ {print $8}')

# Rewrite the App Service with the specified cluster name
config='{
    "name": "mongodb-atlas",
    "type": "mongodb-atlas",
    "config": {
        "clusterName": "'$clusterName'",
        "readPreference": "primary",
        "wireProtocolEnabled": false
    },
    "version": 1
}'
echo "$config" > ./data_sources/mongodb-atlas/config.json

# Import the App Services app
realm-cli login --api-key="$publicKeyProject" --private-api-key="$privateKeyProject"
realm-cli import --yes 

# Write secrets to App Services app
realm-cli secrets create -n org-secret -v $orgID
realm-cli secrets create -n username-secret -v $publicKeyOrg
realm-cli secrets create -n password-secret -v $privateKeyOrg
realm-cli secrets create -n database-secret -v "AtlasDash"
realm-cli push --remote "AtlasDash" -y

# Run functions to retrieve billing data for the first time
echo "Please wait a few seconds before we run the getAll function ..."

sleep 30
realm-cli function run --name "start_process"

#echo "Please wait a few seconds before we run the processAll function ..."
#realm-cli function run --name "processAll"

# Next Steps
echo "Setup Complete! Please log into Atlas and verify that data has been loaded into the cluster."
echo "To visualize the billing data on a dashboard:"
echo "1. Activate Charts in your Atlas project"
echo "2. Import the dashboard from the included file 'charts_billing_template.charts'"
