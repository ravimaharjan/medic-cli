const cli = require("../src/cli");

describe('Test checkCommandLine', () => {

    it('Should return [input, output] when input and output arguments are provided', () => {

        // Setup
        const originalArgv = process.argv;
        process.argv = ['node', 'cli.js', '-i', '/path/to/input/file', '-o', '/path/to/output/file']

        const expectedResult = {
            input: '/path/to/input/file',
            output: '/path/to/output/file'
        }

        // Act
        const result = cli.checkCommandLine();

        // Assert
        expect(result).toEqual(expectedResult);

        // resetting to the original argv
        process.argv = originalArgv;
    });
});
