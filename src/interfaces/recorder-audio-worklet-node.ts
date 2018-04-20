import { IAudioWorkletNode } from 'standardized-audio-context';

export interface IRecorderAudioWorkletNode extends IAudioWorkletNode {

    record (encoderPort: MessagePort): Promise<void>;

    stop (): Promise<void>;

}
