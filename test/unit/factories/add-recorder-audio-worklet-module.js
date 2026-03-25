import { beforeEach, describe, expect, it, vi } from 'vitest';
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
        addAudioWorkletModule = vi.fn();
        blobConstructorSpy = vi.fn();
        blobConstructor = class {
            constructor(...args) {
                blobConstructorSpy(...args);

                blob = this; // eslint-disable-line unicorn/no-this-assignment
            }
        };
        url = 'a fake url';
        urlConstructor = {
            createObjectURL: vi.fn(),
            revokeObjectURL: vi.fn()
        };
        worklet = 'a fake worklet';

        addRecorderAudioWorkletModule = createAddRecorderAudioWorkletModule(blobConstructor, urlConstructor, worklet);

        urlConstructor.createObjectURL.mockReturnValue(url);
    });

    it('should create a Blob', () => {
        addRecorderAudioWorkletModule(addAudioWorkletModule);

        expect(blobConstructorSpy).to.have.been.calledOnce.and.calledWith([worklet], {
            type: 'application/javascript; charset=utf-8'
        });
    });

    it('should create a URL', () => {
        addRecorderAudioWorkletModule(addAudioWorkletModule);

        expect(urlConstructor.createObjectURL).to.have.been.calledOnce.and.calledWith(blob);
    });

    it('should call addAudioWorkletModule()', () => {
        addRecorderAudioWorkletModule(addAudioWorkletModule);

        expect(addAudioWorkletModule).to.have.been.calledOnce.and.calledWith(url);
    });

    it('should revoke the URL', async () => {
        await addRecorderAudioWorkletModule(addAudioWorkletModule);

        expect(urlConstructor.revokeObjectURL).to.have.been.calledOnce.and.calledWith(url);
    });

    it('should return a promise', () => {
        expect(addRecorderAudioWorkletModule(addAudioWorkletModule)).to.be.an.instanceOf(Promise);
    });
});
