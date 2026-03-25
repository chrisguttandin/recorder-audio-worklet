/* eslint-disable max-classes-per-file */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRecorderAudioWorkletNodeFactory } from '../../../src/factories/recorder-audio-worklet-node-factory';

describe('createRecorderAudioWorkletNodeFactory()', () => {
    it('should be a function', () => {
        expect(createRecorderAudioWorkletNodeFactory).to.be.a('function');
    });

    it('should return a function', () => {
        expect(
            createRecorderAudioWorkletNodeFactory(
                () => {},
                () => {},
                () => {},
                () => {}
            )
        ).to.be.a('function');
    });
});

describe('createRecorderAudioWorkletNode()', () => {
    let audioWorkletNode;
    let audioWorkletNodeConstructor;
    let audioWorkletNodeConstructorSpy;
    let context;
    let createListener;
    let createPostMessage;
    let createRecorderAudioWorkletNode;
    let listener;
    let on;
    let ongoingRequests;
    let port;
    let recorderAudioWorkletNode;
    let subscribe;

    beforeEach(() => {
        audioWorkletNodeConstructorSpy = vi.fn();
        port = { start: vi.fn() };
        audioWorkletNodeConstructor = class {
            constructor(...args) {
                audioWorkletNodeConstructorSpy(...args);

                this.port = port;

                audioWorkletNode = this; // eslint-disable-line unicorn/no-this-assignment
            }
        };
        context = 'a fake context';
        createListener = vi.fn();
        createPostMessage = vi.fn();
        listener = 'a fake listener';
        on = vi.fn();
        subscribe = vi.fn();

        createRecorderAudioWorkletNode = createRecorderAudioWorkletNodeFactory(createListener, createPostMessage, on, () => {});

        createListener.mockReturnValue(listener);
        createPostMessage.mockImplementation((...args) => ([ongoingRequests] = args));
        on.mockReturnValue(subscribe);

        recorderAudioWorkletNode = createRecorderAudioWorkletNode(audioWorkletNodeConstructor, context, { a: 'fake', option: 'object' });
    });

    it('should create an AudioWorkletNode', () => {
        expect(audioWorkletNodeConstructorSpy).to.have.been.calledOnce.and.calledWith(context, 'recorder-audio-worklet-processor', {
            a: 'fake',
            channelCountMode: 'explicit',
            numberOfInputs: 1,
            numberOfOutputs: 0,
            option: 'object'
        });
    });

    it('should call createPostMessage()', () => {
        expect(ongoingRequests).to.be.an.instanceOf(Map);
        expect(createPostMessage).to.have.been.calledOnce.and.calledWith(ongoingRequests, port);
    });

    it('should call createListener()', () => {
        expect(createListener).to.have.been.calledOnce.and.calledWith(ongoingRequests);
    });

    it('should call on()', () => {
        expect(on).to.have.been.calledOnce.and.calledWith(port, 'message');
    });

    it('should call subscribe()', () => {
        expect(subscribe).to.have.been.calledOnce.and.calledWith(listener);
    });

    it('should call start()', () => {
        expect(port.start).to.have.been.calledOnce.and.calledWith();
    });

    it('should return an instance of the AudioWorkletNode', () => {
        expect(recorderAudioWorkletNode).to.equal(audioWorkletNode);
    });

    it('should return an instance of the RecorderAudioWorkletNode interface', () => {
        expect(recorderAudioWorkletNode.pause).to.be.a('function');
        expect(recorderAudioWorkletNode.record).to.be.a('function');
        expect(recorderAudioWorkletNode.resume).to.be.a('function');
        expect(recorderAudioWorkletNode.stop).to.be.a('function');
    });
});

describe('RecorderAudioWorkletNode', () => {
    let postMessage;
    let recorderAudioWorkletNode;
    let unsubscribe;
    let validateState;

    beforeEach(() => {
        postMessage = vi.fn();
        unsubscribe = vi.fn();
        validateState = vi.fn();

        postMessage.mockResolvedValue();

        recorderAudioWorkletNode = createRecorderAudioWorkletNodeFactory(
            () => {},
            () => postMessage,
            // eslint-disable-next-line unicorn/consistent-function-scoping
            () => () => unsubscribe,
            validateState
        )(
            class {
                constructor() {
                    this.port = { start() {} };
                }
            },
            'a fake context',
            { a: 'fake', option: 'object' }
        );
    });

    describe('port', () => {
        it('should throw an error', () => {
            expect(() => {
                recorderAudioWorkletNode.port;
            }).to.throw(Error, "The port of a RecorderAudioWorkletNode can't be accessed.");
        });
    });

    describe('pause()', () => {
        it('should call validateState()', () => {
            recorderAudioWorkletNode.pause();

            expect(validateState).to.have.been.calledOnce.and.calledWith(['recording'], 'inactive');
        });

        describe('with validateState() returning regularly', () => {
            it('should call postMessage()', () => {
                recorderAudioWorkletNode.pause();

                expect(postMessage).to.have.been.calledOnce.and.calledWith({ method: 'pause' });
            });

            it('should set the state to paused', () => {
                recorderAudioWorkletNode.pause();
                recorderAudioWorkletNode.pause();

                expect(validateState.mock.calls[1][1]).to.equal('paused');
            });

            it('should return a promise', () => {
                expect(recorderAudioWorkletNode.pause()).to.be.an.instanceOf(Promise);
            });
        });

        describe('with validateState() throwing an error', () => {
            let error;

            beforeEach(() => {
                error = new Error('a fake error');

                validateState.mockThrow(error);
            });

            it('should rethrow the errror', () => {
                const { promise, resolve } = Promise.withResolvers();

                recorderAudioWorkletNode.pause().catch((err) => {
                    expect(err).to.equal(error);

                    resolve();
                });

                return promise;
            });

            it('should not call postMessage()', () => {
                recorderAudioWorkletNode.pause().catch(() => {});

                expect(postMessage).to.have.not.been.called;
            });

            it('should not set the state to paused', () => {
                recorderAudioWorkletNode.pause().catch(() => {});
                recorderAudioWorkletNode.pause().catch(() => {});

                expect(validateState.mock.calls[1][1]).to.not.equal('paused');
            });
        });
    });

    describe('record()', () => {
        let encoderPort;

        beforeEach(() => {
            encoderPort = 'a fake encoderPort';
        });

        it('should call validateState()', () => {
            recorderAudioWorkletNode.record(encoderPort);

            expect(validateState).to.have.been.calledOnce.and.calledWith(['inactive'], 'inactive');
        });

        describe('with validateState() returning regularly', () => {
            it('should call postMessage()', () => {
                recorderAudioWorkletNode.record(encoderPort);

                expect(postMessage).to.have.been.calledOnce.and.calledWith(
                    {
                        method: 'record',
                        params: { encoderPort }
                    },
                    [encoderPort]
                );
            });

            it('should set the state to recording', () => {
                recorderAudioWorkletNode.record(encoderPort);
                recorderAudioWorkletNode.record(encoderPort);

                expect(validateState.mock.calls[1][1]).to.equal('recording');
            });

            it('should return a promise', () => {
                expect(recorderAudioWorkletNode.record(encoderPort)).to.be.an.instanceOf(Promise);
            });
        });

        describe('with validateState() throwing an error', () => {
            let error;

            beforeEach(() => {
                error = new Error('a fake error');

                validateState.mockThrow(error);
            });

            it('should rethrow the errror', () => {
                const { promise, resolve } = Promise.withResolvers();

                recorderAudioWorkletNode.record(encoderPort).catch((err) => {
                    expect(err).to.equal(error);

                    resolve();
                });

                return promise;
            });

            it('should not call postMessage()', () => {
                recorderAudioWorkletNode.record(encoderPort).catch(() => {});

                expect(postMessage).to.have.not.been.called;
            });

            it('should not set the state to recording', () => {
                recorderAudioWorkletNode.record(encoderPort).catch(() => {});
                recorderAudioWorkletNode.record(encoderPort).catch(() => {});

                expect(validateState.mock.calls[1][1]).to.not.equal('recording');
            });
        });
    });

    describe('resume()', () => {
        it('should call validateState()', () => {
            recorderAudioWorkletNode.resume();

            expect(validateState).to.have.been.calledOnce.and.calledWith(['paused'], 'inactive');
        });

        describe('with validateState() returning regularly', () => {
            it('should call postMessage()', () => {
                recorderAudioWorkletNode.resume();

                expect(postMessage).to.have.been.calledOnce.and.calledWith({ method: 'resume' });
            });

            it('should set the state to recording', () => {
                recorderAudioWorkletNode.resume();
                recorderAudioWorkletNode.resume();

                expect(validateState.mock.calls[1][1]).to.equal('recording');
            });

            it('should return a promise', () => {
                expect(recorderAudioWorkletNode.resume()).to.be.an.instanceOf(Promise);
            });
        });

        describe('with validateState() throwing an error', () => {
            let error;

            beforeEach(() => {
                error = new Error('a fake error');

                validateState.mockThrow(error);
            });

            it('should rethrow the errror', () => {
                const { promise, resolve } = Promise.withResolvers();

                recorderAudioWorkletNode.resume().catch((err) => {
                    expect(err).to.equal(error);

                    resolve();
                });

                return promise;
            });

            it('should not call postMessage()', () => {
                recorderAudioWorkletNode.resume().catch(() => {});

                expect(postMessage).to.have.not.been.called;
            });

            it('should not set the state to recording', () => {
                recorderAudioWorkletNode.resume().catch(() => {});
                recorderAudioWorkletNode.resume().catch(() => {});

                expect(validateState.mock.calls[1][1]).to.not.equal('recording');
            });
        });
    });

    describe('stop()', () => {
        it('should call validateState()', () => {
            recorderAudioWorkletNode.stop();

            expect(validateState).to.have.been.calledOnce.and.calledWith(['paused', 'recording'], 'inactive');
        });

        describe('with validateState() returning regularly', () => {
            it('should call postMessage()', () => {
                recorderAudioWorkletNode.stop();

                expect(postMessage).to.have.been.calledOnce.and.calledWith({ method: 'stop' });
            });

            it('should set the state to stopped', () => {
                recorderAudioWorkletNode.stop();
                recorderAudioWorkletNode.stop();

                expect(validateState.mock.calls[1][1]).to.equal('stopped');
            });

            it('should call unsubscribe()', async () => {
                await recorderAudioWorkletNode.stop();

                expect(unsubscribe).to.have.been.calledOnce.and.calledWith();
            });

            it('should return a promise', () => {
                expect(recorderAudioWorkletNode.stop()).to.be.an.instanceOf(Promise);
            });
        });

        describe('with validateState() throwing an error', () => {
            let error;

            beforeEach(() => {
                error = new Error('a fake error');

                validateState.mockThrow(error);
            });

            it('should rethrow the errror', () => {
                const { promise, resolve } = Promise.withResolvers();

                recorderAudioWorkletNode.stop().catch((err) => {
                    expect(err).to.equal(error);

                    resolve();
                });

                return promise;
            });

            it('should not call postMessage()', () => {
                recorderAudioWorkletNode.stop().catch(() => {});

                expect(postMessage).to.have.not.been.called;
            });

            it('should not set the state to recording', () => {
                recorderAudioWorkletNode.stop().catch(() => {});
                recorderAudioWorkletNode.stop().catch(() => {});

                expect(validateState.mock.calls[1][1]).to.not.equal('stopped');
            });

            it('should not call unsubscribe()', () => {
                recorderAudioWorkletNode.stop().catch(() => {});

                expect(unsubscribe).to.have.not.been.called;
            });
        });
    });
});
