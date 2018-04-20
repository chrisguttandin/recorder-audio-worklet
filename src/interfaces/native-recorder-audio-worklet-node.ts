import { INativeAudioWorkletNode } from 'standardized-audio-context';

export interface INativeRecorderAudioWorkletNode extends INativeAudioWorkletNode {

    record (encoderPort: MessagePort): Promise<void>;

    stop (): Promise<void>;

}
