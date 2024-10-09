const { createUser, fromSeed } = require("nkeys.js");

function generateUserNKeys() {
  const user = createUser();
  const publicKey = user.getPublicKey();
  const seed = new TextDecoder().decode(user.getSeed());
  return { publicKey, seed };
}

function getNKeysFromSeed(seed) {
  return fromSeed(Buffer.from(seed));
}

module.exports = {
  generateUserNKeys,
  getNKeysFromSeed
};