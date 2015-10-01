#!/usr/bin/env python

import argparse
import subprocess
import os
import sys

def compile_file(path, theme):

    if not os.path.exists('./libs/css/theme/%s.css' % theme):
        print '[!] error: no style sheet found: ./libs/css/theme/%s.css' % theme
        return -1

    if not os.path.exists('./markdown'):
        print '[!] error: no markdown folder found'
        return -1

    if not os.path.exists('./markdown/%s.md' % path):
        print '[!] error: markdown file not found: %s' % path
        return -1

    if not os.path.exists('./slides'):
        os.mkdir('./slides')

    cmd = ['pandoc',
           '--standalone',
           '-t',
           'revealjs',
           '--variable=theme:%s' % theme,
           '--section-divs',
           '--template=libs/template.html',
           '--no-highlight']

    cmd.append('markdown/%s.md' % path)
    cmd.append('-o')
    cmd.append('slides/%s.html' % path)
    subprocess.check_call(cmd)
    print '[+] success: reveal html file created, ./slides/%s.html' % args.name

if __name__ == "__main__":
    parser = argparse.ArgumentParser();
    parser.add_argument('-n', '--name', help='Name of the markdown file', required=True)
    parser.add_argument('-t', '--theme', help='Name of the css theme', required=False, default='moon')

    args = parser.parse_args()

    compile_file(args.name, args.theme)
