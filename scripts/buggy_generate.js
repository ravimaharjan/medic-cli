const fs = require('fs');
const { Readable } = require('stream');

let limit = 2000000;
let arr = ["Alex", "Beatrice", "Sam", "Mark", "Henry", "Danny", "Rob", "Harry", "Michael"]

function name() {
    return arr[(Math.floor(Math.random() * arr.length))];
}

function num(max, min) {
    return parseFloat(Math.random() * (max - min) + min).toFixed(2)
}

function* generate() {
    let c = 0;
    while (c < limit) {
        yield `${name()},${name()},${num(10, 1)}\n`;
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