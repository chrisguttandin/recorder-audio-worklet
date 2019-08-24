import { TNativeAudioWorkletNode } from 'standardized-audio-context';

export interface INativeRecorderAudioWorkletNode extends TNativeAudioWorkletNode {

    record (encoderPort: MessagePort): Promise<void>; // tslint:disable-line:invalid-void

    stop (): Promise<void>; // tslint:disable-line:invalid-void

}
