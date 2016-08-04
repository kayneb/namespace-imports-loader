/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Kayne Barclay @kayneb, largely repurposed imports-loader from Tobias Koppers @sokra
*/
var loaderUtils = require("loader-utils");
var _ = require('lodash');
var SourceNode = require("source-map").SourceNode;
var SourceMapConsumer = require("source-map").SourceMapConsumer;
var HEADER = "/*** IMPORTS FROM namespace-imports-loader ***/\n";

function resolveNamespaceFromParts(namespaceParts) {
	return namespaceParts.join(".");
}

module.exports = function(content, sourceMap) {
	if(this.cacheable) this.cacheable();
	var query = loaderUtils.parseQuery(this.query);
	var imports = [];
	Object.keys(query).forEach(function(name) {
		var value;
		var mod = query[name];
		if (mod instanceof Array) {
			value = [];
			for (var i = 0; i < mod.length; i++) {
				value.push('require(' + JSON.stringify(mod[i]) + ')');
			}
		} else {
			value = "require(" + JSON.stringify(mod) + ")";
		}

		var namespaceSegments = name.split('.');
		imports.push("if (typeof " + namespaceSegments[0] + " == 'undefined') { var " + namespaceSegments[0] + " = {}; }");

		var toDeclare = [namespaceSegments[0]];
		for (var j = 1; j < namespaceSegments.length - 1; j++) {
			toDeclare.push(namespaceSegments[j]);
			var namespaceToDeclare = resolveNamespaceFromParts(toDeclare);
			imports.push("if (typeof " + namespaceToDeclare + " == 'undefined') { " + namespaceToDeclare + " = {}; }");
		}
		if (value instanceof Array) {
			imports.push("if (typeof " + name + " == 'undefined') { " + name + " = {}; }");
			imports.push('for (var i = 0, value = [' + value + ']; i < value.length; i++) {');
			imports.push('    for (var j = 0, v = value[i], vKeys = Object.keys(v); j < vKeys.length; j++) {');
			imports.push('        ' + name + '[vKeys[j]] = v[vKeys[j]];');
			imports.push('    }');
			imports.push('}');
		} else {
			imports.push(name + ' = ' + value + ';');
		}
	});
	var prefix = HEADER + imports.join("\n") + "\n\n";
	if(sourceMap) {
		var currentRequest = loaderUtils.getCurrentRequest(this);
		var node = SourceNode.fromStringWithSourceMap(content, new SourceMapConsumer(sourceMap));
		node.prepend(prefix);
		var result = node.toStringWithSourceMap({
			file: currentRequest
		});
		this.callback(null, result.code, result.map.toJSON());
		return;
	}
	return prefix + content;
}

