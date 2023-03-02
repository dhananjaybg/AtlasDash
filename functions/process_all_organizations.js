exports = async function(arg){
   
  var master_time_stamp =  new Date();
  
  //return master_time_stamp;
  
  //logging_timestamp = Date.now();
  username = context.values.get("username"); // "mfbroowi";
  password = context.values.get("password"); // "f6cff4f7-27a3-439b-b21a-e9448ad8a8ec";
  org = context.values.get("org"); //"5e384d3179358e03d842ead1";
  
  var i = 1;
  
  while(i){
     //master_time_stamp =  new Date("2023-02-"+i);
     master_time_stamp =  new Date();
    console.log(master_time_stamp);
     var findResult =  await context.functions.execute("start_process", org, username, password,master_time_stamp).catch(err => { return err; });

    i--;
  }
  
  return { result: findResult };  
  
};