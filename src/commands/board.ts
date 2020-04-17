import { CommandModule } from "../commands";
import * as discord from "discord.js";
import * as moment from "moment-timezone";
import * as users from "../users";
import * as rates from "../rates";
import { cbWithUser } from "./cbWithUser";
import * as assert from "assert";

async function generateBoard(
    max: number,
    msg: discord.Message | discord.PartialMessage,
    ratesInEffect: rates.DbRate[],
    user: users.DbUser,
    builder: string[]
) {
    max = isNaN(max) || ratesInEffect.length < max ? ratesInEffect.length : 5;
    let remains = max != ratesInEffect.length ? ratesInEffect.length - max : 0;

    for (let i = 0; i < max; i++) {
        let rate = ratesInEffect[i];
        let islander = rate.user as users.User;
        let till = moment(rate.to).tz(user.timezone).locale("fr-fr");
        builder.push(
            `- ${rate.price} clo. chez ${islander.name} jusqu'à ${till.calendar().toLowerCase()}.`
        );
    }
    if (remains) {
        builder.push(``);
        builder.push(
            `Nombre d'entrées omises : ${remains} (faites \`navet!fullboard\` pour les voir).`
        );
    }
}

async function handler(
    max: number = NaN,
    msg: discord.Message | discord.PartialMessage,
    _splitMsg: string[],
    user: users.DbUser
) {
    try {
        assert(msg.guild);
        assert(msg.guild.id);
    } catch {
        msg.channel.send(
            "Il me semble que nous sommes en messages privés, or le tableau du prix du navet n'existe que au sein d'un serveur."
        );
        return;
    }

    let now = moment().tz(user.timezone).toDate();
    let resellRates: rates.DbRate[];
    let buyRates: rates.DbRate[];
    try {
        let resellRatesProm = rates.Db.find({
            kind: rates.Kind.selling,
            guildId: msg.guild.id,
            from: { $lte: now },
            to: { $gte: now },
        })
            .sort({
                price: -1,
            })
            .populate("user", "name")
            .exec();

        let buyRatesProm = rates.Db.find({
            kind: rates.Kind.buying,
            guildId: msg.guild.id,
            from: { $lte: now },
            to: { $gte: now },
        })
            .sort({
                price: 1,
            })
            .populate("user", "name")
            .exec();

        resellRates = await resellRatesProm;
        buyRates = await buyRatesProm;
    } catch (err) {
        console.error("Rates retrival");
        console.error(err);
        msg.channel.send("Quelque chose m'empêche de regarder le cours du navet...");
        return;
    }

    let builder: string[] = [
        `Voici le cours du navet actuel (montré tel que pour le fuseau : ${user.timezone})...`,
        ``,
    ];

    builder.push("Cours à la revente :");
    if (!resellRates || !resellRates.length) {
        builder.push(
            "- Je n'ai rien à vous afficher car il n'y a peut être eu aucun signalement ou alors tous les magasins sont clos."
        );
    } else {
        generateBoard(max, msg, resellRates, user, builder);
    }

    if (!buyRates || !buyRates.length) {
        // builder.push("Je n'ai pas de.");
    } else {
        builder.push("");
        builder.push("Cours à l'achat initial :");
        generateBoard(max, msg, buyRates, user, builder);
    }
    msg.channel.send(builder.join("\n"));
}

let cmdModule: CommandModule = {
    name: "board",
    commands: [
        {
            scope: ["board"],
            argNb: 0,
            handler: cbWithUser.bind(null, handler.bind(null, 5)),
            stopOnArgMissmatch: false,
        },
        {
            scope: ["fullboard"],
            argNb: 0,
            handler: cbWithUser.bind(null, handler.bind(null, NaN)),
            stopOnArgMissmatch: false,
        },
    ],
};

export default cmdModule;

export const board = cbWithUser.bind(null, handler.bind(null, 5));
export const fullboard = cbWithUser.bind(null, handler.bind(null, NaN));
