import { ReplyError } from "../ReplyError";
import { Db, DbQueue, State } from "./queue.db";
import * as discord from "discord.js";
import * as assert from "assert";
import { generateMessage } from "./generate";

export async function handleQueueJoin(reaction: discord.MessageReaction, user: discord.User) {
    let userId = user.id;
    let userTag = user.tag;
    let queue: DbQueue;
    try {
        queue = await Db.findOne({ messageId: reaction.message.id, state: State.running });
        assert(queue);
    } catch (err) {
        throw new ReplyError(
            "Je n'ai pas été en mesure de trouver la file d'attente que vous avez tenté de rejoindre. Soit elle a été supprimée, soit elle n'est plus active.",
            err
        );
    }

    let creatorTag: string;
    try {
    } catch {}

    if (!queue.currentUser) {
        //TODO : send the message to the user
        queue.currentUser = { tag: userTag, id: userId };
    } else {
        queue.nextUsers.push({ tag: user.tag, id: user.id });
        reaction.message.edit(generateMessage(queue.creator.tag, queue.nextUsers));
    }

    try {
        await queue.save();
    } catch (err) {
        throw new ReplyError(
            "Je n'ai pas été en mesure de vous ajouter à la file d'attente, bien que je l'ai trouvée.",
            err
        );
    }
}
