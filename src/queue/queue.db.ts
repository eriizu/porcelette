import * as mongoose from "mongoose";

export enum State {
    unpublished = 1,
    running,
    finished,
}

export interface Queue {
    creator: {
        id: string;
        tag: string;
    };
    creatorId: string;
    dodocode?: string;
    currentUser?: {
        id: string;
        tag: string;
    };
    nextUsers?: {
        id: string;
        tag: string;
    }[];
    state: State;
    messageId?: string;
    channelId?: string;
    guildId?: string;
}

export interface DbQueue extends mongoose.Document, Queue {}

export const SchemaQueue = new mongoose.Schema({
    creator: { id: { type: String }, tag: { type: String } },
    dodocode: { type: String },
    currentUser: { id: { type: String }, tag: { type: String } },
    nextUsers: [{ id: { type: String }, tag: { type: String } }],
    state: { type: Number, default: State.unpublished },
    messageId: { type: String },
    channelId: { type: String },
    guildId: { type: String },
});

export const Db = mongoose.model<DbQueue>("queues", SchemaQueue);
