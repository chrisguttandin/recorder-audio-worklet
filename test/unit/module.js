import { AudioContext, AudioWorkletNode } from 'standardized-audio-context';
import { addRecorderAudioWorkletModule, createRecorderAudioWorkletNode } from '../../src/module';
import { spy } from 'sinon';

describe('module', () => {

    describe('addRecorderAudioWorkletModule()', () => {

        it('should call the given function with an URL', () => {
            const addAudioWorkletModule = spy();

            addRecorderAudioWorkletModule(addAudioWorkletModule);

            expect(addAudioWorkletModule).to.have.been.calledOnce;

            const { args } = addAudioWorkletModule.getCall(0);

            expect(args).to.have.a.lengthOf(1);
            expect(args[0]).to.be.a('string');
            expect(args[0]).to.match(/^blob:/);
        });

        it('should return the return value of the given function', () => {
            const returnValue = 'a fake return value';

            expect(addRecorderAudioWorkletModule(() => returnValue)).to.equal(returnValue);
        });

    });

    describe('createRecorderAudioWorkletNode()', () => {

        const testCases = {
            'with a native AudioContext': {
                audioWorkletNodeConstructor: window.AudioWorkletNode,
                createAddAudioWorkletModule: (context) => (url) => context.audioWorklet.addModule(url),
                createContext: () => new window.AudioContext()
            },
            'with a standardized AudioContext': {
                audioWorkletNodeConstructor: AudioWorkletNode,
                createAddAudioWorkletModule: (context) => (url) => context.audioWorklet.addModule(url),
                createContext: () => new AudioContext()
            }
        };

        if (window.AudioWorkletNode === undefined) {
            delete testCases['with a native AudioContext'];
        }

        for (const [ description, { audioWorkletNodeConstructor, createAddAudioWorkletModule, createContext } ] of Object.entries(testCases)) {

            describe(`with the ${ description }`, () => {

                let context;
                let recorderAudioWorkletNode;

                afterEach(() => {
                    if (context.close !== undefined) {
                        return context.close();
                    }
                });

                beforeEach(async () => {
                    context = createContext();

                    await addRecorderAudioWorkletModule(createAddAudioWorkletModule(context));

                    recorderAudioWorkletNode = createRecorderAudioWorkletNode(audioWorkletNodeConstructor, context);
                });

                it('should return an instance of the EventTarget interface', () => {
                    expect(recorderAudioWorkletNode.addEventListener).to.be.a('function');
                    expect(recorderAudioWorkletNode.dispatchEvent).to.be.a('function');
                    expect(recorderAudioWorkletNode.removeEventListener).to.be.a('function');
                });

                it('should return an instance of the AudioNode interface', () => {
                    expect(recorderAudioWorkletNode.channelCount).to.equal(2);
                    expect(recorderAudioWorkletNode.channelCountMode).to.equal('explicit');
                    expect(recorderAudioWorkletNode.channelInterpretation).to.equal('speakers');
                    expect(recorderAudioWorkletNode.connect).to.be.a('function');
                    expect(recorderAudioWorkletNode.context).to.be.an.instanceOf(context.constructor);
                    expect(recorderAudioWorkletNode.disconnect).to.be.a('function');
                    expect(recorderAudioWorkletNode.numberOfInputs).to.equal(1);
                    expect(recorderAudioWorkletNode.numberOfOutputs).to.equal(0);
                });

                it('should return an instance of the AudioWorkletNode interface', () => {
                    expect(recorderAudioWorkletNode.onprocessorerror).to.be.null;
                    expect(recorderAudioWorkletNode.parameters).not.to.be.undefined;
                });

                it('should return an instance of the RecorderAudioWorkletNode interface', () => {
                    expect(recorderAudioWorkletNode.record).to.be.a('function');
                    expect(recorderAudioWorkletNode.stop).to.be.a('function');
                });

                describe('port', () => {

                    it('should throw an error', () => {
                        expect(() => {
                            recorderAudioWorkletNode.port;
                        }).to.throw(Error, "The port of a RecorderAudioWorkletNode can't be accessed.");
                    });

                });

                describe('record()', () => {

                    // @todo

                });

                describe('stop()', () => {

                    // @todo

                });

            });

        }

    });

});
