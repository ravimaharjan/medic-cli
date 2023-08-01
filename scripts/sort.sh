#!/usr/bin/bash
inputfile=$1
output_file=$2

if [ ! -f "$inputfile" ]; then
  echo "Error: File '$inputfile' not found."
  exit 1
fi
if [ -f "$output_file" ]; then
#   echo "Deleting existing sorted file"
  rm $output_file
fi

sort $inputfile >> $output_file

echo "$output_file"

