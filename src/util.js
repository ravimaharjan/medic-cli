/**
 * Parses and validates the line input.
 * If input is invalid, it logs error in console and ignores the information. 
 * If input is valid, it constructs information in the Map object.
 * 
 *          Key of Map => "Debtor_Creditor"
 *          Value of Map => Amount
 * @param {string} line : Single line of the Input file.
 * @returns void
 */
function parseLine(line, debtMapping) {
    let lineData = line.split(',').map((item) => item.trim());

    if (lineData.length > 3 || lineData.length < 3) {
        console.log('\nA line is expected to have only 3 information');
        console.log(`Invalid line : ${line}`)
        console.log('Skipping it\n');
        return;
    }

    let [debtor, creditor, amount] = [...lineData];

    // If any data is null or empty, we will consider it as an invalid record
    if (!debtor || !creditor || !amount) {
        console.log('\nA line must have valid values');
        console.log(`Invalid line : ${line}`)
        console.log('Skipping it\n');
        return;
    }

    // If the amount is not a number, we will consider it as an invalid record
    if (isNaN(amount)) {
        console.log('\nAmount must be a valid number');
        console.log(`Invalid line : ${line}`)
        console.log('Skipping it\n');
        return;
    }

    // Construct the key for the Map item with the format 'debtor_creditor'
    const key = debtor + '_' + creditor;

    amount = parseFloat(amount);

    if (debtMapping.has(key)) amount = amount + debtMapping.get(key);

    debtMapping.set(key, amount);
}

module.exports = parseLine;