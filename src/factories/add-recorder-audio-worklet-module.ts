export const createAddRecorderAudioWorkletModule = (blobConstructor: typeof Blob, urlConstructor: typeof URL, worklet: string) => {
    return async (addAudioWorkletModule: (url: string) => Promise<void>) => {
        const blob = new blobConstructor([worklet], { type: 'application/javascript; charset=utf-8' });
        const url = urlConstructor.createObjectURL(blob);

        try {
            await addAudioWorkletModule(url);
        } finally {
            urlConstructor.revokeObjectURL(url);
        }
    };
};
