# namespace imports loader for webpack

Can be used to inject variables into the scope of a module under some namespace. This is especially useful if third-party modules are relying on some namespace being initialized with some value like `com.foo.bar`.

Heavily inspired by [imports-loader](https://github.com/webpack/imports-loader)

## Installation

```
npm install namespace-imports-loader
```

## Usage

Given you have this file `example.js`

```javascript

var value = com.foo.bar.getValue()
```

then you can inject the `com.foo.bar` namespace into the module by configuring the namespace-imports-loader like this:

``` javascript
require("namespace-imports?com.foo.bar=someFile!./example.js");
```

It is possible to put multiple values on the same namespace. It will merge the values into one object.

### webpack.config.js

As always, you should rather configure this in your `webpack.config.js`:

```javascript
// ./webpack.config.js

module.exports = {
    ...
    module: {
        loaders: [
            {
                test: require.resolve("some-module"),
                loader: "namespace-imports?com.foo.bar=someFile"
            }
        ]
};
```

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

## License

MIT (http://www.opensource.org/licenses/mit-license.php)