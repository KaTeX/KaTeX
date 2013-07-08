/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex
%%

<<EOF>>               return 'EOF'

/lex

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
    | '\' func
        {$$ = $2;}
    ;

func
    : 'cdot'
        {$$ = [{type: 'bin', value: yytext}];}
    | 'pm'
        {$$ = [{type: 'bin', value: yytext}];}
    | 'div'
        {$$ = [{type: 'bin', value: yytext}];}
    | 'frac' group group
        {$$ = [{type: 'frac', value: {numer: $2, denom: $3}}];}
    | 'lvert'
        {$$ = [{type: 'open', value: yytext}];}
    | 'rvert'
        {$$ = [{type: 'close', value: yytext}];}
    ;

atom
    : 'ORD'
        {$$ = [{type: 'ord', value: yytext}];}
    | 'BIN'
        {$$ = [{type: 'bin', value: yytext}];}
    | 'OPEN'
        {$$ = [{type: 'open', value: yytext}];}
    | 'CLOSE'
        {$$ = [{type: 'close', value: yytext}];}
    ;

