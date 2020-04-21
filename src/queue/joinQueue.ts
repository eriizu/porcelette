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
        queue = await Db.findOne({
            messageId: reaction.message.id,
            state: State.running,
            "currentUser.id": { $not: { $eq: userId } },
            "nextUsers.id": { $not: { $eq: userId } },
        });
        assert(queue, "No queue to join.");
    } catch (err) {
        console.error(err);
        return;
        // throw new ReplyError(
        //     "Je n'ai pas été en mesure de trouver la file d'attente que vous avez tenté de rejoindre. Soit elle a été supprimée, soit elle n'est plus active.",
        //     err
        // );
    }

    // Would likely never occur.
    try {
        let res = await Db.countDocuments({
            $or: [{ "currentUser.id": { $eq: userId } }, { "nextUsers.id": { $eq: userId } }],
        });
        assert(res === 0, "User already waiting in a queue.");
    } catch (err) {
        throw new ReplyError(
            user.username +
                ", il n'est pas encore possible de participer à plusieurs files d'attentes en même temps.",
            err
        );
    }

    if (!queue.currentUser.id) {
        // TODO : send the message to the user
        user.send(
            `C'est déjà votre tour ! Le dodo code de ${queue.creator.tag} est \`${queue.dodocode}\`.\n` +
                "Lorsque vous avez fini sur l'Île de votre hôte, envoyez moi `dokyu!done`, et je laisserai la personne suivante passer."
        ).catch(console.error);

        queue.currentUser = { tag: userTag, id: userId };
        reaction.message
            .edit(generateMessage(queue.creator.tag, queue.nextUsers, queue.currentUser))
            .catch(console.error);
    } else {
        queue.nextUsers.push({ tag: user.tag, id: user.id });
        reaction.message
            .edit(generateMessage(queue.creator.tag, queue.nextUsers, queue.currentUser))
            .catch(console.error);
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
