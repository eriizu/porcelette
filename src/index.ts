import { handleQueueJoin } from "./queue/joinQueue";
import * as discord from "discord.js";

const client = new discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] });

client.on("ready", () => {
    console.log("Discord OK");
    client.user.setPresence({
        activity: { name: 'faites : "navet!aled" ou "dokyu!aled"' },
    });
});
client.login(process.env.DISCORD_BOT_TOKEN);

import * as mongoose from "mongoose";

mongoose
    .connect(process.env.MONGO_URL || `mongodb://root:example@localhost/turnip?authSource=admin`, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => {
        console.log("Mongo OK");
    })
    .catch(console.error);

import { loadCommands } from "./loadCommands";

const ncmds = loadCommands();

import * as command from "./commands";
import { isReplyError } from "./ReplyError";

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
    // if (!split.length || !split[0].startsWith("navet!")) return;
    // try {
    //     split[0] = split[0].split("!")[1] || "";
    // } catch {
    //     split[0] = "";
    // }
    let prefixSplit = split[0].split("!");
    let prefix = prefixSplit[0];
    split[0] = prefixSplit[1] || "";

    if (!prefix || !prefix.length) {
        return;
    }

    for (let cmd of ncmds) {
        if (command.predicate(prefix, split, cmd)) {
            let nbToShift = cmd.scope.length;
            while (nbToShift--) {
                split.shift();
            }
            try {
                await cmd.handler(msg, split);
            } catch (err) {
                if (isReplyError(err)) {
                    err.discharge(msg);
                } else {
                    console.error(err);
                }
            }
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
    if (user.partial) {
        try {
            await user.fetch();
        } catch {
            return;
        }
    }

    try {
        if (reaction.message.author.id == client.user.id) {
            await handleQueueJoin(reaction, user as discord.User);
        }
    } catch (err) {
        if (isReplyError(err)) {
            err.discharge(reaction.message);
        } else {
            console.error(err);
        }
    }
});
