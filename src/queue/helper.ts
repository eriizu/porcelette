import { ReplyDm } from "./../ReplyDm";
import { ReplyError } from "../ReplyError";
import { Db, DbQueue, State } from "./queue.db";
import * as discord from "discord.js";
import * as assert from "assert";
import { generateMessage } from "./generate";

export async function handleAbout(
    msg: discord.Message | discord.PartialMessage,
    _splitMsg: string[]
) {
    let builder: string[] = [
        `**Dokyu, BETA**`,
        ``,
        `Le but de dokyu (contraction de "dodo" et de "queue" en anglais) est de vous aider à organiser des files d'attentes pour accèder aux îles des uns et des autres.`,
        `Pour **créer une file d'attente** : envoyez moi en **MP** \`dokyu!create\` **suivi de votre dodo code**.`,
        `Après quoi, il suffira de faire \`dokyu!publish\` dans le channel de votre choix, dans les règles du serveur sur lequel vous êtes.`,
        ``,
        `Pour accèder à l'île de quelqu'un, il suffit de mettre une réaction sur le message de file d'attente.`,
        ``,
        `Attention`,
        `- Il n'est pas possible d'attendre dans deux files en même temps, car aucun mécanisme n'est présent pour gerer les situations où votre tour arriverais en simultané dans deux files.`,
        `- Il est encore possible que vous tombiez sur des problèmes techniques ou des erreurs pas nécessairement explicites.`,
        ``,
        `Si vous remarquez un problème ou que je fais des fautes d'orthographe vous êtes encouragés à créer une *issue* ici : https://github.com/eriizu/porcelette/issues`,
        `Vous pouvez aussi contacter ma maman, Élise#9457.`,
        ``,
        `Amusez-vous bien avec Dokyu !`,
    ];

    msg.channel.send(builder.join("\n"));
}
export async function handleHelper(
    msg: discord.Message | discord.PartialMessage,
    _splitMsg: string[]
) {
    let builder: string[] = [
        `**Dokyu, commandes**`,
        ``,
        `Création d'une nouvelle file d'attente :`,
        `1. **en MP** : \`dokyu!create\` suivi d'un espace et de votre dodo code. Exemple : \`dokyu!create 123A5\``,
        `2. **sur un serveur** : \`dokyu!publish\``,
        `-> C'est bon ! Les gens peuvent s'incrire sur votre liste d'attente et obtenir votre dodocode.`,
        ``,
        `Fermer une file :`,
        `1. **n'importe où** : \`dokyu!close\``,
        ``,
        `Lister les files ouvertes :`,
        `1. \`dokyu!list\``,
        ``,
        `Rejoindre une file :`,
        `1. Ajouter n'importe quelle réaction sur le message d'annonce de la file d'attente. Il s'agit du message sur lesquel on apperçoit la liste des personnes qui attendent.`,
        ``,
        `Quitter une file :`,
        `- Ça n'est pas encore faisable.`,
    ];

    msg.channel.send(builder.join("\n"));
}
