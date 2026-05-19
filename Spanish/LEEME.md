# [<img src="https://katex.org/img/katex-logo-black.svg" width="130" alt="KaTeX">](https://katex.org/)
[![npm](https://img.shields.io/npm/v/katex.svg)](https://www.npmjs.com/package/katex)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![CI](https://github.com/KaTeX/KaTeX/workflows/CI/badge.svg?branch=main&event=push)](https://github.com/KaTeX/KaTeX/actions?query=workflow%3ACI)
[![codecov](https://codecov.io/gh/KaTeX/KaTeX/branch/main/graph/badge.svg)](https://codecov.io/gh/KaTeX/KaTeX)
[![Discussions](https://img.shields.io/badge/Discussions-join-brightgreen)](https://github.com/KaTeX/KaTeX/discussions)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/katex/badge?style=rounded)](https://www.jsdelivr.com/package/npm/katex)
![katex.min.js size](https://img.badgesize.io/https://unpkg.com/katex/dist/katex.min.js?compression=gzip)
[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/KaTeX/KaTeX)
[![Financial Contributors on Open Collective](https://opencollective.com/katex/all/badge.svg?label=financial+contributors)](https://opencollective.com/katex)

KaTex es una libreria de JavaScript, rapida y facil de usar, hecha para representar la TeX matematica en la web.

* **Fast:** KaTeX representa sus matemáticas de forma síncrona y no necesita redistribuir la página. Vea cómo se compara con un competidor en [this speed test](https://www.intmath.com/cg5/katex-mathjax-comparison.php).
 * **Print quality:** El diseño de KaTeX se basa en TeX de Donald Knuth, el estándar de oro para la composición tipográfica matemática.
 * **Self contained:** KaTeX no tiene dependencias y puede combinarse fácilmente con los recursos de su sitio web.
 * **Server side rendering:** KaTeX produce el mismo resultado independientemente del navegador o el entorno, por lo que puede renderizar previamente las expresiones usando Node.js y enviarlas como HTML simple.

 KaTeX es compatible con todos los navegadores principales, incluidos Chrome, Safari, Firefox, Opera, Edge e IE 11.

 KaTeX admite gran parte (pero no todo) de LaTeX y muchos paquetes de LaTeX. Ver el [list of supported functions](https://katex.org/docs/supported.html).

Prueba KaTeX [on the demo page](https://katex.org/#demo)!

## Empezando

### Plantilla de inicio

```html
<!DOCTYPE html>
<!-- KaTeX requiere el uso de HTML5 doctype. Sin el, KaTeX podria fallar. -->
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.2/dist/katex.min.css" integrity="sha384-bYdxxUwYipFNohQlHt0bjN/LCpueqWz13HufFEV1SUatKs1cm4L6fFgCi1jT643X" crossorigin="anonymous">

    <!-- La carga de KaTeX se aplaza para acelerar el renderizado de la página -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.2/dist/katex.min.js" integrity="sha384-Qsn9KnoKISj6dI8g7p1HBlNpVx0I8p1SvlwOldgi3IorMle61nQy4zEahWYtljaz" crossorigin="anonymous"></script>

    <!-- Para representar matemáticas automáticamente en elementos de texto, incluya la extensión de representación automática: -->
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.2/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"
        onload="renderMathInElement(document.body);"></script>
  </head>
  ...
</html>
```

Tambien puedes [download KaTeX](https://github.com/KaTeX/KaTeX/releases) y hostearlo por ti mismo.

Para obtener detalles sobre cómo configurar la extensión de procesamiento automático, consulte [the documentation](https://katex.org/docs/autorender.html).

### API

Llame a `katex.render` para representar una expresión TeX directamente en un elemento DOM.
Por ejemplo:

```js
katex.render("c = \\pm\\sqrt{a^2 + b^2}", element, {
    throwOnError: false
});
```

Llame a `katex.renderToString` para generar una cadena de texto HTML de las matemáticas renderizadas,
por ejemplo, para la representación del lado del servidor. Por ejemplo:

```js
var html = katex.renderToString("c = \\pm\\sqrt{a^2 + b^2}", {
    throwOnError: false
});
// '<span class="katex">...</span>'
```

Asegúrese de incluir los archivos CSS y de fuente en ambos casos.
Si está haciendo todo el renderizado en el servidor, no es necesario incluir el
JavaScript en el cliente.

Los ejemplos anteriores usan la opción `throwOnError: false`, que se vuelve inválida
entradas como el código fuente de TeX en rojo (por defecto), con el mensaje de error como
texto flotante. Para conocer otras opciones disponibles, consulte la
[API documentation](https://katex.org/docs/api.html),
[options documentation](https://katex.org/docs/options.html), and
[handling errors documentation](https://katex.org/docs/error.html).

## Demo y documentación

Aprende más sobre como usar KaTeX [on the website](https://katex.org)!

## Colaboradores

### Colaboradores de codigo

Este proyecto existe gracias a todas las personas que aportan código. Si desea ayudar, consulte [our guide to contributing code](CONTRIBUTING.md).
<a href="https://github.com/KaTeX/KaTeX/graphs/contributors"><img src="https://contributors-svg.opencollective.com/katex/contributors.svg?width=890&button=false" alt="Code contributors" /></a>

### Contribuciones monetarias

Conviértase en un contribuyente financiero y ayúdenos a mantener nuestra comunidad.

#### Individuos

<a href="https://opencollective.com/katex"><img src="https://opencollective.com/katex/individuals.svg?width=890" alt="Contribute on Open Collective"></a>

#### Organizaciones

Apoya este proyecto con tu organización. Su logotipo aparecerá aquí con un enlace a su sitio web.

<a href="https://opencollective.com/katex/organization/0/website"><img src="https://opencollective.com/katex/organization/0/avatar.svg" alt="Organization 1"></a>
<a href="https://opencollective.com/katex/organization/1/website"><img src="https://opencollective.com/katex/organization/1/avatar.svg" alt="Organization 2"></a>
<a href="https://opencollective.com/katex/organization/2/website"><img src="https://opencollective.com/katex/organization/2/avatar.svg" alt="Organization 3"></a>
<a href="https://opencollective.com/katex/organization/3/website"><img src="https://opencollective.com/katex/organization/3/avatar.svg" alt="Organization 4"></a>
<a href="https://opencollective.com/katex/organization/4/website"><img src="https://opencollective.com/katex/organization/4/avatar.svg" alt="Organization 5"></a>
<a href="https://opencollective.com/katex/organization/5/website"><img src="https://opencollective.com/katex/organization/5/avatar.svg" alt="Organization 6"></a>
<a href="https://opencollective.com/katex/organization/6/website"><img src="https://opencollective.com/katex/organization/6/avatar.svg" alt="Organization 7"></a>
<a href="https://opencollective.com/katex/organization/7/website"><img src="https://opencollective.com/katex/organization/7/avatar.svg" alt="Organization 8"></a>
<a href="https://opencollective.com/katex/organization/8/website"><img src="https://opencollective.com/katex/organization/8/avatar.svg" alt="Organization 9"></a>
<a href="https://opencollective.com/katex/organization/9/website"><img src="https://opencollective.com/katex/organization/9/avatar.svg" alt="Organization 10"></a>

## Licencia

KaTeX esta licenciado por la [MIT License](https://opensource.org/licenses/MIT).