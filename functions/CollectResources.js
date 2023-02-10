exports = async function(org, username, password){

  const promises = [
    //getInvoices(org, username, password),
    //getOrg(org, username, password),
    getProjects(org, username, password)
  ];
  await Promise.all(promises);
  return {"org": org, "status": "success!"};
};

getProjects = async function(org, username, password)
{
  
  const refresh = context.values.get(`refreshProjectData`);
  if (!refresh) return Promise.resolve();

  const collection = context.services.get(`mongodb-atlas`).db(`billing`).collection(`projectdata`);

  const args = {
    "scheme": `https`,
    "host": `cloud.mongodb.com`,
    "username": username,
    "password": password,
    "digestAuth": true,
    "path": `/api/atlas/v1.0/orgs/${org}/groups`
  };
  
  const response = await context.http.get(args);
  const body = JSON.parse(response.body.text());
  if (response.statusCode != 200) throw {"error": body.detail, "fn": "getProjects", "statusCode": response.statusCodet};

  let promises = [];
  body.results.forEach(result => {
    promises.push(collection.replaceOne({"_id": result.id}, {"_id": result.id, "name": result.name}, {"upsert": true}));
  });
  return Promise.all(promises);
};
