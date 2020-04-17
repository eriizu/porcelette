import * as newCmd from "./commands/newCmd";
import * as fs from "fs";

export function loadCommands() {
    const commandFileName = fs
        .readdirSync("./dist/commands")
        .filter((file) => file.endsWith(".js"));

    let commands: newCmd.newCmd[] = [];
    for (const filename of commandFileName) {
        const importedModule = require(`./commands/${filename}`);

        if (importedModule && importedModule.default) {
            let cmdMod = importedModule.default;
            if (newCmd.isCommandModule(cmdMod)) {
                console.log("Loading module: " + cmdMod.name + ".");
                commands.push(...cmdMod.commands);
            }
        }
    }
    return commands;
}
