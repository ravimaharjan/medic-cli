#!/usr/bin/env node

const fs = require('fs');
const { Readable, Transform } = require('stream')
const readLine = require('readline');
const checkCommandLine = require('./cli');
const parseLine = require('./util')

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
async function writeDebtSummary(debtMapping, outputFile) {

    let writeStream = fs.createWriteStream(outputFile);

    const readStream = Readable.from(debtMapping.entries())

    const summaryTransform = summaryTransformStream();

    // Pipe the data from the readable stream, through the Transform stream, 
    // to the writable stream
    readStream.pipe(summaryTransform).pipe(writeStream);

    // Optionally, handle any errors that may occur during the piping process
    readStream.on('error', (err) => {
        console.error('Error while reading from the stream:', err);
    });

    summaryTransform.on('error', (err) => {
        console.error('Error in the Transform stream:', err);
    });

    writeStream.on('error', (err) => {
        console.error('Error while writing to the stream:', err);
    });

    writeStream.on('finish', () => {
        console.log('Write process is complete.');
    });
}

/**
 * Reads the stream of content of Input file and calculates the summary of Debt.
 * @param {string} inputFile : Path to the input file
 * @returns Promise
 */
function readInputCSVFile(inputFile) {

    return new Promise((resolve, reject) => {
        const debtMapping = new Map();

        let readStream = fs.createReadStream(inputFile);

        const readInterface = readLine.createInterface({
            input: readStream,
        });
        readInterface.on('line', (line) => parseLine(line, debtMapping));

        readInterface.on('close', () => {
            if (readStream) readStream.close();
            resolve(debtMapping);
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
        const debtMapping = await readInputCSVFile(inputFile);
        // console.log('output', output);
        await writeDebtSummary(debtMapping, outputFile);
    } catch (error) {
        console.log('Error occurred: ', error);
    }
}


(async () => {
    try {
        const result = checkCommandLine();

        // Checking if the result is an error. 
        if (result === 1) return;

        if (typeof (result) === 'object' && Object.entries(result).length === 2) {
            await processMonetaryDebt(result['input'], result['output']);
        }

        console.log("Completed..")
    }
    catch (err) {
        console.log("Error : ", err);
    }
})()


module.exports = {
    writeDebtSummary,
    summaryLine
}

