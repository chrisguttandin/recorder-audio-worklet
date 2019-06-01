import { TNativeAudioWorkletNodeOptions } from 'standardized-audio-context';
import { TFixedOptions } from './fixed-options';

export type TNativeRecorderAudioWorkletNodeOptions = Omit<TNativeAudioWorkletNodeOptions, TFixedOptions>;
