exports = async function(org,username,password,master_ts){
  
  //exports('5e384d3179358e03d842ead1','mfbroowi','f6cff4f7-27a3-439b-b21a-e9448ad8a8ec');
  let Org_Name = "";
  
  const collection = context.services.get(`mongodb-atlas`).db(`AtlasDash`).collection(`DailySummary`);
  
  const xPath_0 = `/api/atlas/v1.0/orgs/${org}`;
  const args_0 = {
    "scheme": `https`,
    "host": `cloud.mongodb.com`,
    "username": username,
    "password": password,
    "digestAuth": true,
     "path": xPath_0
  };
  
  try {
    
    const response = await context.http.get(args_0);
    if (response.statusCode != 200) throw {"error": response.body.detail, "fn": "getOrgName", "statusCode": response.statusCodet};
    //const body is needed
    const body = JSON.parse(response.body.text());
    //console.log("THE BODY"+ JSON.stringify(body));
    Org_Name = body.name;
  }catch(err){
    console.log("Error occurred while fetching Org Name:", err.message);
    return { error: err.message };
  }
  
  
  const xPath = `/api/atlas/v1.0/orgs/${org}/groups`;
  const args = {
    "scheme": `https`,
    "host": `cloud.mongodb.com`,
    "username": username,
    "password": password,
    "digestAuth": true,
     "path": xPath
  };
  
  var ProjectCount = 0;
  var ClusterCount = 0;
  var project_ids = [];
  var project_ids_dict = [];

  
  try {
    
    const response = await context.http.get(args);
    if (response.statusCode != 200) throw {"error": response.body.detail, "fn": "getProjectCount", "statusCode": response.statusCodet};
    //const body is needed
    const body = JSON.parse(response.body.text());
    ProjectCount = body.totalCount;
    body.results.forEach(result => {
      ClusterCount =  ClusterCount + result.clusterCount;
      //console.log("bout projects ..." + JSON.stringify(result));
      //skip empty projects
      if ( result.clusterCount >0 ){
              //project_ids.push(result.id);
              //project_ids_dict.push({key : result.id,value:result.name});
              project_ids_dict.push({key:result.id, value: result.name});
      }
    });
    
    
  }catch(err){
    console.log("Error occurred while fetching ProjectID for Org_id:", err.message);
    return { error: err.message };
  }

  var res = { 
    "org": org ,
    "OrgName" : Org_Name,
    "org_projects_count": ProjectCount,
    "org_clusters_count" : ClusterCount,
    "master_ts": master_ts
  }
  
  try{
      await collection.insertOne(res);
      console.log("Updating MongoDB "+JSON.stringify(res));
      //for (const prj_id of project_ids_dict) {
      //   console.log("reading only keys:  "+JSON.stringify(prj_id['key']));
      //}
     
      
  }catch(err){
      console.log("Error occurred while inserting record to Mongo:", err.message);
      return { error: err.message };
  }

  //project_ids_dict = [{"key":"5d4d7ed3f2a30b18f4f88946","value":"Byrd"},{"key":"5b6c7a944e65810c2fc488b4","value":"Ghevde"}];
  //project_ids_dict = [{"key":"5b6c7a944e65810c2fc488b4","value":"Ghevde"}];
  return project_ids_dict;
};