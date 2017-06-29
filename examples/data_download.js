// Downloads raw data from the Swarm network. 
// Outputs the downloaded data: "test"

const swarm = require("./../src/swarm.js").at("http://localhost:8500");
const hash = "c9a99c7d326dcc6316f32fe2625b311f6dc49a175e6877681ded93137d3569e7";

swarm.download(hash)
  .then(buffer => console.log(buffer.toString()))
  .catch(console.log);

