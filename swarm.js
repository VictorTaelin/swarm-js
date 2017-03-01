const Q = require("bluebird");
const assert = require("assert");
const files = require("./files.js");
const fsp = require("fs-promise");
const got = require("got");
const mimetype = require('mimetype');
const path = require("path");
const {spawn} = require("child_process");

// ∀ a . String -> JSON -> Map String a -o Map String a
//   Inserts a key/val pair in an object impurely.
const impureInsert = key => val => map =>
  (map[key] = val, map);

// String -> JSON -> Map String JSON
//   Merges an array of keys and an array of vals into an object.
const toMap = keys => vals => {
  let map = {}; 
  for (let i = 0, l = keys.length; i < l; ++i)
    map[keys[i]] = vals[i];
  return map;
};

// ∀ a . Map String a -> Map String a -> Map String a
//   Merges two maps into one.
const merge = a => b => {
  let map = {};
  for (let key in a)
    map[key] = a[key];
  for (let key in b)
    map[key] = b[key];
  return map;
};

// String -> String -> String
const rawUrl = swarmUrl => hash =>
  `${swarmUrl}/bzzr:/${hash}`

// String -> String -> Promise Buffer
//   Gets the raw contents of a Swarm hash address.  
const downloadData = swarmUrl => hash =>
  got(rawUrl(swarmUrl)(hash), {encoding: null})
    .then(response => response.body);

// String -> String -> Promise (Map String String)
//   Gets the routing table of a Swarm address.
//   Returns a map from paths to addresses.
const downloadRoutes = swarmUrl => hash => {
  const search = hash => path => routes => {
    const entryContents = entry =>
      entry.contentType === "application/bzz-manifest+json"
        ? search(entry.hash)(path + entry.path)(routes)
        : Q.resolve(impureInsert(path + entry.path)(entry.hash)(routes));
    return downloadData(swarmUrl)(hash)
      .then(text => JSON.parse(text).entries)
      .then(entries => Q.reduce(entries.map(entryContents), (a,b) => b));
  }
  return search(hash)("")({});
}

// String -> String -> Promise (Map String Buffer)
//   Gets the entire directory tree in a Swarm address.
//   Returns a promise mapping paths to file contents.
const downloadDirectory = swarmUrl => hash => 
  downloadRoutes (swarmUrl) (hash)
    .then(routingTable => {
      const paths = Object.keys(routingTable);
      const hashs = paths.map(path => routingTable[path]);
      const contents = hashs.map(downloadData(swarmUrl));
      return Q.all(contents).then(contents => toMap(paths)(contents));
    });

// String -> String -> Promise String
//   Gets the raw contents of a Swarm hash address.  
//   Returns a promise with the downloaded file path.
const downloadDataToDisk = swarmUrl => hash => filePath =>
  files.download(rawUrl(swarmUrl)(hash))(filePath);

// String -> String -> String -> Promise (Map String String)
//   Gets the entire directory tree in a Swarm address.
//   Returns a promise mapping paths to file contents.
const downloadDirectoryToDisk = swarmUrl => hash => dirPath =>
  downloadRoutes (swarmUrl) (hash)
    .then(routingTable => {
      let downloads = [];
      for (let route in routingTable) {
        if (route.length > 0) {
          const filePath = path.join(dirPath, route);
          downloads.push(downloadDataToDisk(swarmUrl)(routingTable[route])(filePath));
        };
      };
      return Q.all(downloads).then(() => dirPath);
    });

// String -> Buffer -> Promise String
//   Uploads raw data to Swarm. 
//   Returns a promise with the uploaded hash.
const uploadData = swarmUrl => contents =>
  got(`${swarmUrl}/bzzr:/`, {"body": contents})
    .then(response => response.body);

// String -> String -> String -> String -> String -> Promise String
//   Uploads raw data to the Swarm manifest at a given hash,
//   under a specific route. 
//   Returns a promise containing the uploaded hash.
const uploadToManifest = swarmUrl => hash => route => mimeType => contents =>
  got.put(`${swarmUrl}/bzz:/${hash}${route}`, {
    "headers": {"content-type": mimeType},
    "body": contents})
    .then(response => response.body);

// String -> Map String Buffer -> Promise String
//   Uploads a directory to Swarm. The directory is
//   represented as a map of routes and raw contents.
//   A default path is encoded by having a "" route.
const uploadDirectory = swarmUrl => directory =>
  uploadData(swarmUrl)("{}")
    .then(hash => {
      const uploadRoute = route => hash => {
        const contents = directory[route];
        const mimeType = contents["content-type"] || mimetype.lookup(route);
        return uploadToManifest(swarmUrl)(hash)(route)(mimeType)(contents);
      };
      return Object.keys(directory).reduce(
        (hash,route) => hash.then(uploadRoute(route)),
        Q.resolve(hash));
    });

// String -> Nullable String -> Map String Buffer -> Promise String 
const uploadDirectoryWithDefaultPath = swarmUrl => defaultPath => directory =>
  uploadDirectory(swarmUrl)(merge(directory)(defaultPath ? {"": directory[defaultPath] || ""} : {}));

// String -> Promise String
const uploadDataFromDisk = swarmUrl => filePath => 
  fsp.readFile(filePath)
    .then(uploadData(swarmUrl));

// String -> Nullable String -> String -> Promise String
const uploadDirectoryFromDiskWithDefaultPath = swarmUrl => defaultPath => dirPath =>
  files.directoryTree(dirPath)
    .then(fullPaths => {
      const files = Q.all(fullPaths.map(path => fsp.readFile(path)));
      const paths = Q.resolve(fullPaths.map(path => path.slice(dirPath.length)));
      return Q.join(paths, files, (paths, files) => toMap (paths) (files))
    })
    .then(uploadDirectoryWithDefaultPath(swarmUrl)(defaultPath));

// String -> String -> Promise String
const uploadDirectoryFromDisk = swarmUrl => dirPath =>
  uploadDirectoryFromDiskWithDefaultPath (swarmUrl) (null) (dirPath);

// String -> Promise String
//   Downloads the Swarm binaries into a path. Returns a promise that only
//   resolves when the exact Swarm file is there, and verified to be correct.
//   If it was already there to begin with, skips the download.
const downloadBinary = path => {
  const archiveUrl = "https://gethstore.blob.core.windows.net/builds/geth-alltools-darwin-amd64-1.5.9-a07539fb.tar.gz";
  const archiveMd5 = "bc02dc162928e4f0acce432df70135af";
  const swarmMd5 = "1c3e04d93a6ee6d227476d2a56513af0";
  return files.safeDownloadArchived (archiveUrl) (archiveMd5) (swarmMd5) (path);
};

// type SwarmSetup = {
//   account : String,
//   password : String,
//   dataDir : String,
//   ethApi : String
// }

// SwarmSetup ~> Promise Process
//   Starts the Swarm process.
const startProcess = swarmSetup => new Q((resolve, reject) => {
  const hasString = str => buffer => ('' + buffer).indexOf(str) !== -1;
  const {account, password, dataDir, ethApi} = swarmSetup;
  const binPath = path.join(swarmSetup.dataDir, "bin", "swarm");

  const STARTUP_TIMEOUT_SECS = 3;
  const WAITING_PASSWORD = 0;
  const STARTING = 1;
  const LISTENING = 2;
  const PASSWORD_PROMPT_HOOK = "Passphrase";
  const LISTENING_HOOK = "Swarm HTTP proxy started";
  
  let state = WAITING_PASSWORD;

  const swarmProcess = spawn(binPath, [
    '--bzzaccount', account,
    '--datadir', dataDir,
    '--ethapi', ethApi]);

  const handleProcessOutput = data => {
    if (state === WAITING_PASSWORD && hasString (PASSWORD_PROMPT_HOOK) (data)) {
      setTimeout(() => {
        state = STARTING;
        swarmProcess.stdin.write(password + '\n');
      }, 500);
    } else if (state === STARTING && hasString (LISTENING_HOOK) (data)) {
      state = LISTENING;
      clearTimeout(timeout);
      resolve(swarmProcess);
    }
  }

  swarmProcess.stdout.on('data', handleProcessOutput);
  swarmProcess.stderr.on('data', handleProcessOutput);
  swarmProcess.on('close', () => {}); // TODO: handle close?
  const timeout = setTimeout(() =>
    reject(new Error("Couldn't start swarm process.")),
    20000);
});

// Process ~> Promise ()
//   Stops the Swarm process.
const stopProcess = process => new Q((resolve, reject) => {
  process.stderr.removeAllListeners('data');
  process.stdout.removeAllListeners('data');
  process.stdin.removeAllListeners('error');
  process.removeAllListeners('error');
  process.removeAllListeners('exit');
  process.kill('SIGINT');

  const killTimeout = setTimeout(
    () => process.kill('SIGKILL'),
    8000);

  process.once('close', () => {
    clearTimeout(killTimeout);
    resolve();
  });
});

// SwarmSetup -> (SwarmAPI -> Promise ()) -> Promise ()
//   Receives a Swarm configuration object and a callback function. It then
//   downloads the Swarm binaries to the dataDir (if not there), checksums,
//   starts the Swarm process and calls the callback function with an API
//   object using the local node. That callback must return a promise which
//   will resolve when it is done using the API, so that this function can
//   close the Swarm process properly. Returns a promise that resolves when the
//   user is done with the API and the Swarm process is closed.
//   TODO: check if Swarm process is already running (improve `isAvailable`)
const local = swarmSetup => useAPI =>
  downloadBinary(path.join(swarmSetup.dataDir, "bin", "swarm"))
    .then(() => startProcess(swarmSetup))
    .then(process => useAPI(at("http://localhost:8500")).then(() => process))
    .then(stopProcess);

// String ~> Promise Bool
//   Returns true if Swarm is available on `url`.
//   TODO: too slow; can this be improved?
const isAvailable = swarmUrl => {
  const testFile = "test";
  const testHash = "c9a99c7d326dcc6316f32fe2625b311f6dc49a175e6877681ded93137d3569e7";
  return uploadData(swarmUrl)(testFile)
    .then(hash => hash === testHash)
    .catch(() => false);
};

// () -> Promise Bool
//   Not sure how to mock Swarm to test it properly. Ideas?
const test = () => Q.resolve(true);

// String -> SwarmAPI
const at = swarmUrl => ({
  downloadData: downloadData(swarmUrl),
  downloadDataToDisk: downloadDataToDisk(swarmUrl),
  downloadDirectory: downloadDirectory(swarmUrl),
  downloadDirectoryToDisk: downloadDirectoryToDisk(swarmUrl),
  downloadRoutes: downloadRoutes(swarmUrl),
  isAvailable: () => isAvailable(swarmUrl),
  uploadData: uploadData(swarmUrl),
  uploadDataFromDisk: uploadDataFromDisk(swarmUrl),
  uploadDirectory: uploadDirectory(swarmUrl),
  uploadDirectoryFromDisk: uploadDirectoryFromDisk(swarmUrl),
  uploadDirectoryFromDiskWithDefaultPath: uploadDirectoryFromDiskWithDefaultPath(swarmUrl),
  uploadToManifest: uploadToManifest(swarmUrl),
});

module.exports = {
  at,
  local,
  downloadBinary,
  downloadData,
  downloadDataToDisk,
  downloadDirectory,
  downloadDirectoryToDisk,
  downloadRoutes,
  isAvailable,
  startProcess,
  stopProcess,
  uploadData,
  uploadDataFromDisk,
  uploadDirectory,
  uploadDirectoryFromDisk,
  uploadDirectoryFromDiskWithDefaultPath,
  uploadToManifest,
};

