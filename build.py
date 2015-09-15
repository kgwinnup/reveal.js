#!/usr/bin/env python

import argparse
import subprocess
import os
import sys

flags = '--standalone -t revealjs --section-divs --template=libs/template.html --no-highlight'

if __name__ == "__main__":
    parser = argparse.ArgumentParser();
    parser.add_argument('-n', '--name', help='Name of the markdown file', required=True)

    args = parser.parse_args()

    if not os.path.exists('./markdown'):
        print '[!] error: no markdown folder found'
        sys.exit(1)

    if not os.path.exists('./markdown/%s.md' % args.name):
        print '[!] error: markdown file not found'
        sys.exit(1)

    if not os.path.exists('./slides'):
        os.mkdir('./slides')

    cmd = ['pandoc',
           '--standalone',
           '-t',
           'revealjs',
           '--section-divs',
           '--template=libs/template.html',
           '--no-highlight']
    
    cmd.append('markdown/%s.md' % args.name)
    cmd.append('-o')
    cmd.append('slides/%s.html' % args.name)
    subprocess.check_call(cmd)
    print '[+] success: reveal html file created, ./slides/%s.html' % args.name

