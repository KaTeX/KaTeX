/**
 * Plugin for Remarkable Markdown processor which removes empty thead of tables
 */
module.exports = function(md, options) {
    function removeEmptyThead(state) {
        const tokens = state.tokens;

        let thead = -1;
        let empty = true;
        for (let i = tokens.length - 1; i >= 0; i--) {
            const tok = tokens[i];
            switch (tok.type) {
                case 'thead_close':
                    thead = i;
                    break;
                case 'thead_open':
                    if (empty) {
                        tokens.splice(i, thead - i + 1);
                    }
                    thead = -1;
                    empty = true;
                    break;
                case 'inline':
                    if (thead !== -1 && tok.content.length > 0) {
                        empty = false;
                    }
                    break;
            }
        }
    }

    md.core.ruler.after('block', 'empty_thead', removeEmptyThead);
};
