require.config({

    baseUrl: 'js/lib',

    urlArgs: "bust=" + (new Date()).getTime(),

    paths: {
        react: 'react/react-with-addons',
        JSXTransformer: 'react/JSXTransformer',
        app: '../app',
        jquery: 'http://code.jquery.com/jquery-1.11.0',
        mathjax: 'http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML'
    },

    map: {
        "*": {
            "codemirrorJS": "codemirror/mode/javascript/javascript",
            "codemirrorTex": "codemirror/mode/stex/stex",
			"github": 'http://localhost:8001/github.js'
        }    
    },

    shim: {
        "codemirror/mode/stex/stex": ["codemirror/codemirror"],
        "codemirror/mode/javascript/javascript": ["codemirror/codemirror"],
        "foundation": ['jquery'],
    }
});

var app = {}

require(["app/main"]);