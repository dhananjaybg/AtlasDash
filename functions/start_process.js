//exports = async function(org, username, password, master_time_stamp){

exports = async function(){
    //edit_here_DJ_more

    const master_time_stamp =  new Date();
    const username = context.values.get("username"); 
    const password = context.values.get("password"); 
    const org = context.values.get("org");
    let AtlasDB = context.values.get("database");
    let Collections = context.values.get("CollectionName");
  
    
    let factor_var  = convert_by_size_metric(context.values.get("SIZE_METRIC").value);
    let all_dbs_per_org = 0;
    let total_dbs_size_per_org = 0;
    let procs_per_org = [];
    var project_ids = {};
    
    console.log("getProjectCount START = ");
    project_ids =  await context.functions.execute("getProjectCount", org, username, password,master_time_stamp).catch(err => { return err; });
    console.log("getProjectCount COMPLETE = " +JSON.stringify(project_ids));
    // *************.   call "getHostIdsPerProject" *************// *************// *************// *************
    console.log("test dict >>>" + project_ids['5f9780dada4f8649799002a7'] );
    
    for (const prj_id of project_ids) {
        let procs =  await context.functions.execute("getHostIdsPerProject", context.values.get("org"), context.values.get("username"), context.values.get("password"),prj_id['key'] )
        .catch(err => { return err; });
        //console.log("procs : " + JSON.stringify(procs));
        procs_per_org.push(procs);
    }
    
    console.log("getHostIdsPerProject COMPLETE = "  + JSON.stringify(procs_per_org.length));
    // *************call "getDatabasesPerCluster" *************// *************// *************

    for (var item of procs_per_org ){
        var dbs_per_project = 0;
        var total_db_size_per_project = 0;
        
        //console.log("NEW_DBG: item>> "+ JSON.stringify(item));
        
        for (var record in item){
            res =  await context.functions.execute("getDBCountAndSize", context.values.get("org"), context.values.get("username"), context.values.get("password"),master_time_stamp, item[record],record).catch(err => { return err; });
            dbs_per_project = dbs_per_project + parseInt(res.count);
            total_db_size_per_project = total_db_size_per_project + parseInt(res.size);
        }
          
        //capture dbs per project before it resets 
        all_dbs_per_org  = all_dbs_per_org + dbs_per_project;
        total_dbs_size_per_org = total_dbs_size_per_org + parseInt(total_db_size_per_project);
        
        let filter = {"master_ts" : master_time_stamp};
        let project_name = fetch_project_name(project_ids,item[record]);
        console.log("project_name >> "+ project_name);
        
        let rec_x =  {"project_id":item[record],"project_name": project_name ,"dbs_count_per_project":dbs_per_project,"dbs_size_per_project":total_db_size_per_project };
        let set_fields = {$push: { "projects": rec_x }};
        //console.log("NEW_DBG: set_fields "+ JSON.stringify(set_fields));
        
        let update_result = await context.functions.execute("updateDB", AtlasDB , Collections.Daily,filter,set_fields);
    }

    total_dbs_size_per_org = total_dbs_size_per_org/factor_var;
    console.log("Final Count of DBs: "+ all_dbs_per_org + "\nFinal Count of DB SIZE: "+ total_dbs_size_per_org); 
    // *************call "updateDB" ****************************************************
    
    let filter = {"master_ts" : master_time_stamp};
    let set_fields = {"$set": {"total_databases_per_org":all_dbs_per_org,"total_databases_size_per_org":total_dbs_size_per_org }};
    
    let update_result = await context.functions.execute("updateDB",  AtlasDB , Collections.Daily,filter,set_fields,false);
    console.log("updateDB COMPLETE = "  + JSON.stringify(update_result));
    
    return update_result;

};

fetch_project_name = function(my_dict, my_key)
{
    console.log("my_dict >> "+ JSON.stringify(my_dict));
    /*  
    for (var key_val in my_dict){
      console.log("record"+ JSON.stringify(key_val)+" == " + my_key)
      if (key_val["key"] === my_key){
          return key_val['value'];
      }
    }
    
    for (const [key, value] of Object.entries(my_dict)) {
      console.log(JSON.stringify(key), JSON.stringify(value));
    }
    */
    return null;
};

convert_by_size_metric = function(data_value)
{
    let ret_value = 1024*1024*1024
    
    if (data_value == "GB"){
        ret_value = ret_value;
    }else if(data_value == "TB"){
        ret_value = ret_value * 1024;
    }else{
        ret_value = 1;
    }
    
    return ret_value;

};
