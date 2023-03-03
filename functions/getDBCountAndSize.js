exports = async function(org, username, password,master_time_stamp, project_id ,host_id ){
  
  
  let xPath = `/api/atlas/v1.0/groups/${project_id}/processes/${host_id}/databases`;
  let DatabasesCount = 0;
  let total_data_size = 0;
  let AtlasDB = context.values.get("database");
  let Collections = context.values.get("CollectionName");
  
  
  //const collection = context.services.get(`mongodb-atlas`).db(`AtlasDash`).collection(`DailySummary`);
  
  const args = {
    "scheme": `https`,
    "host": `cloud.mongodb.com`,
    "username": username,
    "password": password,
    "digestAuth": true,
    "path": xPath
  };
  
  try {
      const response = await context.http.get(args);
      const data =  JSON.parse(response.body.text());
      DatabasesCount = JSON.stringify(data.totalCount)

      var list_dbs = [];
      list_dbs = data.results.map(function(item) {
          return item.databaseName;
      });
     
      for (var rec of data.results) {
        
          //skip if these are 
          if (rec.databaseName == 'config' || rec.databaseName == 'local' || rec.databaseName == '__realm_sync')
            continue;
          
          var xPath2 = `/api/atlas/v1.0/groups/${project_id}/processes/${host_id}/databases/${rec.databaseName}/measurements`;
          var query_str = {
              granularity: ["P30D"],
              period: ["P30D"],
            }
          const args2 = {
              "scheme": `https`,
              "host": `cloud.mongodb.com`,
              "username": username,
              "password": password,
              "digestAuth": true,
              "path": xPath2,
              "query": query_str
            };
          const response2 = await context.http.get(args2);
          const data2 =  JSON.parse(response2.body.text());
          try{
            
              var db_datasize =  data2.measurements.filter( (item) => { return item.name === "DATABASE_STORAGE_SIZE"; });
              
              //let filter = { 'master_time_stamp' : master_time_stamp,"project_id":project_id , "host_id": host_id};
              //let db2_size = db_datasize
              //const cnt = db2_size.push(rec.databaseName);
              //let set_fields = {$push: {"measurements": db2_size}};
      
              //let update_result = await context.functions.execute("updateDB", AtlasDB , Collections.DBMeasure,filter,set_fields,true);
              //the reason why we hard code[0] because we only have filtered on DATABASE_STORAGE_SIZE
              var size_x = db_datasize[0].dataPoints[0].value
              total_data_size = total_data_size + parseInt(size_x);
  
          }catch(err){
      
            console.log(err.message + "xPath2" + xPath2 + "Failed: Filter or Value : " + JSON.stringify(db_datasize));
            //reset the counters ;
            total_data_size = 0 ;
            DatabasesCount = 0;
          }
      }

  }catch(err){
    console.log("getDBCountAndSize : Error :", err.message);
    return {
      error: err.message
    };
  }
  
  return { "count": DatabasesCount, "size" :total_data_size };
};
