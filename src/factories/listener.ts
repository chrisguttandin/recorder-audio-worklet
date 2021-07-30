import type { IWorkerEvent } from 'broker-factory';
import type { IWorkerErrorMessage, IWorkerResultMessage } from 'worker-factory';

export const createListener = (ongoingRequests: Map<number, { reject: Function; resolve: Function }>) => {
    return ({ data: message }: IWorkerEvent) => {
        const { id } = message;

        if (id !== null) {
            const ongoingRequest = ongoingRequests.get(id);

            if (ongoingRequest !== undefined) {
                const { reject, resolve } = ongoingRequest;

                ongoingRequests.delete(id);

                if ((<IWorkerErrorMessage>message).error === undefined) {
                    resolve((<IWorkerResultMessage>message).result);
                } else {
                    reject(new Error((<IWorkerErrorMessage>message).error.message));
                }
            }
        }
    };
};
