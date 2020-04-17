import * as discord from "discord.js";

export interface CommandModule {
    name: string;
    commands: Command[];
}

export interface Command {
    scope: string[];
    argNb: number;
    stopOnArgMissmatch?: boolean;
    handler: (msg: discord.Message | discord.PartialMessage, splitMsg: string[]) => void;
    helper?: Function;
}

/**
 * Indicates a match between a command and the message inputed.
 */
export function predicate(split: string[], cmd: Command): boolean {
    if (split.length >= cmd.scope.length + cmd.argNb) {
        let i = 0;
        for (let toMatch of cmd.scope) {
            if (toMatch != split[i++]) return false;
        }
        return true;
    } else {
        return false;
    }
}

export function isCommand(x: any): x is Command {
    return x.scope && x.argNb !== undefined && x.handler;
}

export function isCommandModule(x: any): x is CommandModule {
    return Array.isArray(x.commands);
}
