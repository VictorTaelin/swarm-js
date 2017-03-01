// Downloads a directory hosted on the Swarm network to the disk.

const swarm = require("./../swarm.js").at("http://swarm-gateways.net");
const path = require("path");

// The hash of the DApp we uploaded on the other example.
const exampleDAppHash = "8587c8e716bfceea12a7306d85a8a8ccad5019020916eb5a21fa47a7f1826891";
const targetDirPath = path.join(__dirname,"example_dapp");

swarm.downloadDirectoryToDisk(exampleDAppHash)(targetDirPath)
  .then(dirPath => console.log(`Downloaded DApp to ${dirPath}.`))
  .catch(console.log);
