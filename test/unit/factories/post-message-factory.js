import { beforeEach, describe, expect, it } from 'vitest';
import { spy, stub } from 'sinon';
import { createPostMessageFactory } from '../../../src/factories/post-message-factory';

describe('createPostMessageFactory()', () => {
    it('should be a function', () => {
        expect(createPostMessageFactory).to.be.a('function');
    });

    it('should return a function', () => {
        expect(createPostMessageFactory(() => {})).to.be.a('function');
    });
});

describe('createPostMessage()', () => {
    let createPostMessage;

    beforeEach(() => {
        createPostMessage = createPostMessageFactory(() => {});
    });

    it('should return a function', () => {
        expect(createPostMessage(new Map(), { postMessage() {} })).to.be.a('function');
    });
});

describe('postMessage()', () => {
    let generateUniqueNumber;
    let ongoingRequests;
    let port;
    let postMessage;

    beforeEach(() => {
        ongoingRequests = new Map();
        generateUniqueNumber = stub();
        port = { postMessage: spy() };

        postMessage = createPostMessageFactory(generateUniqueNumber)(ongoingRequests, port);

        generateUniqueNumber.returns(32);
    });

    it('should return a promise', () => {
        expect(postMessage({ a: ['fake', 'message'] })).to.be.an.instanceOf(Promise);
    });

    it('should generate a unique number', () => {
        postMessage({ a: ['fake', 'message'] });

        expect(generateUniqueNumber).to.have.been.calledOnce.and.calledWithExactly(ongoingRequests);
    });

    it('should add the request to the ongoing requests', () => {
        postMessage({ a: ['fake', 'message'] });

        const { reject, resolve } = ongoingRequests.get(32);

        expect(reject).to.be.a('function');
        expect(resolve).to.be.a('function');
        expect(Array.from(ongoingRequests.entries())).to.deep.equal([[32, { reject, resolve }]]);
    });

    it('should send the message', () => {
        postMessage({ a: ['fake', 'message'] }, ['a', 'fake', 'array', 'of', 'transferables']);

        expect(port.postMessage).to.have.been.calledOnce.and.calledWithExactly({ a: ['fake', 'message'], id: 32 }, [
            'a',
            'fake',
            'array',
            'of',
            'transferables'
        ]);
    });
});
