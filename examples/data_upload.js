// Uploads raw data to the Swarm network. 
// Outputs the Swarm address: a5c10851ef054c268a2438f10a21f6efe3dc3dcdcc2ea0e6a1a7a38bf8c91e23

const swarm = require("./../swarm.js").at("http://swarm-gateways.net");

swarm.uploadData("test string")
  .then(console.log)
  .catch(console.log);
