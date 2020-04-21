import { ReplyError } from "./../ReplyError";
import { Db, DbQueue, State } from "./queue.db";
import * as discord from "discord.js";
import * as assert from "assert";

export async function handleGetCode(
    msg: discord.Message | discord.PartialMessage,
    _splitMsg: string[]
) {
    if (msg.guild && msg.guild.id) {
        throw new ReplyError(
            "Vous ne pouvez pas récupérer un dodo code depuis un serveur, revoyez moi ce message en privé.",
            "Get code prohibited on server"
        );
    }

    let queue: DbQueue;
    try {
        queue = await Db.findOne({ "currentUser.id": msg.author.id });
        assert(queue, "Queue not found");
    } catch (err) {
        throw new ReplyError(
            "Je n'ai pas trouvé de file d'attente dans laquelle c'est votre tour.",
            err
        );
    }

    msg.channel
        .send(
            `Le dodo code de ${queue.creator.tag} est \`${queue.dodocode}\`.\n\n` +
                "Lorsque vous avez fini sur l'Île de votre hôte, envoyez moi `dokyu!done`, et je laisserai la personne suivante passer."
        )
        .catch(console.error);
}
