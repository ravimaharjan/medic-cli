const path = require('path')
/**
 * Parses and validates the line input.
 * If input is invalid, it logs error in console and ignores the record.
 * Returns true if valid, false if invalid
 * @param {string} line : Single line of the Input file.
 * @returns bool
 */
function isValidLine(line) {
    let lineData = line.split(',').map((item) => item.trim());

    // Using multiple console.log so that to make assert in unittest easier. Than can be
    // changed to use single console.log with line breaks also.
    if (lineData.length > 3 || lineData.length < 3) {
        console.log('\nA line should have exactly 3 information');
        console.log(`Invalid line : ${line}`)
        console.log('Skipping it\n');
        return false;
    }

    let [debtor, creditor, amount] = [...lineData];

    // If any data is null or empty, we will consider it as an invalid record
    if (!debtor || !creditor || !amount) {
        console.log('\nA line must have valid values');
        console.log(`Invalid line : ${line}`)
        console.log('Skipping it\n');
        return false;
    }

    // If the amount is not a number, we will consider it as an invalid record
    if (isNaN(amount)) {
        console.log('\nAmount must be a valid number');
        console.log(`Invalid line : ${line}`)
        console.log('Skipping it\n');
        return false;
    }
    return true;
}

/**
 * Parses the line to return key and amount. 
 * Here key is in the format debtor_creditor.
 * 
 * @param {string} line 
 * @returns 
 */
function parseLine(line) {
    let lineData = line.split(',').map((item) => item.trim());
    let [debtor, creditor, amount] = [...lineData];
    const key = debtor + '_' + creditor;
    return [key, parseFloat(amount)]
}

/**
 * Iterates over the chunk of records and calculates the summary information.
 * @param {Array} chunk 
 * @returns summary data
 */
function getSummaryChunk(chunk) {
    let data = "";

    // Setting up the iterator so we can use the next method.
    // We can use the for loop for iteration but using next() method for next record 
    // looks more natural than using index based.
    const iter = chunk[Symbol.iterator]();
    let { done, value } = iter.next();

    let [currentKey, currentAmount] = parseLine(value);
    let endOfFile = false;

    do {
        let [debtor, creditor] = currentKey.split('_');

        // Getting next record in the chunk
        let { done, value } = iter.next();
        if (done) {
            endOfFile = true;
            data = data + debtor + ',' + creditor + ',' + currentAmount.toFixed(2) + '\n';
        }
        else {
            let [nextKey, nextAmt] = parseLine(value);

            // If currentKey does not match the next key then we can append it to the data.
            // But if next record is same as current key, we dont write it to the data yet.
            // We sum the amount so until we get different key
            if (currentKey !== nextKey) {
                data = data + debtor + ',' + creditor + ',' + currentAmount.toFixed(2) + '\n';
                currentAmount = nextAmt;
            }
            else {
                currentAmount = currentAmount + nextAmt;
            }
            // making the nextKey as current key to point currentKey to next record.
            currentKey = nextKey;
        }
    } while (!endOfFile)
    return data;
}

/**
 * Executes bash script to sort the input csv.
 * @param {string} inputFile 
 * @param {string} outputFile 
 * @returns 
 */
function sort(inputFile, outputFile) {
    return new Promise((resolve, reject) => {

        const exec = require('child_process').exec;
        const sortedFile = path.dirname(outputFile) + "/sorted.csv";
        const myShellScript = exec(`bash ./scripts/sort.sh ${inputFile} ${sortedFile}`);

        myShellScript.stdout.on('data', (data) => {
            // removing any special 
            resolve(data.replace(/\n/g, ''));
        });
        myShellScript.stderr.on('data', (err) => {
            console.error(err);
            reject(err)
        });
    })

}

module.exports = { isValidLine, parseLine, getSummaryChunk, sort }