import { ReplyDm } from "./../ReplyDm";
import { ReplyError } from "../ReplyError";
import { Db, DbQueue, State } from "./queue.db";
import * as discord from "discord.js";
import * as assert from "assert";
import { generateMessage } from "./generate";

export async function handleTerminate(
    msg: discord.Message | discord.PartialMessage,
    _splitMsg: string[]
) {
    await terminate(msg.author.id, msg.client);

    msg.channel.send("🟢 J'ai fermé la file d'attente !");
}

export async function terminate(authorid: string, client: discord.Client) {
    let queues: DbQueue[];
    try {
        queues = await Db.find({
            "creator.id": authorid,
            state: { $not: { $eq: State.finished } },
        });
        assert(queues.length != 0, "No queues to update");
        let res = await Db.updateMany(
            {
                "creator.id": authorid,
                state: { $not: { $eq: State.finished } },
            },
            {
                state: State.finished,
                $unset: {
                    currentUser: 1,
                    nextUsers: 1,
                },
            }
        );
        assert(res.nModified != 0);
    } catch (err) {
        throw new ReplyError("Je n'ai pas trouvé de liste à marquer comme terminée", err);
    }

    queues.forEach(async (q) => {
        try {
            let channel = (await client.channels.fetch(q.channelId)) as discord.TextChannel;
            let annoncement = await channel.messages.fetch(q.messageId);

            await annoncement.edit(
                `Cette file d'attente de ${q.creator.tag} est maintenant close.`
            );
        } catch (err) {
            console.error("editing closed queue" + err);
        }
    });

    return queues;
}
