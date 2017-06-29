// Uploads a DApp from a local directory to the Swarm network.
// Outputs the DApp address. In this case, it is:
// 379d2791624c3e3719bb28f7bfa362cc9c726ec06482b5800c8e3cefaf2b7bcf

const swarm = require("./../src/swarm.js").at("http://localhost:8500");
const path = require("path");

swarm.upload({
  path: path.join(__dirname,"example_dapp_uploader"),
  kind: "directory"}) // could be "file", "data" or "directory"
  .then(console.log)
  .catch(console.log);
