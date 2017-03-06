const Swarm = require("./../src/swarm.js");

// To run Swarm locally, you need a running Geth
// node and an Ethereum account/password
const config = {
  account: "d849168d52ea5c40de1b0b973cfd96873c961963",
  password: "sap",
  dataDir: process.env.HOME+"/Library/Ethereum/testnet",
  ethApi: process.env.HOME+"/Library/Ethereum/testnet/geth.ipc"
};

// Magically starts a local Swarm node
// Downloads binaries if necessary
Swarm.local(config)(swarm => new Promise((resolve, reject) => {
  console.log("running");
  console.log(swarm);

  // Uploads data using the local node
  swarm.upload(new Buffer("test")).then(hash => {
    console.log("Uploaded data. Address:", hash);

    // Closes the Swarm process.
    resolve();
  });

}))
.then(() => console.log("Done!"));
