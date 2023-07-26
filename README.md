<h1 align="center"> Medic-cli </h1>
<p align="center">
 <b>A command line application to process the summary of monetary debt information.</b>
</p>
<br>

### Description
The application processes a CSV file where each line contains debtor, creditor and amount information. On processing the input file, it produces the summary in the CSV format. This tool helps to automate reading, parsing and generating the summary of debt information. It is developed keeping performance and scalability into consideration to handle large set of input data.

### Scenario
The sample input files is shown below.

```
Alex,Beatrice,101.32
Beatrice,Alex,1.20
Carl,Alex,45
Carl,Beatrice,12.50
Alex,Beatrice,19.22
Beatrice,Carl,67.90
Carl,Beatrice,12.80
Carl,Alex,15.88
Beatrice,Carl,71.42
Beatrice,Alex,4.54
Beatrice,Carl,28.76
```
The first line states that Alex owes Beatrice $101.32. Second line states Beatrice owes Alex $1.20. With this notion, we need to generate the summary as given below. 

```
Alex,Beatrice,120.54
Beatrice,Alex,5.74
Beatrice,Carl,168.08
Carl,Alex,60.88
Carl,Beatrice,25.30
```
#### Prerequisite
* Node version 16 or above

### Installation steps

* Clone the Repo or download the zip.
* Go to the medic-cli folder
* Run command to install the dependencies
  ```
  npm install
  ```
* Run the command to install the package globally so you can run the cli from anywhere.
  ```
  npm install -g .
  ```
* Run the command to verify the cli is installed correctly. It should display the version information.
  ```
  medic-cli --version
  ```
* Run the command to see the usage.
```
  medic-cli --help
```
### How to use
The tool has a minimal help information. Run `medic-cli --help` will display the usage information.
```
Usage: medic-cli -i <input file>  -o <output file>
┌─────────────────────────────────────────────────┐
│                                                 │
│                                                 │
│    Generates a summary of monetary debt data.   │
│                                                 │
└─────────────────────────────────────────────────┘

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -i, --input    Full Path to the input file                 [string] [required]
  -o, --output   Full Path to the output file                [string] [required]
```
### Run Tool
```
  medic-cli -i "path to the input file" -o "path to the output file"
```
### For Developers
The tool has few other commands for developers.
* `npm run test` > Runs the unit test with coverage
* `npm run lint` > Runs a linter. Use eslint
  