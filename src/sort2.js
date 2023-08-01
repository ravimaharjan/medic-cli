const fs = require('fs');
const readline = require('readline');
const CHUNK_SIZE = 100000; // Adjust the chunk size based on available memory and file size

async function externalMergeSort(inputFile, outputFile) {
    // Divide the large file into sorted chunks
    await divideIntoChunks(inputFile);

    // Merge the sorted chunks to produce the final sorted output
    await mergeChunks(outputFile);
}

async function divideIntoChunks(inputFile) {
    let chunkNum = 0;
    let currentChunk = [];
    const readStream = fs.createReadStream(inputFile);
    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity
    });

    rl.on('line', (line) => {
        currentChunk.push(line);
        if (currentChunk.length === CHUNK_SIZE) {
            currentChunk.sort();
            writeChunkToFile(chunkNum, currentChunk);
            chunkNum++;
            currentChunk = [];
        }
    });

    rl.on('close', () => {
        if (currentChunk.length > 0) {
            currentChunk.sort();
            writeChunkToFile(chunkNum, currentChunk);
        }
    });
}

async function writeChunkToFile(chunkNum, chunkData) {
    const chunkFile = `chunk_${chunkNum}.txt`;
    const writeStream = fs.createWriteStream(chunkFile);
    chunkData.forEach((line) => {
        writeStream.write(line + '\n');
    });
    writeStream.end();
}

async function mergeChunks(outputFile) {
    const writeStream = fs.createWriteStream(outputFile);
    const chunkFiles = [];
    for (let i = 0; ; i++) {
        const chunkFile = `chunk_${i}.txt`;
        if (fs.existsSync(chunkFile)) {
            chunkFiles.push(chunkFile);
        } else {
            break;
        }
    }

    const chunkStreams = chunkFiles.map((chunkFile) => {
        return readline.createInterface({
            input: fs.createReadStream(chunkFile),
            crlfDelay: Infinity
        });
    });

    const minHeap = new MinHeap();

    // Initialize the minHeap with the first lines from each chunk
    for (let i = 0; i < chunkStreams.length; i++) {
        const rl = chunkStreams[i];
        const line = await rl[Symbol.asyncIterator]().next();
        if (!line.done) {
            minHeap.insert({ line: line.value, chunkIndex: i });
        }
    }

    // Merge the chunks
    while (minHeap.size() > 0) {
        const { line, chunkIndex } = minHeap.extractMin();
        writeStream.write(line + '\n');
        const rl = chunkStreams[chunkIndex];
        const nextLine = await rl[Symbol.asyncIterator]().next();
        if (!nextLine.done) {
            minHeap.insert({ line: nextLine.value, chunkIndex });
        }
    }

    // Close and remove the temporary chunk files
    writeStream.end();
    chunkFiles.forEach((chunkFile) => fs.unlinkSync(chunkFile));
}

class MinHeap {
    constructor() {
        this.heap = [];
    }

    size() {
        return this.heap.length;
    }

    insert(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin() {
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return min;
    }

    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].line.localeCompare(this.heap[index].line) > 0) {
                [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    bubbleDown(index) {
        while (true) {
            let smallest = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            if (leftChild < this.heap.length && this.heap[leftChild].line.localeCompare(this.heap[smallest].line) < 0) {
                smallest = leftChild;
            }
            if (rightChild < this.heap.length && this.heap[rightChild].line.localeCompare(this.heap[smallest].line) < 0) {
                smallest = rightChild;
            }
            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            } else {
                break;
            }
        }
    }
}

// Usage example:
// externalMergeSort('input.csv', 'output.csv');

module.exports = externalMergeSort;