// Downloads a directory hosted on the Swarm network to the disk.

const swarm = require("./../swarm.js").at("http://swarm-gateways.net");
const path = require("path");

// The hash of the DApp we uploaded on the other example.
const exampleDAppHash = "379d2791624c3e3719bb28f7bfa362cc9c726ec06482b5800c8e3cefaf2b7bcf";
const targetDirPath = path.join(__dirname,"example_dapp");

swarm.download(exampleDAppHash, targetDirPath)
  .then(dirPath => console.log(`Downloaded DApp to ${dirPath}.`))
  .catch(console.log);
