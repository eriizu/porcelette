import { ReplyDm } from "./../ReplyDm";
import { ReplyError } from "../ReplyError";
import { Db, DbQueue, State } from "./queue.db";
import * as discord from "discord.js";
import * as assert from "assert";
import { generateMessage } from "./generate";

export async function handleBumpQueue(
    msg: discord.Message | discord.PartialMessage,
    _splitMsg: string[]
) {
    let queue: DbQueue;
    try {
        queue = await Db.findOne({ "currentUser.id": msg.author.id });
        assert(queue, "Queue not found");
    } catch (err) {
        throw new ReplyError(
            "Je n'ai pas trouvé de liste d'attente dans laquelle vous pouvez céder votre place.",
            err
        );
    }

    let channel = (await msg.client.channels.fetch(queue.channelId)) as discord.TextChannel;
    let annoncement = await channel.messages.fetch(queue.messageId);

    if (queue.nextUsers && queue.nextUsers.length) {
        queue.currentUser = queue.nextUsers.shift();

        await saveBumpedQueue(queue);

        try {
            let target = await msg.client.users.fetch(queue.currentUser.id);

            await target.send(
                `C'est votre tour ! Le dodo code de ${queue.creator.tag} est \`${queue.dodocode}\`.\n\n` +
                    "Lorsque vous avez fini sur l'Île de votre hôte, envoyez moi `dokyu!done`, et je laisserai la personne suivante passer."
            );
        } catch (err) {
            console.error(err);
            channel.send(
                `<@${queue.currentUser.id}>, envoyez-moi \`dokyu!get\` pour obtenir le dodocode !`
            );
        }
        annoncement
            .edit(generateMessage(queue.creator.tag, queue.nextUsers, queue.currentUser))
            .catch(console.error);
    } else {
        queue.currentUser.id = undefined;
        queue.currentUser.tag = undefined;
        await saveBumpedQueue(queue);
        await annoncement.edit(
            generateMessage(queue.creator.tag, queue.nextUsers, queue.currentUser)
        );

        // TODO is there something to do when the queue is empty?
    }
    msg.channel.send("C'est bon, j'ai marqué votre tour comme terminé !");
}

async function saveBumpedQueue(queue: DbQueue) {
    try {
        await queue.save();
    } catch (err) {
        throw new ReplyError(
            "Je n'ai pas réussi à faire progresser la liste d'attente en raison d'un problème avec ma base de données. Pouvez-vous retenter dans une ou deux minutes ?",
            err
        );
    }
}
