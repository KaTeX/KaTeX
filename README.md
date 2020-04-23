Hemos hecho este fork de la librería Katex por un problema que teníamos con las fuentes.

Esta librería la necesita componentes y por lo tanto es una depencia que se instala en builder y product.

La librería tiene un css que apunta a unas fuentes que lleva en una carpeta. Hasta aquí sin problema.

El asunto es que al realizar el build tanto en builder como visor utilizamos una variable de entorno PUBLIC_URL que sirve para que CRA añada ese prefijo a todos los assets que se encuentre. Lo que sucede es que en ese PUBLIC_URL ponemos algo como @yield('content-builder-url') que es una keyword de blade porque luego lo sustituimos usando blade para distinguir usos de la cdn. En visor hay un @yield('content-viewer-url') que se sustituye via blade en ocasiones y cuando se va a hacer una distribución empaquetada se hace con una expresión regular. 
El problema en ambos casos es que solo se hace en el index.html y no en los archivos css que es donde están las urls de las fuentes con lo que ese yield se queda sin reemplazar.

La solución ha sido permitir que esta librería haga una compilación en la que las fuentes se incrusten. Al ir incrustadas se ha limitado a usar solo woff dado que al poner los requisitos de navegadores, ttf no se hace necesario y woff2 solo nos aporta más ligereza pero eso tiene sentido si solo te vas a descargar una de las versiones pero al ir incrustadas nos hemos quedado con woff que es compatible con todos los navegadores que sopotamos.

Para clonar este proyecto hay que hacer:
```
git clone --recursive git@github.com:iseazy/KaTeX.git
``` 
porque lleva submodules

Si tienes un mensaje de error de este tipo al usar comando git como commit,push, pull, checkout...
```
the input device is not a TTY
```
es porque se están ejecutando unos hooks de git y no te permite ver en la consola el resultado. Yo lo he solucionado a lo bruto renombrando la carpeta hooks que hay dentro de .git para evitar que se ejecuten los hooks. Seguramente haya una mejor solución.

Tras hacer los cambios que necesites y pushearlo deberías generar una nueva release en github y actualizar ese número de versión en los package.json de builder y visor.

 


# [<img src="https://katex.org/img/katex-logo-black.svg" width="130" alt="KaTeX">](https://katex.org/)
[![npm](https://img.shields.io/npm/v/katex.svg)](https://www.npmjs.com/package/katex)
[![CircleCI](https://circleci.com/gh/KaTeX/KaTeX.svg?style=shield)](https://circleci.com/gh/KaTeX/KaTeX)
[![codecov](https://codecov.io/gh/KaTeX/KaTeX/branch/master/graph/badge.svg)](https://codecov.io/gh/KaTeX/KaTeX)
[![Join the chat at https://gitter.im/KaTeX/KaTeX](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/KaTeX/KaTeX?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=KaTeX/KaTeX)](https://dependabot.com)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/katex/badge?style=rounded)](https://www.jsdelivr.com/package/npm/katex)
![](https://img.badgesize.io/KaTeX/KaTeX/v0.11.1/dist/katex.min.js?compression=gzip)

KaTeX is a fast, easy-to-use JavaScript library for TeX math rendering on the web.

 * **Fast:** KaTeX renders its math synchronously and doesn't need to reflow the page. See how it compares to a competitor in [this speed test](http://www.intmath.com/cg5/katex-mathjax-comparison.php).
 * **Print quality:** KaTeX's layout is based on Donald Knuth's TeX, the gold standard for math typesetting.
 * **Self contained:** KaTeX has no dependencies and can easily be bundled with your website resources.
 * **Server side rendering:** KaTeX produces the same output regardless of browser or environment, so you can pre-render expressions using Node.js and send them as plain HTML.

KaTeX is compatible with all major browsers, including Chrome, Safari, Firefox, Opera, Edge, and IE 11.

KaTeX supports much (but not all) of LaTeX and many LaTeX packages. See the [list of supported functions](https://katex.org/docs/supported.html).

Try out KaTeX [on the demo page](https://katex.org/#demo)!

## Getting started

### Starter template

```html
<!DOCTYPE html>
<!-- KaTeX requires the use of the HTML5 doctype. Without it, KaTeX may not render properly -->
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">

    <!-- The loading of KaTeX is deferred to speed up page rendering -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous"></script>

    <!-- To automatically render math in text elements, include the auto-render extension: -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js" integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI" crossorigin="anonymous"
        onload="renderMathInElement(document.body);"></script>
  </head>
  ...
</html>
```

You can also [download KaTeX](https://github.com/KaTeX/KaTeX/releases) and host it yourself.

For details on how to configure auto-render extension, refer to [the documentation](https://katex.org/docs/autorender.html).

### API

Call `katex.render` to render a TeX expression directly into a DOM element.
For example:

```js
katex.render("c = \\pm\\sqrt{a^2 + b^2}", element, {
    throwOnError: false
});
```

Call `katex.renderToString` to generate an HTML string of the rendered math,
e.g., for server-side rendering.  For example:

```js
var html = katex.renderToString("c = \\pm\\sqrt{a^2 + b^2}", {
    throwOnError: false
});
// '<span class="katex">...</span>'
```

Make sure to include the CSS and font files in both cases.
If you are doing all rendering on the server, there is no need to include the
JavaScript on the client.

The examples above use the `throwOnError: false` option, which renders invalid
inputs as the TeX source code in red (by default), with the error message as
hover text.  For other available options, see the
[API documentation](https://katex.org/docs/api.html),
[options documentation](https://katex.org/docs/options.html), and
[handling errors documentation](https://katex.org/docs/error.html).

## Demo and Documentation

Learn more about using KaTeX [on the website](https://katex.org)!

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

KaTeX is licensed under the [MIT License](http://opensource.org/licenses/MIT).
