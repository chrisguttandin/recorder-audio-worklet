import { TState } from '../types';

export const validateState = (expectedStates: TState[], currentState: TState): void => {
    if (!expectedStates.includes(currentState)) {
        throw new Error(
            `Expected the state to be ${expectedStates
                .map((expectedState) => `"${expectedState}"`)
                .join(' or ')} but it was "${currentState}".`
        );
    }
};
