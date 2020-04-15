import * as discord from "discord.js";

export interface CommandModule {
    commands: newCmd[];
}

export interface newCmd {
    scope: string[];
    argNb: number;
    stopOnArgMissmatch?: boolean;
    handler: (msg: discord.Message | discord.PartialMessage, splitMsg: string[]) => void;
    helper?: Function;
}

export function isNewCmd(x: any): x is newCmd {
    return x.scope && x.argNb !== undefined && x.handler;
}
