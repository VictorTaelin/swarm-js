const swarm = require("./../src/swarm.js").at("http://localhost:8500");

// Uploading raw data
const file = "test file";
swarm.upload(new Buffer(file)).then(hash => {
  console.log("Uploaded file. Address:", hash);
})

// Downloading raw data
const fileHash = "19be0ca2d257a9de8bfdaf406460309e1610d624bc15a91103f7a138a91d8fe2";
swarm.download(fileHash).then(buffer => {
  console.log("Downloaded file:", buffer.toString());
}).catch(console.log);

// Uploading directory
const dir = {
  "/foo.txt": {type: "text/plain", data: new Buffer("sample file")},
  "/bar.txt": {type: "text/plain", data: new Buffer("another file")}
};
swarm.upload(dir).then(hash => {
  console.log("Uploaded directory. Address:", hash);
});

//// Downloaading a directory
const dirHash = "d61746753f2e1fc8c908035d82a941d204564d0252dbf3eb940abb9fb8f334f7";
swarm.download(dirHash).then(dir => {
  console.log("Downloaded directory:");
  for (let path in dir) {
    console.log("-", path, ":", dir[path].data.toString());
  }
}).catch(console.log);
