#!/usr/bin/env python

import re
import json
import os

expr_start = re.compile(r"\s*\(")
expr_value = re.compile(r"\s*([^\s\)]+)")
expr_end = re.compile(r"\s*\)")
empty = re.compile(r"\s*$")


def inner_parse_expr(expr):
    l = []
    while True:
        if re.match(empty, expr):
            return expr, l
        elif re.match(expr_start, expr):
            match = re.match(expr_start, expr)
            new_expr = expr[len(match.group(0)):]
            expr, group = inner_parse_expr(new_expr)
            l.append(group)
        elif re.match(expr_value, expr):
            match = re.match(expr_value, expr)
            expr = expr[len(match.group(0)):]
            l.append(match.group(1))
        elif re.match(expr_end, expr):
            match = re.match(expr_end, expr)
            new_expr = expr[len(match.group(0)):]
            return new_expr, l
        else:
            raise ValueError("Invalid input")


def parse_expr(expr):
    _, group = inner_parse_expr(expr)
    return group


def read_pl(pl_file):
    with open(pl_file) as pl:
        return parse_expr(pl.read())


class Metric:
    def __init__(self, char, height, depth):
        self.char = char
        self.height = float(height) / 1000
        self.depth = float(depth) / 1000

    def __repr__(self):
        return "Char {0} ({1:.3f}+{2:.3f})".format(
                self.char, self.height, self.depth)


# Different styles of text, found on page 13 of The TeX book
ROMAN = "roman"
SLANTED = "slanted"
ITALIC = "italic"
TYPEWRITER = "typewriter"
BOLD = "bold"


# The numbers used in this map are all in octal, because that's how all the
# charts for the numbers are written
file_map = {
    "cmmi10.pl": {
        13: (u"\u03b1", ITALIC),  # \alpha
        14: (u"\u03b2", ITALIC),  # \beta
        15: (u"\u03b3", ITALIC),  # \gamma
        16: (u"\u03b4", ITALIC),  # \delta
        17: (u"\u03b5", ITALIC),  # \varepsilon
        20: (u"\u03b6", ITALIC),  # \zeta
        21: (u"\u03b7", ITALIC),  # \eta
        22: (u"\u03b8", ITALIC),  # \theta
        23: (u"\u03b9", ITALIC),  # \iota
        24: (u"\u03ba", ITALIC),  # \kappa
        25: (u"\u03bb", ITALIC),  # \lambda
        26: (u"\u03bc", ITALIC),  # \mu
        27: (u"\u03bd", ITALIC),  # \nu
        30: (u"\u03be", ITALIC),  # \xi
        31: (u"\u03c0", ITALIC),  # \pi
        32: (u"\u03c1", ITALIC),  # \rho
        33: (u"\u03c3", ITALIC),  # \sigma
        34: (u"\u03c4", ITALIC),  # \tau
        35: (u"\u03c5", ITALIC),  # \upsilon
        36: (u"\u03d5", ITALIC),  # \phi
        37: (u"\u03c7", ITALIC),  # \chi
        40: (u"\u03c8", ITALIC),  # \psi
        41: (u"\u03c9", ITALIC),  # \omega
        42: (u"\u03b5", ITALIC),  # \epsilon
        43: (u"\u03d1", ITALIC),  # \vartheta
        44: (u"\u03d6", ITALIC),  # \varpi
        45: (u"\u03f1", ITALIC),  # \varrho
        46: (u"\u03c2", ITALIC),  # \varsigma
        47: (u"\u03c6", ITALIC),  # \varphi
        72: (u".", ROMAN),
        73: (u",", ROMAN),
        74: (u"<", ROMAN),
        75: (u"/", ROMAN),
        76: (u">", ROMAN),
        101: (u"A", ITALIC),
        102: (u"B", ITALIC),
        103: (u"C", ITALIC),
        104: (u"D", ITALIC),
        105: (u"E", ITALIC),
        106: (u"F", ITALIC),
        107: (u"G", ITALIC),
        110: (u"H", ITALIC),
        111: (u"I", ITALIC),
        112: (u"J", ITALIC),
        113: (u"K", ITALIC),
        114: (u"L", ITALIC),
        115: (u"M", ITALIC),
        116: (u"N", ITALIC),
        117: (u"O", ITALIC),
        120: (u"P", ITALIC),
        121: (u"Q", ITALIC),
        122: (u"R", ITALIC),
        123: (u"S", ITALIC),
        124: (u"T", ITALIC),
        125: (u"U", ITALIC),
        126: (u"V", ITALIC),
        127: (u"W", ITALIC),
        130: (u"X", ITALIC),
        131: (u"Y", ITALIC),
        132: (u"Z", ITALIC),
        141: (u"a", ITALIC),
        142: (u"b", ITALIC),
        143: (u"c", ITALIC),
        144: (u"d", ITALIC),
        145: (u"e", ITALIC),
        146: (u"f", ITALIC),
        147: (u"g", ITALIC),
        150: (u"h", ITALIC),
        151: (u"i", ITALIC),
        152: (u"j", ITALIC),
        153: (u"k", ITALIC),
        154: (u"l", ITALIC),
        155: (u"m", ITALIC),
        156: (u"n", ITALIC),
        157: (u"o", ITALIC),
        160: (u"p", ITALIC),
        161: (u"q", ITALIC),
        162: (u"r", ITALIC),
        163: (u"s", ITALIC),
        164: (u"t", ITALIC),
        165: (u"u", ITALIC),
        166: (u"v", ITALIC),
        167: (u"w", ITALIC),
        170: (u"x", ITALIC),
        171: (u"y", ITALIC),
        172: (u"z", ITALIC),
    },
    "cmr10.pl": {
        0: (u"\u0393", ROMAN),  # \Gamma
        1: (u"\u0394", ROMAN),  # \Delta
        2: (u"\u0398", ROMAN),  # \Theta
        3: (u"\u039b", ROMAN),  # \Lambda
        4: (u"\u039e", ROMAN),  # \Xi
        5: (u"\u03a0", ROMAN),  # \Pi
        6: (u"\u03a3", ROMAN),  # \Sigma
        7: (u"\u03a5", ROMAN),  # \Upsilon
        10: (u"\u03a6", ROMAN),  # \Phi
        11: (u"\u03a8", ROMAN),  # \Psi
        12: (u"\u03a9", ROMAN),  # \Omega
        41: (u"!", ROMAN),
        42: (u"\"", ROMAN),
        44: (u"$", ROMAN),
        50: (u"(", ROMAN),
        51: (u")", ROMAN),
        53: (u"+", ROMAN),
        60: (u"0", ROMAN),
        61: (u"1", ROMAN),
        62: (u"2", ROMAN),
        63: (u"3", ROMAN),
        64: (u"4", ROMAN),
        65: (u"5", ROMAN),
        66: (u"6", ROMAN),
        67: (u"7", ROMAN),
        70: (u"8", ROMAN),
        71: (u"9", ROMAN),
        72: (u":", ROMAN),
        73: (u";", ROMAN),
        75: (u"=", ROMAN),
        77: (u"?", ROMAN),
        100: (u"@", ROMAN),
        101: (u"A", ROMAN),
        102: (u"B", ROMAN),
        103: (u"C", ROMAN),
        104: (u"D", ROMAN),
        105: (u"E", ROMAN),
        106: (u"F", ROMAN),
        107: (u"G", ROMAN),
        110: (u"H", ROMAN),
        111: (u"I", ROMAN),
        112: (u"J", ROMAN),
        113: (u"K", ROMAN),
        114: (u"L", ROMAN),
        115: (u"M", ROMAN),
        116: (u"N", ROMAN),
        117: (u"O", ROMAN),
        120: (u"P", ROMAN),
        121: (u"Q", ROMAN),
        122: (u"R", ROMAN),
        123: (u"S", ROMAN),
        124: (u"T", ROMAN),
        125: (u"U", ROMAN),
        126: (u"V", ROMAN),
        127: (u"W", ROMAN),
        130: (u"X", ROMAN),
        131: (u"Y", ROMAN),
        132: (u"Z", ROMAN),
        133: (u"[", ROMAN),
        135: (u"]", ROMAN),
        140: (u"`", ROMAN),
        141: (u"a", ROMAN),
        142: (u"b", ROMAN),
        143: (u"c", ROMAN),
        144: (u"d", ROMAN),
        145: (u"e", ROMAN),
        146: (u"f", ROMAN),
        147: (u"g", ROMAN),
        150: (u"h", ROMAN),
        151: (u"i", ROMAN),
        152: (u"j", ROMAN),
        153: (u"k", ROMAN),
        154: (u"l", ROMAN),
        155: (u"m", ROMAN),
        156: (u"n", ROMAN),
        157: (u"o", ROMAN),
        160: (u"p", ROMAN),
        161: (u"q", ROMAN),
        162: (u"r", ROMAN),
        163: (u"s", ROMAN),
        164: (u"t", ROMAN),
        165: (u"u", ROMAN),
        166: (u"v", ROMAN),
        167: (u"w", ROMAN),
        170: (u"x", ROMAN),
        171: (u"y", ROMAN),
        172: (u"z", ROMAN),
    },
    "cmsy10.pl": {
        0: (u"\u2212", ROMAN),  # -
        1: (u"\u22c5", ROMAN),  # \cdot
        2: (u"\u00d7", ROMAN),  # \times
        3: (u"\u2217", ROMAN),  # *
        4: (u"\u00f7", ROMAN),  # \div
        6: (u"\u00b1", ROMAN),  # \pm
        16: (u"\u2218", ROMAN),  # \circ
        24: (u"\u2264", ROMAN),  # \leq
        25: (u"\u2265", ROMAN),  # \geq
        40: (u"\u2190", ROMAN),  # \leftarrow
        41: (u"\u2192", ROMAN),  # \rightarrow
        60: (u"\u2032", ROMAN),  # \prime
        61: (u"\u221e", ROMAN),  # \infty
        152: (u"|", ROMAN),  # |
    }
}


def read_metrics(pl_file, metrics):
    pl = read_pl(pl_file)

    metrics_to_read = file_map[pl_file]

    for elem in pl:
        if elem[0] == "CHARACTER":
            if elem[1] == "C":
                char = int(oct(ord(elem[2])))
            elif elem[1] == "O":
                char = int(elem[2])
            else:
                continue

            if not char in metrics_to_read:
                continue

            map_char, map_style = metrics_to_read[char]

            char_height = 0
            char_depth = 0

            for metric in elem[3:]:
                if metric[0] == "comment":
                    continue
                elif metric[0] == "CHARHT":
                    char_height = int(metric[2])
                elif metric[0] == "CHARDP":
                    char_depth = int(metric[2])

            metrics[map_style].append(
                    Metric(map_char, char_height, char_depth))


def print_metrics(metrics):
    metric_map = {
        style: {
            "height": {
                metric.char: metric.height for metric in metric_list
            },
            "depth": {
                metric.char: metric.depth for metric in metric_list
            },
        } for style, metric_list in metrics.iteritems()
    }

    print "var metricMap = {0};".format(json.dumps(metric_map, indent=4))


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.realpath(__file__)))

    metrics = {
        "roman": [],
        "italic": [],
        "slanted": [],
        "typewriter": [],
        "bold": [],
    }

    for metric_file in file_map:
        read_metrics(metric_file, metrics)

    metrics["roman"].append(Metric(u'\u00a0', 0, 0))

    print_metrics(metrics)
