const parseLine = require('../src/util');
let debtMapping;

beforeEach(() => {
    debtMapping = new Map();
})

afterEach(() => {
    debtMapping = null;
})

describe("Test the valid line inputs", () => {

    test("Valid line input should return correct key and value in debtMapping", () => {
        const line = "Alex,Dan,123.0";
        const key = "Alex_Dan";
        const value = 123.0

        parseLine(line, debtMapping);
        expect(debtMapping.size).toEqual(1);
        expect(debtMapping.has(key)).toBeTruthy();

        expect(debtMapping.get(key)).toEqual(value);
    })

    test('Line input with spaces should ignore the space. Correct key and value should be set', () => {
        const line = "  Alex  ,   Dan, 123.0";
        const key = "Alex_Dan";
        const value = 123.0

        parseLine(line, debtMapping);
        expect(debtMapping.size).toEqual(1);
        expect(debtMapping.has(key)).toBeTruthy();

        expect(debtMapping.get(key)).toEqual(value);
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
        const key = "Alex_Dan";
        const errorMessage = '\nA line is expected to have only 3 information';

        parseLine(line, debtMapping);

        expect(logSpy).toHaveBeenCalledWith(errorMessage);
        expect(debtMapping.size).toEqual(0);
        expect(debtMapping.has(key)).toBeFalsy();
    })

    test('Input with non numeric amount invalid', () => {
        const line = " Alex, Dan, amount";
        const key = "Alex_Dan";
        const errorMessage = '\nAmount must be a valid number';

        parseLine(line, debtMapping);

        expect(logSpy).toHaveBeenCalledWith(errorMessage);
        expect(debtMapping.size).toEqual(0);
        expect(debtMapping.has(key)).toBeFalsy();
    })

    it.each([
        [", ,"],
        [" Alex, , 123.0 "],
        ["Alex, Dan, "]
    ])('Input with missing values should be considered invalid', (line) => {
        const key = "Alex_Dan";
        const errorMessage = '\nA line must have valid values'

        parseLine(line, debtMapping);

        expect(logSpy).toHaveBeenCalledWith(errorMessage);
        expect(debtMapping.size).toEqual(0);
        expect(debtMapping.has(key)).toBeFalsy();
    })
})

describe("Test the summary values", () => {
    test('Valid Input should give the correct summary amount', () => {
        const line1 = "Alex, Dan, 45.27";
        const line2 = "Alex, Dan, 50.35";
        const line3 = "Alex, Dan, 23.00";

        const summaryDebtAmount = 118.62;
        const key = "Alex_Dan";

        parseLine(line1, debtMapping);
        parseLine(line2, debtMapping);
        parseLine(line3, debtMapping);

        expect(debtMapping.size).toEqual(1);
        expect(debtMapping.has(key)).toBeTruthy();
        expect(debtMapping.get(key)).toEqual(summaryDebtAmount);
    })

    test('Same Debtor Creditor records should be calculated correctly', () => {
        const line1 = "Alex, Dan, 11.55";
        const line2 = "Roger, Mark, 35";
        const line3 = "Alex, Dan, 23.26";
        const line4 = "Roger, Mark, 10";

        const summaryDebtAmount1 = 34.81;
        const summaryDebtAmount2 = 45;
        const key1 = "Alex_Dan";
        const key2 = "Roger_Mark";

        parseLine(line1, debtMapping);
        parseLine(line2, debtMapping);
        parseLine(line3, debtMapping);
        parseLine(line4, debtMapping);

        expect(debtMapping.size).toEqual(2);
        expect(debtMapping.has(key1)).toBeTruthy();
        expect(debtMapping.has(key2)).toBeTruthy();

        expect(debtMapping.get(key1)).toEqual(summaryDebtAmount1);
        expect(debtMapping.get(key2)).toEqual(summaryDebtAmount2);
    })

    test('Same person as Debitor and Creditor to another person is calculated separately', () => {

        // Here Alex Owes 20.00 and 100.26 to Dan. Whereas Dan ownes 50 to Alex. 
        // But we need do not need to subtract the debit amount from the credit amount even
        // if the person involved are same.

        // The out of the processing should be separate results for Alex as a debitor to Dan
        // And Dan as debitor to Alex.

        const line1 = "Alex, Dan, 20.00";
        const line2 = "Dan, Alex, 50";
        const line3 = "Alex, Dan, 100.26";

        const summaryDebtAmount1 = 120.26;
        const summaryDebtAmount2 = 50;
        const key1 = "Alex_Dan";
        const key2 = "Dan_Alex";

        parseLine(line1, debtMapping);
        parseLine(line2, debtMapping);
        parseLine(line3, debtMapping);

        expect(debtMapping.size).toEqual(2);
        expect(debtMapping.has(key1)).toBeTruthy();
        expect(debtMapping.has(key2)).toBeTruthy();

        expect(debtMapping.get(key1)).toEqual(summaryDebtAmount1);
        expect(debtMapping.get(key2)).toEqual(summaryDebtAmount2);
    })
})