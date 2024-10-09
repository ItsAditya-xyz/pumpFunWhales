const { connect, credsAuthenticator, jwtAuthenticator } = require("nats");

class NatsService {
    constructor(config) {
        this.config = config;
        this.nats = null;
        this.handlers = new Map();
        this.subscriptions = [];
        this.connectionPromise = this.initConnection();
    }

    async initConnection() {
        const authenticator = this.getAuthenticator(this.config);
        if (!authenticator) {
            throw new Error("No credentials provided.");
        }

        this.nats = await connect({
            servers: this.config.url,
            authenticator: authenticator,
        });
    }

    async waitForConnection() {
        await this.connectionPromise;
    }

    getAuthenticator(config) {
        if (config.userCredsJWT && config.userCredsSeed) {
            return jwtAuthenticator(
                config.userCredsJWT,
                new TextEncoder().encode(config.userCredsSeed)
            );
        } else if (config.natsCredsFile) {
            return credsAuthenticator(new TextEncoder().encode(config.natsCredsFile));
        } else {
            return undefined;
        }
    }

    addHandler(subject, handler) {
        if (this.handlers.has(subject)) {
            throw new Error(`Handler for subject "${subject}" already exists.`);
        }
        this.handlers.set(subject, handler);
    }

    async serve() {
        if (!this.nats) {
            throw new Error("NATS connection not initialized");
        }

        for (const [subject, handler] of this.handlers.entries()) {
            const subscription = this.nats.subscribe(subject, {
                callback: async (err, msg) => {
                    if (err) {
                        console.error("Error in subscription:", err);
                        return;
                    }
                    await handler(msg.data);
                },
            });
            this.subscriptions.push(subscription);
        }
    }

    async close() {
        await this.nats?.close();
    }

    async publish(subject, data) {
        if (!this.nats) {
            throw new Error("NATS connection not initialized");
        }
        await this.nats.publish(subject, data);
    }

    async publishJSON(subject, data) {
        const jsonData = new TextEncoder().encode(JSON.stringify(data));
        await this.publish(subject, jsonData);
    }
}

module.exports = { NatsService };