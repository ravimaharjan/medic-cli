#!/usr/bin/env node

const fs = require('fs');
const { Transform, pipeline } = require('stream')
const readLine = require('readline');
const cli = require('./cli');
const util = require('./util');

function summaryTransform() {
    return new Transform({
        transform(test, encoding, callback) {
            const chunk = JSON.parse(test);
            const summary = util.getSummaryChunk(chunk);
            this.push(summary);
            callback();
        }
    })
}

/**
 * Reads the stream of content of Input file and calculates the summary of Debt.
 * @param {string} inputFile : Path to the input file
 * @returns Promise
 */
function process(inputFile, outputFile) {

    return new Promise((resolve, reject) => {

        let chunk = [];
        let chunkCount = 0;

        // chunk size in bytes to send to transform stream at a time.
        // Depending upon the input file and machine, we need to 
        // choose the optimal value.
        let maxChunkSize = 5000;

        const highWaterMark = 64000; // Optional highWaterMark Value. Currently set to default value.

        // This key is important to create a chunk. It is two avoid same key in two chunks. We ensure
        // same keys are kept in only one chunk.
        let prevKey = null;

        let readStream = fs.createReadStream(inputFile, { highWaterMark });

        let writeStream = fs.createWriteStream(outputFile, { highWaterMark });

        const readInterface = readLine.createInterface({
            input: readStream,
        });

        const transformStream = summaryTransform();

        readInterface.on('line', (line) => {

            const valid = util.isValidLine(line);
            if (!valid) return;

            const chunkSize = Buffer.byteLength(JSON.stringify(chunk));
            const lineSize = Buffer.byteLength(line);
            const [currenKey] = util.parseLine(line);

            // If total size exceeds the maxChunkSize and the currentKey is not as same as previous
            // key then push that chunk to transform stream for further processing.

            // If the total size exceeds but prevKey = currentKey, continue until different key is found.
            if ((chunkSize + lineSize) > maxChunkSize && prevKey !== currenKey) {
                console.log('Processing chunk : ', chunkCount);
                transformStream.write(JSON.stringify(chunk));
                chunk = [] // reset the chunk
                chunkCount++;
            }

            chunk.push(line);
            prevKey = currenKey;
        });

        readInterface.on('close', () => {

            // There can be records which are in chunk but are not yet sent to the transform stream 
            // because the chunksize didn't exceede the maxChunkSize. We need to send those
            // records to transform too.

            if (chunk) transformStream.write(JSON.stringify(chunk));
            if (readStream) readStream.destroy();

            resolve("complete");
        });

        readInterface.on('error', (err) => {
            if (readStream) readStream.destroy();
            reject(err)
        });

        pipeline(transformStream, writeStream, (err) => {
            if (err) console.log('error', err);
            else console.log('complete');
        })
    });
}

/**
 * Begin the process of processing the monetary debt data. It produces the final
 * debt information in the outputFile.
 * @param {string} inputFile 
 * @param {string} outputFile 
 */
async function processMonetaryDebt(inputFile, outputFile) {
    try {
        await process(inputFile, outputFile);
    } catch (error) {
        console.log('Error occurred: ', error);
    }
}

async function begin() {
    try {
        const result = cli.checkCommandLine();
        // Checking if the result is an error. Here 1 means error case.
        if (result === 1) return Promise.reject("Invalid command line arguments")

        // Checking if the result is of type object and it has 2 entries.
        if (typeof (result) === 'object' && Object.entries(result).length === 2) {
            const { input, output } = result;

            console.log("Performing the sort operation in input file..")
            const sortedInputFile = await util.sort(input, output)
            console.log("Sort completed..")

            console.log('Processing the sorted file..')
            await processMonetaryDebt(sortedInputFile, output)

            // TODO : Delete up the temporaray sorted file created.
        }

        console.log("Completed..")
        return Promise.resolve("Completed")
    }
    catch (err) {
        console.log("Error : ", err);
    }
}


const myModule = {
    summaryTransform,
    processMonetaryDebt,
    begin
}
begin();

module.exports = myModule;

