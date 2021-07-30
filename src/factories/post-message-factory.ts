import type { generateUniqueNumber as generateUniqueNumberFunction } from 'fast-unique-numbers';

export const createPostMessageFactory = (generateUniqueNumber: typeof generateUniqueNumberFunction) => {
    return (ongoingRequests: Map<number, { reject: Function; resolve: Function }>, port: MessagePort) => {
        return (message: { method: string; params?: object }, transferables: Transferable[] = []): Promise<void> => {
            return new Promise((resolve, reject) => {
                const id = generateUniqueNumber(ongoingRequests);

                ongoingRequests.set(id, { reject, resolve });

                port.postMessage({ id, ...message }, transferables);
            });
        };
    };
};
