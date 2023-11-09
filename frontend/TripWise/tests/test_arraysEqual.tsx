import { arraysEqual } from '../util/arraysEqual';

describe('arraysEqual', () => {
    it('should return true for two empty arrays', () => {
        expect(arraysEqual([], [])).toBe(true);
    });

    it('should return true for two identical arrays', () => {
        expect(arraysEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
    });

    it('should return true for two arrays with the same elements in different order', () => {
        expect(arraysEqual(['a', 'b', 'c'], ['c', 'a', 'b'])).toBe(true);
    });

    it('should return false for two arrays with different lengths', () => {
        expect(arraysEqual(['a', 'b', 'c'], ['a', 'b'])).toBe(false);
    });

    it('should return false for two arrays with different elements', () => {
        expect(arraysEqual(['a', 'b', 'c'], ['a', 'd', 'c'])).toBe(false);
    });
});