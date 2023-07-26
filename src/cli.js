
const yargs = require('yargs')
const chalk = require('chalk');
const boxen = require('boxen');

/**
 * 
 * @returns 
 */
function checkCommandLine() {
    var argv = yargs(process.argv.slice(2)).argv;

    const usage = chalk.green("\nUsage: medic-cli -i <input file>  -o <output file> \n") +
        boxen(chalk.yellow("\n Generates a summary of monetary debt data."))

    yargs
        .usage(usage)
        .option("i", { alias: "input", describe: "Full Path to the input file", type: "string", demandOption: true })
        .option("o", { alias: "output", describe: "Full Path to the output file ", type: "string", demandOption: true })
        .help(true)
        .argv;

    const input = argv?.i ?? argv.input;
    const output = argv?.o ?? argv.output;

    // If the input and out commandline arguments are empty, display the usage.
    if (input.trim().length === 0 || output.trim().length === 0) {
        yargs.showHelp();
        return 1;
    }
    return { input, output };
}
module.exports = checkCommandLine;