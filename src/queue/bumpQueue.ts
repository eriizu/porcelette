import { ReplyError } from "../ReplyError";
import { Db, DbQueue, State } from "./queue.db";
import * as discord from "discord.js";
import * as assert from "assert";
import { generateMessage } from "./generate";

export async function handleBumpQueue(
    msg: discord.Message | discord.PartialMessage,
    splitMsg: string[]
) {
    let queue: DbQueue;
    try {
        queue = await Db.findOne({ "currentUser.id": msg.author.id });
    } catch (err) {
        throw new ReplyError(
            "Je n'ai pas trouvé de liste d'attente dans laquelle vous pouvez céder votre place.",
            err
        );
    }

    queue.currentUser = queue.nextUsers.shift();
}
