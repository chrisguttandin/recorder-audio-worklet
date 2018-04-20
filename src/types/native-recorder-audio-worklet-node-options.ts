import { TNativeAudioWorkletNodeOptions } from 'standardized-audio-context';
import { TFixedOptions } from './fixed-options';

export type TNativeRecorderAudioWorkletNodeOptions = {

    [ P in Exclude<keyof TNativeAudioWorkletNodeOptions, TFixedOptions> ]: TNativeAudioWorkletNodeOptions[P];

};
