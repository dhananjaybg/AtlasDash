exports = async function(arg){
  
  //commit chk 2 
  var master_time_stamp =  new Date();
  //logging_timestamp = Date.now();
  const username = context.values.get("username"); 
  const password = context.values.get("password"); 
  const org = context.values.get("org"); 
  
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