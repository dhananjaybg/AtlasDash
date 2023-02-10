exports = async function(org, username, password){

  const promises = [
    //getInvoices(org, username, password),
    //getOrg(org, username, password),
    //getProjects(org, username, password)
    getProjects(org, username, password)
  ];
  await Promise.all(promises);
  return {"org": org, "status": "success!"};
};

getProjects = async function(org, username, password)
{
  const pub_key = "mfbroowi";
  const private_key = "f6cff4f7-27a3-439b-b21a-e9448ad8a8ec";
  const org_id = "5e384d3179358e03d842ead1";

  //const refresh = context.values.get(`refreshProjectData`);
  //if (!refresh) return Promise.resolve();

  const collection = context.services.get(`mongodb-atlas`).db(`AtlasDash`).collection(`AtlasInventory`);
  
  const args = {
    "scheme": `https`,
    "host": `cloud.mongodb.com`,
    "username": pub_key,
    "password": private_key,
    "digestAuth": true,
    "path": `/api/atlas/v1.0/orgs/${org_id}/groups`
  };
  
  const response = await context.http.get(args);
  const body = JSON.parse(response.body.text());
  
  if (response.statusCode != 200) throw {"error": body.detail, "fn": "getProjects", "statusCode": response.statusCodet};

  let promises = [];
  body.results.forEach(result => {
    console.log(JSON.stringify(result));
    promises.push(collection.replaceOne({"_id": result.id}, {"_id": result.id, "name": result.name,"Clusters":result.clusterCount}, {"upsert": true}));
    //promises.push(collection.insert({"_id": result.id}, {"_id": result.id, "name": result.name}, {"upsert": true}));
    if( result.clusterCount >1 ){
      //console.log("process me "+ result.links[0].href);
      
    }
    
    
  });
  return Promise.all(promises);
};
