// Uploads raw data to the Swarm network. 
// Outputs the Swarm address: c9a99c7d326dcc6316f32fe2625b311f6dc49a175e6877681ded93137d3569e7

const swarm = require("./../src/swarm.js").at("http://localhost:8500");

swarm.upload(new Buffer("test"))
  .then(console.log)
  .catch(console.log);
