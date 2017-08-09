// Thanks https://github.com/axic/swarmhash

var keccak = require("eth-lib/lib/hash").keccak256;
var Bytes = require("eth-lib/lib/bytes");

var swarmHashBlock = function swarmHashBlock(length, data) {
  return keccak(Bytes.flatten([Bytes.reverse(Bytes.pad(6, Bytes.fromNumber(length))), "0x0000", data]));
};

var swarmHash = function swarmHash(data) {
  var length = Bytes.length(data);

  if (length <= 4096) {
    return swarmHashBlock(length, data);
  }

  var maxSize = 4096;
  while (maxSize * (4096 / 32) < length) {
    maxSize *= 4096 / 32;
  }

  var innerNodes = [];
  for (var i = 0; i < length; i += maxSize) {
    var size = maxSize < length - i ? maxSize : length - i;
    innerNodes.push(swarmHash(Bytes.slice(data, i, i + size)));
  }

  return swarmHashBlock(length, Bytes.flatten(innerNodes));
};

module.exports = swarmHash;