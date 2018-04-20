import { IAudioWorkletNodeConstructor, INativeAudioWorkletNodeConstructor } from 'standardized-audio-context';
import { TNativeRecorderAudioWorkletNodeOptions } from './native-recorder-audio-worklet-node-options';
import { TRecorderAudioWorkletNodeOptions } from './recorder-audio-worklet-node-options';

export type TAnyRecorderAudioWorkletNodeOptions<T extends IAudioWorkletNodeConstructor | INativeAudioWorkletNodeConstructor> =
    T extends IAudioWorkletNodeConstructor ?
        TRecorderAudioWorkletNodeOptions :
        TNativeRecorderAudioWorkletNodeOptions;
