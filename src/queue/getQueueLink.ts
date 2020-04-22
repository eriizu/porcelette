import { ReplyDm } from "./../ReplyDm";
import { ReplyError } from "../ReplyError";
import { Db, DbQueue, State } from "./queue.db";
import * as discord from "discord.js";
import * as assert from "assert";
import { generateMessage } from "./generate";

export async function handleGetQueueLink(
    msg: discord.Message | discord.PartialMessage,
    _splitMsg: string[]
) {
    let queues: DbQueue[];
    try {
        queues = await Db.find({ state: State.running, guildId: msg.guild.id });
    } catch (err) {
        throw new ReplyError(
            "Je n'ai pas réussi à trouver de listes d'attente. Il a l'air de s'agir d'un problème de base de données.",
            err
        );
    }
    if (!queues || !queues.length) {
        msg.channel.send("Je n'ai pas trouvé de listes d'attente actives.");
    }

    let builder: string[] = ["Les listes d'attentes actuellement actives sont les suivantes :"];
    queues.forEach((qu) => {
        builder.push(
            `${qu.creator.tag} :`,
            "https://discordapp.com/channels/" +
                msg.guild.id +
                "/" +
                qu.channelId +
                "/" +
                qu.messageId,
            ``
        );
    });
    msg.channel.send(builder.join("\n"));
}
