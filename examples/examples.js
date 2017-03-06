const swarm = require("./../src/swarm.js").at("http://swarm-gateways.net");

// Uploading raw data
const file = "test file";
swarm.upload(new Buffer(file)).then(hash => {
  console.log("Uploaded file. Address:", hash);
})

// Downloading raw data
const fileHash = "a5c10851ef054c268a2438f10a21f6efe3dc3dcdcc2ea0e6a1a7a38bf8c91e23";
swarm.download(fileHash).then(buffer => {
  console.log("Downloaded file:", buffer.toString());
});

// Uploading directory
const dir = {
  "/foo.txt": {type: "text/plain", data: new Buffer("sample file")},
  "/bar.txt": {type: "text/plain", data: new Buffer("another file")}
};
swarm.upload(dir).then(hash => {
  console.log("Uploaded directory. Address:", hash);
});

// Downloaading a directory
const dirHash = "7e980476df218c05ecfcb0a2ca73597193a34c5a9d6da84d54e295ecd8e0c641";
swarm.download(dirHash).then(dir => {
  console.log("Downloaded directory:");
  for (let path in dir) {
    console.log("-", path, ":", dir[path].data.toString());
  }
});
