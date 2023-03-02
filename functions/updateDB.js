exports = async function(db_name,collection_name,rec_doc_key,update,upsert_flag){
  const collection = context.services.get(`mongodb-atlas`).db(db_name).collection(collection_name);

  try{
      await collection.updateOne(rec_doc_key, update, { 'upsert' : upsert_flag});
      //console.log(JSON.stringify(rec_doc));
  }catch(err){
      console.log("Error occurred while inserting record to Mongo:", err.message);
      return { error: err.message };
  }

  return true;
};