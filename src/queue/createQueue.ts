import { ReplyError } from "./../ReplyError";
import { Db, Queue } from "./queue.db";
import * as discord from "discord.js";

export async function handleQueueCreation(
    msg: discord.Message | discord.PartialMessage,
    splitMsg: string[]
) {
    if (msg.guild && msg.guild.id) {
        throw new ReplyError(
            "Vous ne pouvez pas creer une liste d'attente depuis un serveur. Il s'agit d'éviter de donner votre dodocode aux autres avant que ça soit leur tour.",
            "Queue creation prohibited in a channel."
        );
    }
    let dodocode = splitMsg[0];
    let userId = msg.author.id;
    await createQueue(msg.author.id, msg.author.tag, dodocode);
    msg.channel.send(
        "J'ai créé la liste d'attente en base de données. Maintenant faites `dokyu!publish` dans le canal où vous souhaitez la publier."
    );
}

// TODO: prohibit the creation of a second q if one is already running
export async function createQueue(userId: string, userTag: string, dodocode: string) {
    let newq: Partial<Queue> = {
        creator: { tag: userTag, id: userId },
        dodocode,
    };
    try {
        await Db.create(newq);
    } catch (err) {
        throw new ReplyError(
            "Je suis navrée, quelque chose m'a empêché de créer cette liste d'attente... Je vous invite à réessayer.",
            err
        );
    }
}
