// Downloads raw data from the Swarm network. 
// Outputs the downloaded data: "test string"

const swarm = require("./../swarm.js").at("http://swarm-gateways.net");
const hash = "a5c10851ef054c268a2438f10a21f6efe3dc3dcdcc2ea0e6a1a7a38bf8c91e23";

swarm.downloadData(hash)
  .then(buffer => console.log(buffer.toString()))
  .catch(console.log);

