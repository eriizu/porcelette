import * as Command from "./commands";
import * as fs from "fs";

export function loadCommands() {
    const commandFileName = fs
        .readdirSync("./dist/commands")
        .filter((file) => file.endsWith(".js"));

    let commands: Command.Command[] = [];
    for (const filename of commandFileName) {
        const importedModule = require(`./commands/${filename}`);

        if (importedModule && importedModule.default) {
            let cmdMod = importedModule.default;
            if (Command.isCommandModule(cmdMod)) {
                console.log("Loading module: " + cmdMod.name + ".");
                commands.push(...cmdMod.commands);
            }
        }
    }
    return commands;
}
