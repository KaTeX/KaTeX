/* MIT License

Copyright (c) 2017 Brad Howes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
 * Plugin for Remarkable Markdown processor which transforms $..$ and $$..$$
 * sequences into math HTML using the KaTeX package.
 */
module.exports = function(md, options) {
    const katex = require("../../");

    function renderKatex(source, displayMode) {
        return katex.renderToString(source, {displayMode, throwOnError: false});
    }

    /**
     * Parse '$$' as a block. Based off of similar method in remarkable.
     */
    function parseBlockKatex(state, startLine, endLine) {
        let len;
        let params;
        let nextLine;
        let mem;
        let haveEndMarker = false;
        let pos = state.bMarks[startLine] + state.tShift[startLine];
        let max = state.eMarks[startLine];
        const dollar = 0x24;

        if (pos + 1 > max) { return false; }

        const marker = state.src.charCodeAt(pos);
        if (marker !== dollar) { return false; }

        // scan marker length
        mem = pos;
        pos = state.skipChars(pos, marker);
        len = pos - mem;

        if (len !== 2)  { return false; }

        // search end of block
        nextLine = startLine;

        for (;;) {
            ++nextLine;
            if (nextLine >= endLine) {
                // unclosed block should be autoclosed by end of document.
                // also block seems to be autoclosed by end of parent
                break;
            }

            pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
            max = state.eMarks[nextLine];

            if (pos < max && state.tShift[nextLine] < state.blkIndent) {
                // non-empty line with negative indent should stop the list:
                // - ```
                //  test
                break;
            }

            if (state.src.charCodeAt(pos) !== dollar) { continue; }

            if (state.tShift[nextLine] - state.blkIndent >= 4) {

                // closing fence should be indented less than 4 spaces
                continue;
            }

            pos = state.skipChars(pos, marker);

            // closing code fence must be at least as long as the opening one
            if (pos - mem < len) { continue; }

            // make sure tail has spaces only
            pos = state.skipSpaces(pos);

            if (pos < max) { continue; }

            haveEndMarker = true;

            // found!
            break;
        }

        // If a fence has heading spaces, they should be removed from
        // its inner block
        len = state.tShift[startLine];

        state.line = nextLine + (haveEndMarker ? 1 : 0);

        const content = state.getLines(startLine + 1, nextLine, len, true)
                             .replace(/[ \n]+/g, ' ')
                             .trim();

        state.tokens.push({
            type: 'katex',
            params,
            content,
            lines: [startLine, state.line],
            level: state.level,
            block: true,
        });

        return true;
    }

    /**
     * Look for '$' or '$$' spans in Markdown text.
     * Based off of the 'fenced' parser in remarkable.
     */
    function parseInlineKatex(state, silent) {
        const dollar = 0x24;
        const backslash = 0x5c;
        let pos = state.pos;
        const start = pos;
        const max = state.posMax;
        let matchStart;
        let matchEnd;
        let esc;

        if (state.src.charCodeAt(pos) !== dollar) { return false; }
        ++pos;

        while (pos < max && state.src.charCodeAt(pos) === dollar) {
            ++pos;
        }

        const marker = state.src.slice(start, pos);
        if (marker.length > 2) { return false; }

        matchStart = matchEnd = pos;

        while ((matchStart = state.src.indexOf('$', matchEnd)) !== -1) {
            matchEnd = matchStart + 1;

            // bypass escaped delimiters
            esc = matchStart - 1;
            while (state.src.charCodeAt(esc) === backslash) {
                --esc;
            }
            if ((matchStart - esc) % 2 === 0) { continue; }

            while (matchEnd < max && state.src.charCodeAt(matchEnd) === dollar) {
                ++matchEnd;
            }

            if (matchEnd - matchStart === marker.length) {
                if (!silent) {
                    const content = state.src.slice(pos, matchStart)
                                             .replace(/[ \n]+/g, ' ')
                                             .trim();

                    state.push({
                        type: 'katex',
                        content,
                        block: marker.length > 1,
                        level: state.level,
                    });
                }

                state.pos = matchEnd;
                return true;
            }
        }

        if (!silent) {
            state.pending += marker;
        }
        state.pos += marker.length;

        return true;
    }

    md.inline.ruler.push('katex', parseInlineKatex, options);
    md.block.ruler.push('katex', parseBlockKatex, options);
    md.renderer.rules.katex = function(tokens, idx) {
        return renderKatex(tokens[idx].content, tokens[idx].block);
    };
};
