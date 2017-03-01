// Solves the Swarm manifest at a given path recursively, returns a flat JSON
// mapping the routes of its directory tree to the hash of each file on it.

const swarm = require("./../swarm.js").at("http://swarm-gateways.net");
const exampleDAppHash = "8587c8e716bfceea12a7306d85a8a8ccad5019020916eb5a21fa47a7f1826891";

swarm.downloadRoutes(exampleDAppHash)
  .then(console.log)
  .catch(console.log);

// This script outputs:
// { '': '957eb52bccea0e9a359952dc13542b3021c8f5fb772ea15f78324a807689eeb6',
//   'index.html': '957eb52bccea0e9a359952dc13542b3021c8f5fb772ea15f78324a807689eeb6',
//   'ethereum_icon.png': '9da2d2d06748a1af3dc4764fc8124af6b47e331f814797f00b7367eb64600cd5',
//   'foo/test_text_1.txt': '9544a960bf1fbc30eb34e828d9afa70b01d6c9d19e3eda8964a63aec942067a9',
//   'foo/test_text_2.txt': '707cc95f1bbbb3df75be110beaef79738b11915204e8c83db43cbba6738d548e' }
