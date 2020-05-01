import { handleQueueCreation } from "../queue/createQueue";
import { CommandModule } from "../commands";
import { handleBumpQueue } from "../queue/bumpQueue";
import { handleQueuePublishing } from "../queue/publishQueue";
import { handleHelper } from "../queue/helper";
import { handleTerminate } from "../queue/terminateQueue";
import { handleGetCode } from "../queue/getCode";
import { handleGetQueueLink } from "../queue/getQueueLink";
import { handleLeaveQueue } from "../queue/leaveQueue";
import { handleForceNext } from "../queue/forceNextOnQueue";

let cmdModule: CommandModule = {
    name: "queue",
    prefix: "dokyu",
    commands: [
        {
            scope: ["create"],
            argNb: 1,
            handler: handleQueueCreation,
            stopOnArgMissmatch: false,
        },
        {
            scope: ["done"],
            argNb: 0,
            handler: handleBumpQueue,
            stopOnArgMissmatch: false,
        },
        {
            scope: ["publish"],
            argNb: 0,
            handler: handleQueuePublishing,
            stopOnArgMissmatch: false,
        },
        {
            scope: ["close"],
            argNb: 0,
            handler: handleTerminate,
            stopOnArgMissmatch: false,
        },
        {
            scope: ["get"],
            argNb: 0,
            handler: handleGetCode,
            stopOnArgMissmatch: false,
        },
        {
            scope: ["aled"],
            argNb: 0,
            handler: handleHelper,
            stopOnArgMissmatch: false,
        },
        {
            scope: ["list"],
            argNb: 0,
            handler: handleGetQueueLink,
            stopOnArgMissmatch: false,
        },
        {
            scope: ["leave"],
            argNb: 0,
            handler: handleLeaveQueue,
            stopOnArgMissmatch: false,
        },
        {
            scope: ["force"],
            argNb: 0,
            handler: handleForceNext,
            stopOnArgMissmatch: false,
        },
        {
            scope: [""],
            argNb: 0,
            handler: handleHelper,
            stopOnArgMissmatch: false,
        },
    ],
};

export default cmdModule;
