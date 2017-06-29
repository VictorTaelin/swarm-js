// Downloads a DApp without the filesystem; that is, instead of saving the
// directory tree to disk, it returns a JSON mapping routes to contents
// (buffers). That allows any DApp to download the directory tree of any other
// DApp in pure JavaScript.

const swarm = require("./../src/swarm.js").at("http://localhost:8500");

// The hash of the DApp we uploaded on the other example.
const exampleDAppHash = "fa059fa34ead773c5bb90595335e5925278bee3f9a4ba39741ddcf464fdd964f";

// Download the example DApp and print its index.html.
// It knows it is a DApp (not a file) by checking the existence of a manifest.
swarm.download(exampleDAppHash)
  .then(console.log)
  .catch(console.log);

// This script outputs:
// { 'ethereum_icon.png':
//    { type: 'image/png',
//      data: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 00 10 00 00 00 10 08 04 00 00 00 b5 fa 37 ea 00 00 00 f7 49 44 41 54 28 91 63 60 40 01 0d 09 0e ... > },
//   'index.html':
//    { type: 'text/html',
//      data: <Buffer 3c 68 74 6d 6c 3e 0a 20 20 3c 62 6f 64 79 3e 0a 20 20 20 20 3c 68 33 3e 3c 69 6d 67 20 73 72 63 3d 22 65 74 68 65 72 65 75 6d 5f 69 63 6f 6e 2e 70 6e ... > },
//   '':
//    { type: 'text/html',
//      data: <Buffer 3c 68 74 6d 6c 3e 0a 20 20 3c 62 6f 64 79 3e 0a 20 20 20 20 3c 68 33 3e 3c 69 6d 67 20 73 72 63 3d 22 65 74 68 65 72 65 75 6d 5f 69 63 6f 6e 2e 70 6e ... > },
//   'foo/test_text_1.txt':
//    { type: 'text/plain',
//      data: <Buffer 74 65 73 74 20 74 65 78 74 20 23 31> },
//   'foo/test_text_2.txt':
//    { type: 'text/plain',
//      data: <Buffer 74 65 73 74 20 74 65 78 74 20 23 32> } }
