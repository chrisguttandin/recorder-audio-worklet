import { IAudioWorkletNodeOptions, TAnyContext, TContext, TNativeAudioWorkletNodeOptions } from 'standardized-audio-context';

export type TAnyAudioWorkletNodeOptions<T extends TAnyContext> = T extends TContext
    ? IAudioWorkletNodeOptions
    : TNativeAudioWorkletNodeOptions;
