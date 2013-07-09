/* description: Parses end executes mathematical expressions. */

/* operator associations and precedence */

%left '^'
%left '_'
%left 'ORD'
%left 'BIN'
%left SUPSUB

%start expression

%% /* language grammar */

expression
    : ex 'EOF'
        {return $1;}
    ;

ex
    :
        {$$ = [];}
    | group ex
        {$$ = $1.concat($2);}
    | group '^' group ex
        {$$ = [{type: 'sup', value: {base: $1, sup: $3}}].concat($4);}
    | group '_' group ex
        {$$ = [{type: 'sub', value: {base: $1, sub: $3}}].concat($4);}
    | group '^' group '_' group ex %prec SUPSUB
        {$$ = [{type: 'supsub', value: {base: $1, sup: $3, sub: $5}}].concat($6);}
    | group '_' group '^' group ex %prec SUPSUB
        {$$ = [{type: 'supsub', value: {base: $1, sup: $5, sub: $3}}].concat($6);}
    ;

group
    : atom
        {$$ = $1;}
    | '{' ex '}'
        {$$ = $2;}
    | func
        {$$ = $1;}
    ;

func
    : 'cdot'
        {$$ = [{type: 'bin', value: yytext}];}
    | 'pm'
        {$$ = [{type: 'bin', value: yytext}];}
    | 'div'
        {$$ = [{type: 'bin', value: yytext}];}
    | 'lvert'
        {$$ = [{type: 'open', value: yytext}];}
    | 'rvert'
        {$$ = [{type: 'close', value: yytext}];}
    | 'leq'
        {$$ = [{type: 'rel', value: yytext}];}
    | 'geq'
        {$$ = [{type: 'rel', value: yytext}];}
    | 'neq'
        {$$ = [{type: 'rel', value: yytext}];}
    | 'nleq'
        {$$ = [{type: 'rel', value: yytext}];}
    | 'ngeq'
        {$$ = [{type: 'rel', value: yytext}];}
    | 'qquad'
        {$$ = [{type: 'spacing', value: yytext}];}
    | 'quad'
        {$$ = [{type: 'spacing', value: yytext}];}
    | 'space'
        {$$ = [{type: 'spacing', value: yytext}];}
    | ','
        {$$ = [{type: 'spacing', value: yytext}];}
    | ':'
        {$$ = [{type: 'spacing', value: yytext}];}
    | ';'
        {$$ = [{type: 'spacing', value: yytext}];}
    | 'blue' group
        {$$ = [{type: 'color', value: {color: 'blue', value: $2}}];}
    | 'orange' group
        {$$ = [{type: 'color', value: {color: 'orange', value: $2}}];}
    | 'pink' group
        {$$ = [{type: 'color', value: {color: 'pink', value: $2}}];}
    | 'red' group
        {$$ = [{type: 'color', value: {color: 'red', value: $2}}];}
    | 'green' group
        {$$ = [{type: 'color', value: {color: 'green', value: $2}}];}
    | 'gray' group
        {$$ = [{type: 'color', value: {color: 'gray', value: $2}}];}
    | 'purple' group
        {$$ = [{type: 'color', value: {color: 'purple', value: $2}}];}
    | 'dfrac' group group
        {$$ = [{type: 'dfrac', value: {numer: $2, denom: $3}}];}
    | 'llap' group
        {$$ = [{type: 'llap', value: $2}];}
    | 'rlap' group
        {$$ = [{type: 'rlap', value: $2}];}
    ;

atom
    : 'ORD'
        {$$ = [{type: 'ord', value: yytext}];}
    | 'BIN'
        {$$ = [{type: 'bin', value: yytext}];}
    | 'REL'
        {$$ = [{type: 'rel', value: yytext}];}
    | 'OPEN'
        {$$ = [{type: 'open', value: yytext}];}
    | 'CLOSE'
        {$$ = [{type: 'close', value: yytext}];}
    ;

