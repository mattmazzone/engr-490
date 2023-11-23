import { expect } from 'chai';
import { arraysEqual } from '../util/arraysEqual';

describe('arraysEqual', () => {
    it('should return true for two empty arrays', () => {
        expect(arraysEqual([], [])).to.be.true;
    });

    it('should return true for two identical arrays', () => {
        expect(arraysEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).to.be.true;
    });

    it('should return true for two arrays with the same elements in different order', () => {
        expect(arraysEqual(['a', 'b', 'c'], ['c', 'a', 'b'])).to.be.true;
    });

    it('should return false for two arrays with different lengths', () => {
        expect(arraysEqual(['a', 'b', 'c'], ['a', 'b'])).to.be.false;
    });

    it('should return false for two arrays with different elements', () => {
        expect(arraysEqual(['a', 'b', 'c'], ['a', 'd', 'c'])).to.be.false;
    });
});
