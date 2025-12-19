import { IAudioWorkletNodeOptions } from 'standardized-audio-context';
import { TFixedOptions } from './fixed-options';

export type TRecorderAudioWorkletNodeOptions = Partial<Omit<IAudioWorkletNodeOptions, TFixedOptions>>;
