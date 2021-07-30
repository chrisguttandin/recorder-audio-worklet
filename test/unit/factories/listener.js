import { createListener } from '../../../src/factories/listener';
import { spy } from 'sinon';

describe('createListener()', () => {
    it('should be a function', () => {
        expect(createListener).to.be.a('function');
    });

    it('should return a function', () => {
        expect(createListener(new Map())).to.be.a('function');
    });
});

describe('listener', () => {
    let listener;
    let ongoingRequests;
    let reject;
    let resolve;

    beforeEach(() => {
        reject = 'a fake reject function';
        resolve = 'a fake resolve function';
        ongoingRequests = new Map([[34, { reject, resolve }]]);

        listener = createListener(ongoingRequests);
    });

    describe('with an error message', () => {
        let message;

        beforeEach(() => {
            message = 'a fake message';
        });

        describe('without an ongoing request', () => {
            it('should not modify the ongoing requests', () => {
                listener({ data: { error: { message }, id: 17 } });

                expect(Array.from(ongoingRequests.entries())).to.deep.equal([[34, { reject, resolve }]]);
            });
        });

        describe('with an ongoing request', () => {
            let rejectSpy;

            beforeEach(() => {
                rejectSpy = spy();

                ongoingRequests.set(17, { reject: rejectSpy, resolve });
            });

            it('should reject the pending promise', () => {
                listener({ data: { error: { message }, id: 17 } });

                const [err] = rejectSpy.getCall(0).args;

                expect(err).to.be.an.instanceOf(Error);
                expect(err.message).to.equal(message);

                expect(rejectSpy).to.have.been.calledOnce.and.calledWithExactly(err);
            });

            it('should remove the request from the ongoing requests', () => {
                listener({ data: { error: { message }, id: 17 } });

                expect(Array.from(ongoingRequests.entries())).to.deep.equal([[34, { reject, resolve }]]);
            });
        });
    });

    describe('with a result message', () => {
        let result;

        beforeEach(() => {
            result = 'a fake result';
        });

        describe('without an ongoing request', () => {
            it('should not modify the ongoing requests', () => {
                listener({ data: { id: 17, result } });

                expect(Array.from(ongoingRequests.entries())).to.deep.equal([[34, { reject, resolve }]]);
            });
        });

        describe('with an ongoing request', () => {
            let resolveSpy;

            beforeEach(() => {
                resolveSpy = spy();

                ongoingRequests.set(17, { reject, resolve: resolveSpy });
            });

            it('should reject the resolve promise', () => {
                listener({ data: { id: 17, result } });

                expect(resolveSpy).to.have.been.calledOnce.and.calledWithExactly(result);
            });

            it('should remove the request from the ongoing requests', () => {
                listener({ data: { id: 17, result } });

                expect(Array.from(ongoingRequests.entries())).to.deep.equal([[34, { reject, resolve }]]);
            });
        });
    });
});
