// Thanks https://github.com/axic/swarmhash

const keccak = require("eth-lib/lib/hash").keccak256;
const Bytes = require("eth-lib/lib/bytes");

const swarmHashBlock = (length, data) =>
  keccak(Bytes.flatten([
    Bytes.reverse(Bytes.pad(6, Bytes.fromNumber(length))),
    "0x0000",
    data]));

const swarmHash = (data) => {
  const length = Bytes.length(data);

  if (length <= 4096) {
    return swarmHashBlock(length, data);
  }

  let maxSize = 4096;
  while ((maxSize * (4096 / 32)) < length) {
    maxSize *= (4096 / 32);
  }

  let innerNodes = [];
  for (let i = 0; i < length; i += maxSize) {
    const size = (maxSize < (length - i)) ? maxSize : (length - i);
    innerNodes.push(swarmHash(Bytes.slice(data, i, i + size)));
  }

  return swarmHashBlock(length, Bytes.flatten(innerNodes));
};

module.exports = swarmHash;
