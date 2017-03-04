// Uploads raw data to the Swarm network. 
// Outputs the Swarm address: c9a99c7d326dcc6316f32fe2625b311f6dc49a175e6877681ded93137d3569e7

const swarm = require("./../swarm.js").at("http://swarm-gateways.net");

swarm.upload(new Buffer("test"))
  .then(console.log)
  .catch(console.log);
