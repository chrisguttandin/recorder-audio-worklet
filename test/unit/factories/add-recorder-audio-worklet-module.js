import { beforeEach, describe, expect, it } from 'vitest';
import { spy, stub } from 'sinon';
import { createAddRecorderAudioWorkletModule } from '../../../src/factories/add-recorder-audio-worklet-module';

describe('createAddRecorderAudioWorkletModule()', () => {
    it('should be a function', () => {
        expect(createAddRecorderAudioWorkletModule).to.be.a('function');
    });

    it('should return a function', () => {
        expect(createAddRecorderAudioWorkletModule(() => {}, {}, 'a fake worklet')).to.be.a('function');
    });
});

describe('addRecorderAudioWorkletModule', () => {
    let addAudioWorkletModule;
    let addRecorderAudioWorkletModule;
    let blob;
    let blobConstructor;
    let blobConstructorSpy;
    let url;
    let urlConstructor;
    let worklet;

    beforeEach(() => {
        addAudioWorkletModule = spy();
        blobConstructorSpy = spy();
        blobConstructor = class {
            constructor(...args) {
                blobConstructorSpy(...args);

                blob = this; // eslint-disable-line unicorn/no-this-assignment
            }
        };
        url = 'a fake url';
        urlConstructor = {
            createObjectURL: stub(),
            revokeObjectURL: spy()
        };
        worklet = 'a fake worklet';

        addRecorderAudioWorkletModule = createAddRecorderAudioWorkletModule(blobConstructor, urlConstructor, worklet);

        urlConstructor.createObjectURL.returns(url);
    });

    it('should create a Blob', () => {
        addRecorderAudioWorkletModule(addAudioWorkletModule);

        expect(blobConstructorSpy).to.have.been.calledOnce.and.calledWithExactly([worklet], {
            type: 'application/javascript; charset=utf-8'
        });
    });

    it('should create a URL', () => {
        addRecorderAudioWorkletModule(addAudioWorkletModule);

        expect(urlConstructor.createObjectURL).to.have.been.calledOnce.and.calledWithExactly(blob);
    });

    it('should call addAudioWorkletModule()', () => {
        addRecorderAudioWorkletModule(addAudioWorkletModule);

        expect(addAudioWorkletModule).to.have.been.calledOnce.and.calledWithExactly(url);
    });

    it('should revoke the URL', async () => {
        await addRecorderAudioWorkletModule(addAudioWorkletModule);

        expect(urlConstructor.revokeObjectURL).to.have.been.calledOnce.and.calledWithExactly(url);
    });

    it('should return a promise', () => {
        expect(addRecorderAudioWorkletModule(addAudioWorkletModule)).to.be.an.instanceOf(Promise);
    });
});
