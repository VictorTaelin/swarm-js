// Downloads a DApp without the filesystem; that is, instead of saving the
// directory tree to disk, it returns a JSON mapping routes to contents
// (buffers). That allows any DApp to download the directory tree of any other
// DApp in pure JavaScript.

const swarm = require("./../src/swarm.js").at("http://localhost:8500");

// The hash of the DApp we uploaded on the other example.
const exampleDAppHash = "c4f2f1f2894a17c6b240e59f31a9e46d32fb37b38ec0903daa8d06755282381c";

// Download the example DApp and print its index.html.
// It knows it is a DApp (not a file) by checking the existence of a manifest.
swarm.download(exampleDAppHash)
  .then(console.log)
  .catch(console.log);
