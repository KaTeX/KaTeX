import "katex/contrib/auto-render";

type HasRenderMathInElementGlobal =
    typeof globalThis extends {renderMathInElement: unknown} ? true : false;

const hasRenderMathInElementGlobal: HasRenderMathInElementGlobal = false;

void hasRenderMathInElementGlobal;
