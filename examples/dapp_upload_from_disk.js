// Uploads a DApp from a local directory to the Swarm network.
// Outputs the DApp address. In this case, it is:
// 8587c8e716bfceea12a7306d85a8a8ccad5019020916eb5a21fa47a7f1826891

const swarm = require("./../swarm.js").at("http://swarm-gateways.net");
const path = require("path");

// Notice we use the `WithDefaultPath` version, which allows us to specify a
// root file that will be served on the empty path (e.g., bzz:/my_dapp.eth/).
swarm.uploadDirectoryFromDiskWithDefaultPath("/index.html")(path.join(__dirname,"example_dapp"))
  .then(console.log)
  .catch(console.log);
