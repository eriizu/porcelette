import { ReplyError } from "./../ReplyError";
import { Db, DbQueue, State } from "./queue.db";
import * as discord from "discord.js";
import * as assert from "assert";

export function generateMessage(
    publisher: string,
    remaining: {
        id: string;
        tag: string;
    }[] = null,
    current: {
        id: string;
        tag: string;
    } = null
) {
    let builder: string[] = [];
    builder.push(
        "🟢 C'est parti ! J'ouvre la file d'attente pour ceux qui veulent obtenir le dodocode partagé par " +
            publisher +
            "."
    );
    if (current && current.tag) {
        builder.push(`${current.tag} est entrain de passer.`);
    }

    if (remaining && remaining.length) {
        builder.push("Les prochaines personnes à passer sont :");
        remaining.forEach((element) => {
            builder.push(`- ${element.tag}`);
        });
        builder.push("Préparez-vous !");
    }
    builder.push("");
    builder.push("Pour faire la queue, réagissez sur ce message, avec n'importe quel emote.");
    // builder.push("");
    // builder.push("Si vos messages privés sont fermés, envoyez m'en un avec n'importe quoi");
    // "Pour faire la queue, réagissez sur ce message, avec n'importe quel emote. Il n'est nécessaire de réagir qu'une seule fois. Toute suppression d'une réaction sur ce message, entrainera votre déscintription de la liste ; sans que regard soit porté aux autres éventuelles réactions en votre nom qui seraient toujours présentes.";

    return builder.join("\n");
}
