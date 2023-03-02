exports = async function(arg){
  
  //commit chk
  var master_time_stamp =  new Date();
  //logging_timestamp = Date.now();
  const username = context.values.get("username"); // "mfbroowi";
  const password = context.values.get("password"); // "f6cff4f7-27a3-439b-b21a-e9448ad8a8ec";
  const org = context.values.get("org"); //"5e384d3179358e03d842ead1";
  
  let i = 16;
  let findResult="";
  
  while(i){
    master_time_stamp =  new Date("2023-02-"+i);
    //master_time_stamp =  new Date();
    console.log(master_time_stamp);
    findResult =  await context.functions.execute("start_process", org, username, password,master_time_stamp).catch(err => { return err; });

    i--;
  }
  
  return { result: findResult };  
  
};