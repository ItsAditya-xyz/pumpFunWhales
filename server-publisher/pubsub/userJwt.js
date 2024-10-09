const base64url = require("base64url");
const { addHours } = require("date-fns");
const { v5: uuid } = require("uuid");
const { generateUserNKeys, getNKeysFromSeed } = require("./nkeys");

const jwtExpirationHours = 2;

function createAppJwt(
  developerSeed,
  expirationDate = addHours(new Date(), jwtExpirationHours)
) {
  const { seed: userSeed } = generateUserNKeys();
  const jwt = generateUserJwt({ userSeed, developerSeed, expirationDate });
  const computedJwt = computeJwt(jwt, userSeed);
  return computedJwt;
}

function generateUserJwt({
  userSeed,
  developerSeed,
  expirationDate,
}) {
  const user = getNKeysFromSeed(userSeed);
  const developer = getNKeysFromSeed(developerSeed);

  const payload = {
    jti: getJti(),
    iat: getIat(),
    // exp: getExp(expirationDate), optionally, expire
    iss: developer.getPublicKey(),
    name: "developer",
    sub: user.getPublicKey(),
    nats: getNatsConfig(),
  };

  const jwt = signJwt(payload, developer);

  return jwt;
}

function getExp(expirationDate) {
  return Math.round(expirationDate.getTime() / 1000);
}

function getJti() {
  return uuid("localhost", uuid.URL).toString();
}

function getIat() {
  return Math.round(Date.now() / 1000);
}

function signJwt(payload, keyPair) {
  const header = {
    typ: "JWT",
    alg: "ed25519-nkey",
  };

  const jwtBase =
    base64url.encode(JSON.stringify(header)) +
    "." +
    base64url.encode(JSON.stringify(payload));
  const sigBase64Url = base64url.encode(
    Buffer.from(keyPair.sign(Buffer.from(jwtBase)))
  );
  const jwt = jwtBase + "." + sigBase64Url;

  return jwt;
}

function getNatsConfig() {
  return {
    pub: {},
    sub: {},
    subs: -1,
    data: -1,
    payload: -1,
    type: "user",
    version: 2,
  };
}

function computeJwt(jwt, userNkeySeed) {
  return `-----BEGIN NATS USER JWT-----
  ${jwt}
  ------END NATS USER JWT------

  ************************* IMPORTANT *************************
  NKEY Seed printed below can be used to sign and prove identity.
  NKEYs are sensitive and should be treated as secrets.

  -----BEGIN USER NKEY SEED-----
  ${userNkeySeed}
  ------END USER NKEY SEED------

  *************************************************************`;
}

module.exports = {
  jwtExpirationHours,
  createAppJwt,
  computeJwt
};