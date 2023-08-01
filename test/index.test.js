const { summaryTransform, begin } = require("../src/index");
const { Transform } = require("stream");
const cli = require("../src/cli")
const myModule = require('../src/index');
const util = require("../src/util")

jest.mock('fs');

describe("Test the summaryTransformStream method", () => {
    // Since there nothing much happening in this method, we will simply 
    // test the return type.

    it("Test summaryTransformStream returns a type of Transform", () => {
        const transFormStream = summaryTransform();
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

            const sortMock = jest.fn();
            util.sort = sortMock;

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

        const sortMock = jest.fn();
        util.sort = sortMock;

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
