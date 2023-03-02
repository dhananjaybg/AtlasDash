exports = async function(org,username,password, project_id ){
 
  var ProcessCount = 0;
  const collection = context.services.get(`mongodb-atlas`).db(`AtlasDash`).collection(`DailySummary`);
  var xPath = `/api/atlas/v1.0/groups/${project_id}/processes`;
  
  const args = {
    "scheme": `https`,
    "host": `cloud.mongodb.com`,
    "username": username,
    "password": password,
    "digestAuth": true,
    "path": xPath
  };
  
  var data = {};
  
  try {
    
      const response = await context.http.get(args);
      if (response.statusCode != 200) throw {"REST API Error": response.body.detail, "fn": "getHostIdsPerProject", "statusCode": response.statusCodet};
      data =  JSON.parse(response.body.text());
    
  }catch(err){
    console.log("Error occurred while fetching processes per projects:", err.message);
    return { error: err.message };
  }
  
  var proj_proc_dict = {}; // create an empty array
  
  try{
      
      var data_set = data.results.filter(function(item){return item.typeName == "REPLICA_PRIMARY";});
      
      for (const proc_id of data_set) {
       
        if( proj_proc_dict[proc_id.id] == project_id){
            console.log("FOUND and Skipped" + proc_id.id );
        }else
        {
          proj_proc_dict[proc_id.id] =  project_id;
          // console.log("INSERTED" + proc_id.id );
        }
      }
  }catch(err){
    console.log("Error occurred while fetching processes per projects:", err.message);
    return { error: err.message };
  }
  return proj_proc_dict;
};