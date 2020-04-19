import * as discord from "discord.js";

const client = new discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] });

client.on("ready", () => {
    console.log("Discord OK");
    client.user.setPresence({ activity: { name: 'faites : "navet!aled"' } });
});
client.login(process.env.DISCORD_BOT_TOKEN);

import * as mongoose from "mongoose";

mongoose
    .connect(process.env.MONGO_URL || `mongodb://root:example@localhost/turnip?authSource=admin`, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Mongo OK");
    })
    .catch(console.error);

import { loadCommands } from "./loadCommands";

const ncmds = loadCommands();

import * as command from "./commands";

client.on("message", async (msg) => {
    if (msg.partial) {
        console.log("The msg is partial.");
        try {
            msg = await msg.fetch();
        } catch (err) {
            console.log(err);
            return;
        }
    }

    let split = msg.content.split(" ");
    if (!split.length || !split[0].startsWith("navet!")) return;
    try {
        split[0] = split[0].split("!")[1] || "";
    } catch {
        split[0] = "";
    }
    for (let cmd of ncmds) {
        if (command.predicate(split, cmd)) {
            let nbToShift = cmd.scope.length;
            while (nbToShift--) {
                split.shift();
            }
            cmd.handler(msg, split);
            return;
        }
    }
});

client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.partial) {
        // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
        try {
            await reaction.fetch();
        } catch {
            return;
        }
    }
    console.log(reaction);

    if (reaction.message.author.id == client.user.id) {
        console.log("patate");
    }
});
