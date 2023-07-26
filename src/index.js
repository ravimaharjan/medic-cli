#!/usr/bin/env node

const fs = require('fs');
const { Readable, Transform } = require('stream')
const readLine = require('readline');
const checkCommandLine = require('./cli');
const parseLine = require('./util')


const debtMapping = new Map();

/**
 * Constructs the summary line from the provided input in the form [key, Value]
 * Sample :
 *      Key : "Alex_Beatrice"
 *      Value : 123
 *      Return value : Alex,Beatrice,123
 * 
 * @param {object} keyValue 
 * @returns 
 */
function summaryLine(keyValue) {
    const [key, value] = keyValue;
    return key.split('_').join(',') + ',' + parseFloat(value).toFixed(2) + '\n';
}

/**
 * Return the Transform stream
 * @returns Tranform Stream
 */
function summaryTransformStream() {
    return new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            console.log('sum')
            const debtSummary = summaryLine(chunk);
            this.push(debtSummary);
            callback();
        },
    });
}


/**
 * Iterates over the debt Mappings and constructs the summary in the format
 *      Format : Debtor, Creditor, Amount.
 * Finally the summary is written to the output file.
 * @param {*} debtMapping 
 * @param {*} outputFile 
 */
function writeDebtSummary(debtMapping, outputFile) {

    let writeStream = fs.createWriteStream(outputFile);

    const readStream = Readable.from(debtMapping.entries())

    const summaryTransform = summaryTransformStream();

    // Pipe the data from the readable stream, through the Transform stream, 
    // to the writable stream
    readStream.pipe(summaryTransform).pipe(writeStream);

    // Optionally, handle any errors that may occur during the piping process
    readStream.on('error', (err) => {
        console.error('Error occurred while reading from the stream:', err);
    });

    summaryTransform.on('error', (err) => {
        console.error('Error occurred in the Transform stream:', err);
    });

    writeStream.on('error', (err) => {
        console.error('Error occurred while writing to the stream:', err);
    });

    writeStream.on('finish', () => {
        console.log('Write process is complete.');
    });
}

function writeDebtSummary2(debtMapping, outputFile) {

    let writeStream = fs.createWriteStream(outputFile);

    for (const [key, value] of debtMapping) {

        // Construct the summary in format -> Debitor,Creditor,Amount
        const debtSummary = key.split('_').join(',') + ',' + parseFloat(value).toFixed(2) + '\n';

        writeStream.write(debtSummary);
    }
}

/**
 * Reads the stream of content of Input file and calculates the summary of Debt.
 * @param {string} inputFile : Path to the input file
 * @returns Promise
 */
function readInputCSVFile(inputFile) {

    let readStream;
    return new Promise((resolve, reject) => {
        readStream = fs.createReadStream(inputFile);

        const readInterface = readLine.createInterface({
            input: readStream,
        });

        readInterface.on('line', (line) => parseLine(line, debtMapping));

        readInterface.on('close', () => {
            if (readStream) readStream.close();
            resolve('Completed reading the CSV file.')
        });

        readInterface.on('error', (err) => {
            if (readStream) readStream.close();
            reject(err)
        });
    });
}

/**
 * Beging the process of processing the monetary debt data. It produces the final
 * debt information in the outputFile.
 * @param {string} inputFile 
 * @param {string} outputFile 
 */
async function processMonetaryDebt(inputFile, outputFile) {

    try {
        await readInputCSVFile(inputFile);

        writeDebtSummary2(debtMapping, outputFile);
    } catch (error) {
        console.log('Error occurred: ', error);
    }
}


(() => {
    try {
        const result = checkCommandLine();

        // Checking if the result is an error. 
        if (result === 1) return;

        if (typeof (result) === 'object' && Object.entries(result).length === 2) {
            processMonetaryDebt(result['input'], result['output']);
        }
    }
    catch (err) {
        console.log("Error occured: ", err);
    }
})()


module.exports = {
    writeDebtSummary,
    summaryLine
}


