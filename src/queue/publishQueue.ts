import { ReplyError } from "./../ReplyError";
import { Db, DbQueue, State } from "./queue.db";
import * as discord from "discord.js";
import * as assert from "assert";
import { generateMessage } from "./generate";

export async function handleQueuePublishing(
    msg: discord.Message | discord.PartialMessage,
    splitMsg: string[]
) {
    if (!msg.guild || !msg.guild.id) {
        throw new ReplyError(
            "Vous ne pouvez pas publier une liste d'attente dans vos messages privées. Relancez cette même commande sur un serveur.",
            "Queue publishing forbidden in private messages"
        );
    }
    let queue: DbQueue;

    try {
        queue = await Db.findOne({ "creator.id": msg.author.id, state: State.unpublished });
        assert(queue);
    } catch (err) {
        throw new ReplyError(
            "Je n'ai pas réussi à trouver la file d'attente que vous vouliez publier. Soit vous n'en avez pas créé, soit il s'agit d'une erreur de ma part.",
            "Cannot find queue to publish"
        );
    }

    let queuemsg = await msg.channel.send(generateMessage(msg.author.tag));
    await markedAsPublished(queue, queuemsg, msg.channel.id);
}

export async function markedAsPublished(
    queue: DbQueue,
    message: discord.Message,
    channelId: string
) {
    queue.state = State.running;
    queue.messageId = message.id;
    queue.channelId = channelId;
    try {
        await queue.save();
    } catch (err) {
        try {
            await message.delete();
        } catch (err) {
            console.error(err);
        }
        throw new ReplyError("La publication de la liste d'attente a échoué.", err);
    }
}
