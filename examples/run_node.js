const Swarm = require("./../src/swarm.js");
const fs = require("fs");
const path = require("path");
const privateKeyPath = path.join(process.cwd(), "swarmPrivateKey");

// Writes a temporary private key file to disk
fs.writeFileSync(privateKeyPath, "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");

// To run Swarm locally, you need a running Geth
// node and an Ethereum account/password
const config = {
  privateKey: privateKeyPath,
  dataDir: process.env.HOME + "/Library/Ethereum/testnet",
  ethApi: process.env.HOME + "/Library/Ethereum/testnet/geth.ipc",
  binPath: process.env.HOME + "/.swarm/swarm"
};

// Magically starts a local Swarm node
// Downloads binaries if necessary
Swarm.local(config)(swarm => new Promise((resolve, reject) => {
  // Removes the temporary private key file
  fs.unlinkSync(privateKeyPath);

  // Uploads data using the local node
  swarm.upload(new Buffer("test")).then(hash => {
    console.log("Uploaded data. Address:", hash);

    // Closes the Swarm process.
    resolve();
  }).catch(e => console.log(e));
}))
.then(() => console.log("Done!"))
.catch(e => console.log(e));
