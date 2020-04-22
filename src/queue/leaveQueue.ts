import { ReplyError } from "../ReplyError";
import { Db, DbQueue, State } from "./queue.db";
import * as discord from "discord.js";
import * as assert from "assert";
import { generateMessage } from "./generate";

export async function handleLeaveQueue(
    msg: discord.Message | discord.PartialMessage,
    _splitMsg: string[]
) {
    let queue: DbQueue;

    try {
        queue = await Db.findOneAndUpdate(
            { "nextUsers.id": msg.author.id },
            { $pull: { nextUsers: { id: msg.author.id } } },
            { new: true }
        );
        assert(queue, "Queue not found");
    } catch (err) {
        throw new ReplyError(
            "Je n'ai pas trouvé de liste d'attente que vous pouviez quitter.",
            err
        );
    }
    let channel = (await msg.client.channels.fetch(queue.channelId)) as discord.TextChannel;
    let annoncement = await channel.messages.fetch(queue.messageId);
    Promise.all([
        annoncement.edit(generateMessage(queue.creator.tag, queue.nextUsers, queue.currentUser)),
        msg.channel.send(
            `🟢 ${msg.author.username}, je vous ai retiré de la liste d'attente de ${queue.creator.tag}.`
        ),
    ]);
}
