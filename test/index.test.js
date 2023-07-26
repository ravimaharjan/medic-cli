const fs = require("fs");
const { writeDebtSummary, summaryLine } = require("../src/index");
const { Readable, Writable } = require("stream");

jest.mock('fs');

describe("Test writeDebtSummary", () => {
    let map;
    let outputFile = "test_output.csv";
    let mockReadable, mockWriteStream;


    beforeEach(() => {
        map = new Map();
        mockReadable = new Readable();
        mockReadable._read = jest.fn();

        mockWriteStream = new Writable({
            write: jest.fn(),
        });

        Readable.from = jest.fn().mockReturnValue(mockReadable);

        fs.createWriteStream.mockReturnValueOnce(mockWriteStream);
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('Error on READ stream should call the correct handler with message', async () => {

        const errorHandler = jest.spyOn(console, 'error');

        const mockError = new Error('Error')

        // Act
        writeDebtSummary(map, outputFile)
        await new Promise((resolve) => setImmediate(resolve));
        mockReadable.emit('error', mockError);

        // Assert
        expect(errorHandler).toHaveBeenLastCalledWith('Error while reading from the stream:', mockError);
        errorHandler.mockReset();
    })


    it('Error on write should call correct handler', async () => {

        const errorHandler = jest.spyOn(console, 'error');

        const mockError = new Error('Error')

        // Act
        writeDebtSummary(map, outputFile)
        await new Promise((resolve) => setImmediate(resolve));
        mockWriteStream.emit('error', mockError);

        // Assert
        expect(errorHandler).toHaveBeenLastCalledWith('Error while writing to the stream:', mockError);
        errorHandler.mockReset();
    })

})


describe("Test summaryLine method", () => {
    it.each([
        [["Alex_Dan", 123], "Alex,Dan,123.00\n"],
        [["Alex_Beatrice", 50.23], "Alex,Beatrice,50.23\n"]
    ])("SummaryLine function should return the correct summary string", (keyValue, expected) => {
        const actual = summaryLine(keyValue);
        expect(actual).toEqual(expected);
    })
})