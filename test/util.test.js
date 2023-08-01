const { parseLine, isValidLine } = require('../src/util');

describe("Test the valid line inputs", () => {

    test("Valid line input should return correct key and value in debtMapping", () => {
        const line = "Alex,Dan,123.0";
        const key = "Alex_Dan";
        const value = 123.0

        const result = parseLine(line);
        expect(result[0]).toEqual(key)
        expect(result[1]).toEqual(value)
    })

    test('Line input with spaces should ignore the space. Correct key and value should be set', () => {
        const line = "  Alex  ,   Dan, 123.0";
        const key = "Alex_Dan";
        const value = 123.0

        const result = parseLine(line);
        expect(result[0]).toEqual(key)
        expect(result[1]).toEqual(value)
    })
})


describe("Test the invalid line inputs", () => {
    let logSpy;

    beforeEach(() => {
        logSpy = jest.spyOn(console, 'log');
    })

    afterEach(() => {
        logSpy.mockRestore();
    })

    test('Input with more than 3 elements should be considered invalid', () => {
        const line = " Alex, Dan, 123.0, Brad";
        const errorMessage = '\nA line should have exactly 3 information';

        const result = isValidLine(line);

        expect(logSpy).toHaveBeenCalledWith(errorMessage);
        expect(result).toBeFalsy();
    })

    test.skip('Input with non numeric amount invalid', () => {
        const line = " Alex, Dan, amount";
        const key = "Alex_Dan";
        const errorMessage = '\nAmount must be a valid number';

        parseLine(line,);

        expect(logSpy).toHaveBeenCalledWith(errorMessage);
        // expect(debtMapping.has(key)).toBeFalsy();
    })

    it.each([
        [", ,"],
        [" Alex, , 123.0 "],
        ["Alex, Dan, "]
    ])('Input with missing values should be considered invalid', (line) => {
        const errorMessage = '\nA line must have valid values'

        const result = isValidLine(line);

        expect(logSpy).toHaveBeenCalledWith(errorMessage);
        expect(result).toBeFalsy()
    })
})

