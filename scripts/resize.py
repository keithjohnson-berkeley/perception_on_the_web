#!/usr/bin/env python3

# resize images and save as .jpg
# size is hard coded as 768x512.

import os
import sys
import subprocess
import math
from pathlib import Path

tgth = 512  # the target image size is 768 wide, x 512 high
tgtw = 768

sizestring = f'{tgtw}x{tgth}'

# ---------------------------
def get_dims(inpath):
    '''Get dimensions of image in inpath.'''
    dims = {'w': None, 'h': None}
    for dim in dims.keys():
        p = subprocess.run(['magick','identify',   # image magick version 7
#        p = subprocess.run(['identify',    # image magick version 6
                '-format', f'%[fx:{dim}]', str(inpath)],
            check=True,
            capture_output=True
        )
        dims[dim] = int(p.stdout.decode())
    return dims
# ---------------------------

print(sys.argv)

directory = os.getcwd()

# if there is a command line argument, assume that it is a subdirectory
if (len(sys.argv) > 1):
    directory = "{}/{}".format(directory,Path(sys.argv[1]))

print(f'resizing images in this directory: {directory}')

try:
    os.chdir(directory)
except FileNotFoundError:
    print('call the program from the directory that contains the files')
    print(' or pass the name of a subdirectory to process.')
    print(f'directory: {directory} does not exist')
    exit

files = Path(directory).glob('*')

for file in files:
   
    # is it an image file? - no -> continue
    try:
        dims = get_dims(file)  # can't get dimensions of a non-image file
    except:
        continue  # so move on to the next file


    outfile = f'{file.stem}_768x512.jpg'
    p = subprocess.run( ['magick','convert',  f"{file}", '-resize', '768x512',  # version 7
#    p = subprocess.run( ['convert',  f"{file}", '-normalize', '-resize', sizestring,            # version 6
        '-gravity','Center', '-extent', sizestring, outfile],
        capture_output=True)
    if p.returncode != 0:
        print(p.stderr.decode())
        print(f'Command: {subprocess.list2cmdline(p.args)}')
    else:
        print(f'resized image: {outfile} ({sizestring})')
