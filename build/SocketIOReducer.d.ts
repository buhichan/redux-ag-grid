/**
 * Created by YS on 2016/11/4.
 */
import { Dispatch } from "redux";
import Socket = SocketIOClient.Socket;
export declare function RegisterWebSocketGridEventListeners(socket: Socket, dispatch: Dispatch<any>, eventList: string[], mapModelNameToModelPath: (modelName: string) => string[]): void;
