require("dotenv").config();
const WebSocket = require("ws");
const { NatsService } = require("./pubsub/nats.js");
const { createAppJwt } = require("./pubsub/userJwt.js");

const natsUrl =
  "europe-west3-gcp-dl-testnet-brokernode-frankfurt01.synternet.com";
const subject = "uniswapwhales.pumpfunwhales.track";
const publisherNatsCredsFile = createAppJwt(process.env.NATS_CREDS_KEY);

function parseSocketIOMessage(message) {
  // Check if the message starts with a digit followed by JSON
  const digitJsonMatch = message.match(/^(\d+)({.+})$/);
  if (digitJsonMatch) {
    const [, numericPrefix, jsonStr] = digitJsonMatch;
    try {
      const parsedData = JSON.parse(jsonStr);
      return {
        type: "message",
        numericPrefix: parseInt(numericPrefix),
        data: parsedData,
      };
    } catch (e) {
      throw new Error(`Failed to parse JSON: ${e}`);
    }
  }

  // Check if the message is in the format: digit[event_name, data]
  const eventMatch = message.match(/^(\d+)(\[.+\])$/);
  if (eventMatch) {
    const [, numericPrefix, jsonStr] = eventMatch;
    try {
      const parsedData = JSON.parse(jsonStr);
      return {
        type: "event",
        numericPrefix: parseInt(numericPrefix),
        event: parsedData[0],
        data: parsedData[1],
      };
    } catch (e) {
      throw new Error(`Failed to parse JSON: ${e}`);
    }
  }

  // If it doesn't match any known format, return the message as is
  return {
    type: "unknown",
    data: message,
  };
}

async function main() {
  // Connect to the NATS server with credentials
  const natsService = new NatsService({
    url: natsUrl,
    natsCredsFile: publisherNatsCredsFile,
  });

  console.log("Connecting to NATS server...");
  await natsService.waitForConnection();
  console.log("Connected to NATS server.");

  const websocketUri = process.env.WEBSOCKET_URI;

  const socket = new WebSocket(websocketUri);

  let pingInterval = 25000; // Default, will be updated from server message
  let pingTimer;

  function startPingPong() {
    if (pingTimer) clearInterval(pingTimer);
    pingTimer = setInterval(() => {
      socket.send("3"); // Send a ping (3 is the Socket.IO ping message)
      console.log("Ping sent");
    }, pingInterval);
  }

  socket.on("open", () => {
    console.log(`Connected to ${websocketUri}`);

    // Send initial message with number 40
    const initialMessage = "40";
    socket.send(initialMessage);
    console.log(`Sent initial message: ${initialMessage}`);

    startPingPong();
  });

  socket.on("message", (message) => {
    const parsedMessage = parseSocketIOMessage(message.toString());

    if (
      parsedMessage.type === "event" &&
      parsedMessage.event === "tradeCreated"
    ) {
      const solAmount = parsedMessage.data.sol_amount / 1e9;

      if (solAmount > 1) {
        //console.log(`${parsedMessage.data.user} bought ${solAmount.toFixed(2)} SOL of ${parsedMessage.data.name}`);

        // Publish the entire parsed message to NATS
        natsService.publishJSON(subject, parsedMessage);
        console.log(`sent message`);
      }
    }

    if (parsedMessage.type === "message" && parsedMessage.data.pingInterval) {
      pingInterval = parsedMessage.data.pingInterval;
      console.log(`Updating ping interval to ${pingInterval}ms`);
      startPingPong();
    }
  });

  socket.on("close", () => {
    console.log("WebSocket connection closed");
    if (pingTimer) clearInterval(pingTimer);
    // Try to reconnect after 5 seconds
    setTimeout(() => {
      console.log("Reconnecting...");
      socket.connect();
    }, 2000);
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
