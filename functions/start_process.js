//exports = async function(org, username, password, master_time_stamp){

exports = async function(){
  
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
    
    
    let project_ids =  await context.functions.execute("getProjectCount", org, username, password,master_time_stamp).catch(err => { return err; });
    console.log("getProjectCount COMPLETE = " + project_ids);
    // *************.   call "getHostIdsPerProject" *************// *************// *************// *************
    
    for (const prj_id of project_ids) {
        let procs =  await context.functions.execute("getHostIdsPerProject", context.values.get("org"), context.values.get("username"), context.values.get("password"),prj_id )
        .catch(err => { return err; });
        procs_per_org.push(procs);
    }
    
    console.log("getHostIdsPerProject COMPLETE = "  + JSON.stringify(procs_per_org.length));
    // *************call "getDatabasesPerCluster" *************// *************// *************

    for (var item of procs_per_org ){
        var dbs_per_project = 0;
        var total_db_size_per_project = 0;
        
        for (var record in item){
            res =  await context.functions.execute("getDBCountAndSize", context.values.get("org"), context.values.get("username"), context.values.get("password"),master_time_stamp, item[record],record).catch(err => { return err; });
            dbs_per_project = dbs_per_project + parseInt(res.count);
            total_db_size_per_project = total_db_size_per_project + parseInt(res.size);
        }
          
        //capture dbs per project before it resets 
        all_dbs_per_org  = all_dbs_per_org + dbs_per_project;
        total_dbs_size_per_org = total_dbs_size_per_org + parseInt(total_db_size_per_project);
        
        let filter = {"master_ts" : master_time_stamp};
        let rec_x =  {"project_id":item[record],"dbs_count_per_project":dbs_per_project,"dbs_size_per_project":total_db_size_per_project };
        let set_fields = {$push: { "projects": rec_x }};
        
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