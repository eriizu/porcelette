import { ReplyError } from "../ReplyError";
import { Db, DbQueue, State } from "./queue.db";
import * as discord from "discord.js";
import * as assert from "assert";
import { generateMessage } from "./generate";
import { saveBumpedQueue } from "./bumpQueue";

export async function handleForceNext(
    msg: discord.Message | discord.PartialMessage,
    _splitMsg: string[]
) {
    let queue: DbQueue;
    try {
        queue = await Db.findOne({ "creator.id": msg.author.id, state: State.running });
        assert(queue, "Queue not found");
    } catch (err) {
        throw new ReplyError(
            "Je n'ai pas trouvé de liste d'attente active dont vous êtes à l'origine.",
            err
        );
    }

    if (!queue.currentUser || !queue.currentUser.id) {
        throw new ReplyError(
            "Personne n'est actuellement entrain de passer.",
            "Cannot force on empty queue."
        );
    }
    let previousUser = await msg.client.users.fetch(queue.currentUser.id);
    previousUser
        .send(
            "Votre tour a été interrompu par le créateur de la file. Il est probable que vous ayez oublié de faire `dokyu!done`."
        )
        .catch(console.error);

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
    } else {
        queue.currentUser.id = undefined;
        queue.currentUser.tag = undefined;
        await saveBumpedQueue(queue);
        //  annoncement.edit(
        //     generateMessage(queue.creator.tag, queue.nextUsers, queue.currentUser)
        // );

        // TODO is there something to do when the queue is empty?
    }
    msg.channel
        .send("Très bien, j'ai forcé la progression de la file d'attente.")
        .catch(console.error);
    annoncement
        .edit(generateMessage(queue.creator.tag, queue.nextUsers, queue.currentUser))
        .catch(console.error);
}
