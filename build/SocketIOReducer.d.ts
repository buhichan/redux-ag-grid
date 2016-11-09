/**
 * Created by YS on 2016/11/4.
 */
import { Dispatch } from "redux";
import * as socketio from "socket.io-client";
export interface ChangeEventPayload {
    id: string;
    changes: {
        key: string;
        value: any;
    }[];
}
export declare function SocketIOReducerFactory(io: typeof socketio, url: string, mapModelNameToStoredPath: (modelName: string) => string[], dispatch: Dispatch<any>, eventList?: string[], id?: (any) => string): (rootState: any, action: any) => any;
