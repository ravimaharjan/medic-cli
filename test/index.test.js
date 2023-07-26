const { writeDebtSummary, summaryLine } = require("../src/index");
const { Readable, Writable } = require("stream");

const fs = require("fs");
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
            write: jest.fn()
        });
        Readable.from = jest.fn().mockReturnValue(mockReadable);

        fs.createWriteStream.mockReturnValueOnce(mockWriteStream);
    })

    it('rejects/errors if a READ stream error occurs', async () => {
        // Arrange

        // const mockReadable = new Readable();
        // mockReadable._read = jest.fn();

        // const mockWriteStream = new Writable({
        //     write: jest.fn()
        // });

        // Readable.from = jest.fn().mockReturnValue(mockReadable);
        const errorHandler = jest.spyOn(console, 'error');

        const mockError = new Error('Error')
        // fs.createWriteStream.mockReturnValueOnce(mockWriteStream)

        // Act
        writeDebtSummary(map, outputFile)
        await new Promise((resolve) => setImmediate(resolve));
        mockReadable.emit('error', mockError);

        // Assert
        expect(errorHandler).toHaveBeenLastCalledWith('Error occurred while reading from the stream:', mockError);
    })
})


describe("Test summaryLine method", () => {
    it.each([
        [["Alex_Dan", 123], "Alex,Dan,123.00\n"],
        [["Alex_Beatrice", 50.23], "Alex,Beatrice,50.23\n"]
    ])("", (keyValue, expected) => {
        const actual = summaryLine(keyValue);
        expect(actual).toEqual(expected);
    })
})