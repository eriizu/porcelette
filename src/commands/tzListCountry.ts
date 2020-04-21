import { CommandModule } from "../commands";
import * as discord from "discord.js";
import * as moment from "moment-timezone";

/**
 * Only lists the timezones of a specific country
 */
export async function tzListCountry(
    msg: discord.Message | discord.PartialMessage,
    splitMsg: string[]
) {
    try {
        await msg.channel.send(
            `Les fuseaux que j'ai trouvé avec le code pays (ISO à deux chiffre) "${splitMsg[0]}" sont les suivants:\n` +
                moment.tz.zonesForCountry(splitMsg[0]).join("\n")
        );
    } catch {
        try {
            let builder: string[] = ["Voici les résulats de votre recherche de fuseau horraire :"];
            moment.tz.names().forEach((element) => {
                if (element.toLowerCase().includes(splitMsg[0].toLowerCase()))
                    builder.push(element);
            });
            // await msg.channel.send(builder.join("\n"));
            msg.channel.send(
                "Car que vous m'avez envoyé n'est pas un code pays, je vais effectuer une recherche syntaxique sur les données dont je dispose.\n" +
                    "Etant donné que les résultats peuvent être très long, je vous les envoies en MP."
            );
            await msg.author.send(builder.join("\n"));
        } catch {
            msg.channel
                .send(
                    "Les résultats sont trop long pour que je vous les affiche sur Discord. Pouvez-vous préciser votre recherche ou utiliser le code à deux chiffre de votre pays ?"
                )
                .catch(console.error);
        }
    }
}

/**
 * Lists all timezones available with moment.js
 */
async function tzHelper(msg: discord.Message | discord.PartialMessage, splitMsg: string[]) {
    let builder: string[] = [
        "Re-run the same command with a search keyword.",
        " The easiest way to find your timezone is by giving me your ISO alpha-2 country code.",
        "Some examples are:",
        "- FR: France;",
        "- IE: Ireland.",
        "More codes at: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2",
    ];
    msg.channel.send(builder.join("\n")).then((msg) => {
        msg.suppressEmbeds();
    });
}

let cmdModules: CommandModule = {
    name: "timezone get",
    commands: [
        {
            scope: ["getzones"],
            argNb: 1,
            handler: tzListCountry,
            stopOnArgMissmatch: false,
        },
        {
            scope: ["getzones"],
            argNb: 0,
            handler: tzHelper,
            stopOnArgMissmatch: false,
        },
    ],
};

export default cmdModules;
