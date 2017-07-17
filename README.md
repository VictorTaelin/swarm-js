## Swarm.js

This library allows you to interact with the Swarm network from JavaScript. It:

- Communicates with the network through the HTTP API;

- Can be used either with a local node or a gateway;

- Solves manifests recursively;

- Enables you to upload/download raw data and directores;

- Enables you to upload/download from disk or from pure JS;

- Works on the browser and on Node.js;

- Can automatically download the Swarm binaries safely and administer the local node for you.

[Live demo!](http://swarm-gateways.net/bzz:/aa9dd4d23e105d0a2e62da38544112468372cd5ad038fbdc9874b1f51b8e76f2/)

## Installing

    npm install swarm-js

## Simple usage

The simplest use case for Swarm is uploading/downloading raw data and directories. First, load the lib:

```javascript
// Loads the Swarm API pointing to the official gateway
const swarm = require("swarm-js").at("http://swarm-gateways.net");
```

#### Upload raw data

To upload raw data, just call `swarm.upload(buffer)`. It returns a promise with the uploaded hash.

```javascript
const file = "test file"; // could also be an Uint8Array of binary data
swarm.upload(file).then(hash => {
  console.log("Uploaded file. Address:", hash);
})
```

#### Download raw data

To download raw data, just call `swarm.download(hash)`. It returns a promise with the data buffer.

```javascript
const fileHash = "a5c10851ef054c268a2438f10a21f6efe3dc3dcdcc2ea0e6a1a7a38bf8c91e23";
swarm.download(fileHash).then(buffer => {
  console.log("Downloaded file:", buffer.toString());
});
```

#### Upload a directory

To upload a directory, just call `swarm.upload(directory)`, where directory is an object mapping paths to entries, those containing a mime-type and the data (a buffer).

```javascript
const dir = {
  "/foo.txt": {type: "text/plain", data: new Buffer("sample file")},
  "/bar.txt": {type: "text/plain", data: new Buffer("another file")}
};
swarm.upload(dir).then(hash => {
  console.log("Uploaded directory. Address:", hash);
});
```

#### Download a directory

To dowwload a directory, just call `swarm.download(hash)`. Swarm.js will return a directory instead of a buffer by detecting the existence of a manifest on that hash.

```javascript
const dirHash = "7e980476df218c05ecfcb0a2ca73597193a34c5a9d6da84d54e295ecd8e0c641";
swarm.download(dirHash).then(dir => {
  console.log("Downloaded directory:");
  for (let path in dir) {
    console.log("-", path, ":", dir[path].data.toString());
  }
});
```

#### Download a file/directory to disk (on Node.js)

```javascript
swarm.download("DAPP_HASH", "/target/dir")
  .then(path => console.log(`Downloaded DApp to ${path}.`))
  .catch(console.log);
```

#### Upload raw data, a file or a directory from disk (on Node.js)

```javascript
swarm.upload({
  path: "/path/to/thing",      // path to data / file / directory
  kind: "directory",           // could also be "file" or "data"
  defaultFile: "/index.html"}) // optional, and only for kind === "directory"
  .then(console.log)
  .catch(console.log);
```

#### Upload raw data, a file or a directory from disk (on Browser)

```javascript
swarm.upload({pick: "file"}) // could also be "directory" or "data"
```

## Uploading an Ethereum DApp

When it comes to decentralized applications (DApps), the Ethereum network is responsible for the back-end logic, while Swarm is responsible for hosting and serving the front-end code. Hosting a DApp on Swarm is as simple as creating a directory with some HTMLs and a default route (the "index.html"). Check out [this example](examples/dapp_upload.js) for how that could be doen.

## Running a local node

Rather than using a gateway, you might wish to run your own local node. For that, you can either [download/install/run it yourself](http://swarm-guide.readthedocs.io/en/latest/), and then use `require("swarm-js").at("http://localhost:8500")`, or let Swarm.js take care of it. Check out [this example](examples/run_node.js) for how that could be done.
