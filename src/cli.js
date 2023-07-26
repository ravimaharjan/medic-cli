
const yargs = require('yargs');
const chalk = require('chalk');
const boxen = require('boxen');

/**
 * Checks if the command line arguments are valid.
 * Also supports to displa the help/usage information.
 * @returns 1 for invalid command line arguments. Return input and output file path if valid.
 */
function checkCommandLine() {

    const usage = chalk.green("\nUsage: medic-cli -i <input file>  -o <output file> \n") +
        boxen(chalk.yellow("\n Generates a summary of monetary debt data."), { padding: 1, borderColor: 'green', dimBorder: true })


    var argv = yargs(process.argv.slice(2))
        .usage(usage)
        .option("i", { alias: "input", describe: "Full Path to the input file", type: "string", demandOption: true })
        .option("o", { alias: "output", describe: "Full Path to the output file ", type: "string", demandOption: true })
        .argv;

    const input = argv?.i ?? argv.input;
    const output = argv?.o ?? argv.output;

    // If the input and output commandline arguments are empty, display the usage.
    if (input.trim().length === 0 || output.trim().length === 0) {
        yargs.showHelp();
        return 1;
    }
    return { input, output };
}

module.exports = checkCommandLine;