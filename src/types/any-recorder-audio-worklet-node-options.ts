import { TAnyContext, TContext } from 'standardized-audio-context';
import { TNativeRecorderAudioWorkletNodeOptions } from './native-recorder-audio-worklet-node-options';
import { TRecorderAudioWorkletNodeOptions } from './recorder-audio-worklet-node-options';

export type TAnyRecorderAudioWorkletNodeOptions<T extends TAnyContext> = T extends TContext
    ? TRecorderAudioWorkletNodeOptions
    : TNativeRecorderAudioWorkletNodeOptions;
