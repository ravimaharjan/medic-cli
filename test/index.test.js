const fs = require("fs");
const { writeDebtSummary, summaryLine, readInputCSVFile } = require("../src/index");
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


    it('should reject the promise on error event', async () => {
        const inputFile = 'example.csv';

        // Create a mock readable stream with an error
        const mockReadStream = new Readable({
            read() {
                this.emit('error', new Error('File Error'));
            },
        });

        // Mock the fs.createReadStream to return the mock readable stream
        fs.createReadStream.mockReturnValue(mockReadStream);

        // Spy on the reject function to check if it's called with the expected error message
        const rejectSpy = jest.fn();

        // Call the function being tested
        const promise = readInputCSVFile(inputFile);
        promise.catch(rejectSpy);

        // Wait for the promise to reject
        await expect(promise).rejects.toEqual('error');

        // Expect the rejectSpy to be called with the expected error message
        expect(rejectSpy).toHaveBeenCalledWith('error');
    });

    it('should call parseLine for each line in the input file', async () => {
        const inputFile = 'example.csv';

        // Create a mock readable stream with some test data
        const testData = 'Alex,Beatrice,101.32\nBeatrice,Alex,1.20\nCarl,Alex,45\n';
        const mockReadStream = new Readable({
            read() {
                this.push(testData);
                this.push(null); // Signal end of data
            },
        });

        // Mock the fs.createReadStream to return the mock readable stream
        fs.createReadStream.mockReturnValue(mockReadStream);

        // Create a mock parseLine function
        const mockParseLine = jest.fn();
        const util = require("../src/util");
        // Replace the original parseLine function with the mock function
        jest.spyOn(util, 'parseLine').mockImplementation(mockParseLine);

        // Call the function being tested
        await readInputCSVFile(inputFile);

        // Expect parseLine to be called three times, once for each line in the test data
        expect(mockParseLine).toHaveBeenCalledTimes(3);

        // Optionally, you can check the arguments passed to parseLine if needed
        expect(mockParseLine).toHaveBeenCalledWith('Alex,Beatrice,101.32', expect.any(Map));
        expect(mockParseLine).toHaveBeenCalledWith('Beatrice,Alex,1.20', expect.any(Map));
        expect(mockParseLine).toHaveBeenCalledWith('Carl,Alex,45', expect.any(Map));
    });
});



describe("Test summaryLine method", () => {
    it.each([
        [["Alex_Dan", 123], "Alex,Dan,123.00\n"],
        [["Alex_Beatrice", 50.23], "Alex,Beatrice,50.23\n"]
    ])("SummaryLine function should return the correct summary string", (keyValue, expected) => {
        const actual = summaryLine(keyValue);
        expect(actual).toEqual(expected);
    })
})