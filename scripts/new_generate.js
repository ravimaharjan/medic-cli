const fs = require('fs');
const { Readable } = require('stream');

let limit = 5000000;

function num(max, min) {
    return parseFloat(Math.random() * (max - min) + min).toFixed(2)
}

const generateRandomString = (length) => {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

function* generate() {
    let c = 0;
    while (c < limit) {
        yield `${generateRandomString(7)},${generateRandomString(8)},${num(10, 1)}\n`;
        c = c + 1;
    }
}

function data() {

    let writeStream = fs.createWriteStream("./data/new_input.csv");

    const readStream = Readable.from(generate())

    readStream.pipe(writeStream);

    readStream.on('error', (err) => {
        console.error('Error occurred while reading from the stream:', err);
    });

    writeStream.on('error', (err) => {
        console.error('Error occurred while writing to the stream:', err);
    });

    writeStream.on('finish', () => {
        console.log('Write process is complete.');
    });
}

data()