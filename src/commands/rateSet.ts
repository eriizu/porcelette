import * as discord from "discord.js";
import * as moment from "moment-timezone";
import * as users from "../users";
import * as rates from "../rates";
import * as assert from "assert";
import { cbWithUser } from "./cbWithUser";
import { CommandModule } from "../commands";

async function setRate(
    kind: rates.Kind,
    msg: discord.Message | discord.PartialMessage,
    splitMsg: string[],
    user: users.DbUser
) {
    try {
        assert(msg.guild);
        assert(msg.guild.id);
    } catch {
        msg.channel.send(
            "Il me semble que nous sommes en messages privés, or je différencie les cours du navet en fonction du serveur depuis lequel vous me parlez."
        );
        return;
    }

    let price = parseInt(splitMsg[0]);
    if (isNaN(price) || price < 0) {
        msg.channel.send("Le prix doit être un nombre entier strictement positif.");
        return;
    }

    let now = moment().tz(user.timezone).toDate();
    let delRes = await rates.Db.deleteMany({
        user: user._id,
        guildId: msg.guild.id,
        from: { $lte: now },
        to: { $gte: now },
    });
    if (delRes && delRes.deletedCount) {
        msg.channel.send(
            `J'ai supprimé ${delRes.deletedCount} valeure(s) rapportées sur la même période afin de ne pas avoir de doublons.`
        );
    }
    try {
        await rates.Db.add(user, msg.guild.id, parseInt(splitMsg[0]), kind);

        if (kind == rates.Kind.buying) {
            msg.channel.send(
                "🟢 C'est noté ! L'achat initial de navet chez vous se fait à " +
                    splitMsg[0] +
                    " clo."
            );
        } else {
            msg.channel.send(
                "🟢 C'est noté: votre magasin rachette les navets à " + splitMsg[0] + " clo."
            );
        }
    } catch (err) {
        msg.channel.send(err.message);
    }
}

let cmdModule: CommandModule = {
    name: "rate",
    commands: [
        {
            scope: ["sell"],
            argNb: 0,
            handler: cbWithUser.bind(null, setRate.bind(null, rates.Kind.selling)),
            stopOnArgMissmatch: false,
        },
        {
            scope: ["buy"],
            argNb: 0,
            handler: cbWithUser.bind(null, setRate.bind(null, rates.Kind.buying)),
            stopOnArgMissmatch: false,
        },
    ],
};

export default cmdModule;

export const setSellingRate = cbWithUser.bind(null, setRate.bind(null, rates.Kind.selling));
export const setBuyingRate = cbWithUser.bind(null, setRate.bind(null, rates.Kind.buying));
