import { IAudioWorkletNodeOptions } from 'standardized-audio-context';
import { TFixedOptions } from './fixed-options';

export type TRecorderAudioWorkletNodeOptions = {

    [ P in Exclude<keyof IAudioWorkletNodeOptions, TFixedOptions> ]: IAudioWorkletNodeOptions[P];

};
