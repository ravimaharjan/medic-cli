const fs = require("fs");
const { writeDebtSummary, summaryLine, readInputCSVFile, summaryTransformStream, begin } = require("../src/index");
const { Readable, Writable, Transform } = require("stream");
const cli = require("../src/cli")
const myModule = require('../src/index');

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

    it('Error on read stream should call the correct handler with message', async () => {

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

describe("Test the summaryTransformStream method", () => {
    // Since there nothing much happening in this method, we will simply 
    // test the return type.

    it("Test summaryTransformStream returns a type of Transform", () => {
        const transFormStream = summaryTransformStream();
        expect(transFormStream).toBeInstanceOf(Transform);

    })
})


describe("Test the begin method", () => {
    it("Begin method should return undefined if the checkCommandLine invalidates ", async () => {
        try {
            const mock = jest.fn();

            // We are setting value 1 to simulate the invalidation of checkCommandLine
            mock.mockReturnValue(1)
            cli.checkCommandLine = mock;
            const logSpy = jest.spyOn(console, 'log');

            // Act
            await begin();

            //Assert
            expect(logSpy).not.toHaveBeenCalledWith('Completed..')
            // No need to assert rejects because we are already waiting for promise to be resolved.
        }
        catch (error) {
            expect(error).toBe('Invalid command line arguments');
        }
    })


    it("Begin method should return files if the checkCommandLine valides successfully ", async () => {

        // Setup
        const mock = jest.fn();
        const files = { input: 'input.csv', output: 'output.csv' }
        mock.mockReturnValue(files)

        cli.checkCommandLine = mock;
        const logSpy = jest.spyOn(console, 'log');

        const mock2 = jest.fn();
        mock2.mockRejectedValue = "";
        myModule.processMonetaryDebt = mock2

        // Act
        const result = await begin();

        //Assert
        expect(logSpy).toHaveBeenCalledWith('Completed..')
        expect(result).toEqual('Completed');

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
