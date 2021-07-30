import { validateState } from '../../../src/functions/validate-state';

describe('validateState()', () => {
    describe('with an expected state', () => {
        it('should return undefined', () => {
            expect(validateState(['expected-state'], 'expected-state')).to.be.undefined;
        });
    });

    describe('with an unexpected state', () => {
        it('should throw an error', () => {
            expect(() => {
                validateState(['expected-state'], 'unexpected-state');
            }).to.throw(Error, 'Expected the state to be "expected-state" but it was "unexpected-state".');
        });
    });
});
