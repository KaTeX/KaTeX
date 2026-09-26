import renderMathInElement, {
    type RenderMathInElementOptions,
} from "katex/contrib/auto-render";
import "katex/contrib/copy-tex";
import "katex/contrib/mathtex-script-type";
import "katex/contrib/mhchem";
import renderA11yString from "katex/contrib/render-a11y-string";

type CopyTexModule = typeof import("katex/contrib/copy-tex");
type MathtexScriptTypeModule = typeof import("katex/contrib/mathtex-script-type");
type MhchemModule = typeof import("katex/contrib/mhchem");

const options: RenderMathInElementOptions = {
    delimiters: [
        {left: "$$", right: "$$", display: true},
    ],
    preProcess: (math) => math.trim(),
    throwOnError: false,
};

renderMathInElement(document.body, options);

const accessibleText: string = renderA11yString("x^2", {
    strict: false,
});

const sideEffectModules: [
    CopyTexModule,
    MathtexScriptTypeModule,
    MhchemModule,
] = [{}, {}, {}];

void accessibleText;
void sideEffectModules;
