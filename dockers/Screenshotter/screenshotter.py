#!/usr/bin/env python2

import argparse
import json
import os
import png
import StringIO
import sys

from selenium import webdriver


def get_png_size(png_data):
    w, h, _, _ = png.Reader(file=StringIO.StringIO(png_data)).read()
    return (w, h)


def set_driver_size(driver, width, height):
    """Correctly sets the size of the driver window so screenshots end up the
    provided size"""
    driver.set_window_size(width, height)

    screenshot_size = get_png_size(driver.get_screenshot_as_png())
    attempts = 0
    while (width, height) != screenshot_size:
        attempts += 1
        if attempts > 5:
            print "Tried 5 times to size screen correctly, bailing out"
            exit(1)

        ss_width, ss_height = screenshot_size
        driver.set_window_size(
            width + (width - ss_width),
            height + (height - ss_height))
        screenshot_size = get_png_size(driver.get_screenshot_as_png())


def main():
    parser = argparse.ArgumentParser(
        description='Take screenshots of webpages', add_help=False)
    parser.add_argument('file', metavar='file.json')
    parser.add_argument('-t', '--tests', metavar='test', nargs='*')
    parser.add_argument('-w', '--width', metavar='width', default=1024,
                        type=int)
    parser.add_argument('-h', '--height', metavar='height', default=768,
                        type=int)
    parser.add_argument('-b', '--browser', metavar='browser',
                        choices=['firefox'], default='firefox')

    args = parser.parse_args()

    data = None
    with open(args.file) as f:
        try:
            data = json.load(f)
        except ValueError:
            print "Invalid json in input file:", args.file
            exit(1)

    tests = []

    if args.tests is None:
        tests = data.keys()
    else:
        data_tests = data.keys()
        for test in args.tests:
            if test not in data_tests:
                print "Unknown test:", test
                exit(1)

        tests = args.tests

    print "Starting up"
    sys.stdout.flush()

    driver = None
    if args.browser == 'firefox':
        driver = webdriver.Firefox()
    else:
        print "Unknown browser:", args.browser
        exit(1)

    set_driver_size(driver, args.width, args.height)

    data_dir = os.path.join(
        os.path.dirname(os.path.realpath(args.file)), "images")

    try:
        os.mkdir(data_dir)
    except OSError:
        pass

    for test, url in data.iteritems():
        if test in tests:
            filename = os.path.join(
                data_dir, '%s-%s.png' % (test, args.browser))

            print "Running:", test
            sys.stdout.flush()

            driver.get(url)
            driver.get_screenshot_as_file(filename)

    print "Done"

if __name__ == '__main__':
    main()
