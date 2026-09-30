import type {RawData} from "ws";

export const parseClientMessage = (messageData: RawData): unknown => {
    let parsedData: unknown = null

    try {
        parsedData = JSON.parse(messageData.toString());
    } catch (error) {
        console.error(`Unable to parse message data: ${messageData.toString()}`);
    }

    return parsedData;
}