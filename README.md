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

## Basic usage

The simplest use case for Swarm is uploading/downloading raw data and directories. First, load the lib:

```javascript
// Loads the Swarm API pointing to the official gateway
const swarm = require("swarm-js").at("http://swarm-gateways.net");
```

#### Upload raw data

To upload raw data, just call `swarm.upload(buffer)`. It returns a promise with the uploaded hash.

```javascript
const file = "test file";
swarm.upload(new Buffer(file)).then(hash => {
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

To dowwnload a directory, just call `swarm.download(hash)`. Swarm.js will return a directory instead of a buffer by detecting the existence of a manifest on that hash.

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

#### Uploading a PDF

- [Uploading a PDF  in various ways (gist).](https://gist.github.com/MaiaVictor/ae0439de5ca752604675ffa4535e47b4)

## Uploading an Ethereum DApp

When it comes to decentralized applications (DApps), the Ethereum network is responsible for the back-end logic, while Swarm is responsible for hosting and serving the front-end code. Hosting a DApp on Swarm is as simple as creating a directory with some HTMLs and a default route (the "index.html"). This, too, can be done with Swarm.js either [from disk](https://github.com/MaiaVictor/swarm-js/blob/master/examples/dapp_upload_from_disk.js), or with [pure JavaScript](https://github.com/MaiaVictor/swarm-js/blob/master/examples/dapp_upload.js). Here is a sneak peek:

```javascript
const swarm = require("swarm-js").at("http://swarm-gateways.net");

const indexHtml =
`<html>
  <body>
    <h3><img src="ethereum_icon.png"/> Swarm.js example DApp</h3>
    <p><a href="foo/test_text_1.txt">Test #1</a></p>
    <p><a href="foo/test_text_2.txt">Test #2</a></p>
  </body>
</html>`;

(...)

const exampleDApp = {
  ""                     : {type: "text/html", data: indexHtml},
  "/index.html"          : {type: "text/html", data: indexHtml},
  "/ethereum_icon.png"   : {type: "image/png", data: ethereumIconPng},
  "/foo/test_text_1.txt" : {type: "text/plain", data: testText1},
  "/foo/test_text_2.txt" : {type: "text/plain", data: testText2}
}

swarm.upload(exampleDApp)
  .then(console.log)
  .catch(console.log);
```

When you run that script, it outputs a hash. You can then use that hash to access the uploaded DApp, by either using a Swarm-enabled browser such as Mist, or through a gateway. That demo DApp is live and can be accessed:

- If your browser recognizes Swarm, [click here](bzz://379d2791624c3e3719bb28f7bfa362cc9c726ec06482b5800c8e3cefaf2b7bcf/).

- If you are in a conventional browser, [click here](http://swarm-gateways.net/bzz:/379d2791624c3e3719bb28f7bfa362cc9c726ec06482b5800c8e3cefaf2b7bcf/).

## Running a local node

Rather than using a gateway, you might wish to run your own local node. For that, you can either [download/install/run it yourself](http://swarm-guide.readthedocs.io/en/latest/), and then use `require("swarm-js").at("http://localhost:8500")`, or let Swarm.js take care of it. For that, you just need to write a small config JSON with some info: 

```javascript
const Swarm = require("swarm-js");

// To run Swarm locally, you need a running Geth
// node and an Ethereum account/password
const config = {
  // Either an address visible by `geth account list`, or the path to a private
  // key (a file with 64 hex characteres); obviously, use an account without eth!
  account: "d849168d52ea5c40de1b0b973cfd96873c961963",

  // Password to unlock the address above; omit if you used a path to a key
  password: "sap",

  // Path where swarm-js will save its files
  dataDir: process.env.HOME + "/Library/Ethereum/swarm-js",

  // Path where geth.ipc is (that file is created when you start geth)
  ethApi: process.env.HOME + "/Library/Ethereum/geth.ipc",

  // Path where the swarm binary is (if there is nothing on this path, swarm-js
  // will safely download and place it there). Add `.exe` to the end if you're
  // on windows (otherwise it won't recognize as an executable file - eventually
  // this will be improved)
  binPath: process.env.HOME + "/Library/Ethereum/swarm-js/bin/swarm"
};

// Magically starts a local Swarm node
// Downloads binaries if necessary
Swarm.local(config, swarm => new Promise((resolve, reject) => {
  // you can use the `swarm` object inside here

  // Uploads data using the local node
  swarm.upload(new Buffer("test")).then(hash => {
    console.log("Uploaded data. Address:", hash);

    // Closes the Swarm process.
    resolve();
  });

})).then(() => console.log("Done!"));
```

If you have any trouble with this, please open an issue to let me know. That function does everything required to start a local Swarm node, including downloading binaries (if not available yet) and manging the process. It then gives you a `swarm` object pointing to the local node. If the Swarm process was started by `Swarm.js`, it will be closed when you call `resolve()`. While it is up, you're able to access it on your browser at `http://localhost:8500`.

## API

TODO: document the API.
