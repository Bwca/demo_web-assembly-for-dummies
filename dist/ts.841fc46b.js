// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"ts/enums/element-ids.enum.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ElementIds;

(function (ElementIds) {
  ElementIds["NumberInput"] = "number-input";
  ElementIds["SearchStringInput"] = "search-string-input";
  ElementIds["ReplaceStringInput"] = "replace-string-input";
  ElementIds["FibSubmitButton"] = "fib-submit-button";
  ElementIds["WarSubmitButton"] = "war-submit-button";
  ElementIds["JSFibResultParagraph"] = "fib-js-result";
  ElementIds["JSWarResultParagraph"] = "war-js-result";
  ElementIds["WasmFibResultParagraph"] = "fib-wasm-result";
  ElementIds["WasmWarResultParagraph"] = "war-wasm-result";
})(ElementIds = exports.ElementIds || (exports.ElementIds = {}));
},{}],"../node_modules/assemblyscript/lib/loader/index.js":[function(require,module,exports) {
"use strict";

// Runtime header offsets
const ID_OFFSET = -8;
const SIZE_OFFSET = -4;

// Runtime ids
const ARRAYBUFFER_ID = 0;
const STRING_ID = 1;
const ARRAYBUFFERVIEW_ID = 2;

// Runtime type information
const ARRAYBUFFERVIEW = 1 << 0;
const ARRAY = 1 << 1;
const SET = 1 << 2;
const MAP = 1 << 3;
const VAL_ALIGN_OFFSET = 5;
const VAL_ALIGN = 1 << VAL_ALIGN_OFFSET;
const VAL_SIGNED = 1 << 10;
const VAL_FLOAT = 1 << 11;
const VAL_NULLABLE = 1 << 12;
const VAL_MANAGED = 1 << 13;
const KEY_ALIGN_OFFSET = 14;
const KEY_ALIGN = 1 << KEY_ALIGN_OFFSET;
const KEY_SIGNED = 1 << 19;
const KEY_FLOAT = 1 << 20;
const KEY_NULLABLE = 1 << 21;
const KEY_MANAGED = 1 << 22;

// Array(BufferView) layout
const ARRAYBUFFERVIEW_BUFFER_OFFSET = 0;
const ARRAYBUFFERVIEW_DATASTART_OFFSET = 4;
const ARRAYBUFFERVIEW_DATALENGTH_OFFSET = 8;
const ARRAYBUFFERVIEW_SIZE = 12;
const ARRAY_LENGTH_OFFSET = 12;
const ARRAY_SIZE = 16;

const BIGINT = typeof BigUint64Array !== "undefined";
const THIS = Symbol();
const CHUNKSIZE = 1024;

/** Gets a string from an U32 and an U16 view on a memory. */
function getStringImpl(buffer, ptr) {
  const U32 = new Uint32Array(buffer);
  const U16 = new Uint16Array(buffer);
  var length = U32[(ptr + SIZE_OFFSET) >>> 2] >>> 1;
  var offset = ptr >>> 1;
  if (length <= CHUNKSIZE) return String.fromCharCode.apply(String, U16.subarray(offset, offset + length));
  const parts = [];
  do {
    const last = U16[offset + CHUNKSIZE - 1];
    const size = last >= 0xD800 && last < 0xDC00 ? CHUNKSIZE - 1 : CHUNKSIZE;
    parts.push(String.fromCharCode.apply(String, U16.subarray(offset, offset += size)));
    length -= size;
  } while (length > CHUNKSIZE);
  return parts.join("") + String.fromCharCode.apply(String, U16.subarray(offset, offset + length));
}

/** Prepares the base module prior to instantiation. */
function preInstantiate(imports) {
  const baseModule = {};

  function getString(memory, ptr) {
    if (!memory) return "<yet unknown>";
    return getStringImpl(memory.buffer, ptr);
  }

  // add common imports used by stdlib for convenience
  const env = (imports.env = imports.env || {});
  env.abort = env.abort || function abort(mesg, file, line, colm) {
    const memory = baseModule.memory || env.memory; // prefer exported, otherwise try imported
    throw Error("abort: " + getString(memory, mesg) + " at " + getString(memory, file) + ":" + line + ":" + colm);
  }
  env.trace = env.trace || function trace(mesg, n) {
    const memory = baseModule.memory || env.memory;
    console.log("trace: " + getString(memory, mesg) + (n ? " " : "") + Array.prototype.slice.call(arguments, 2, 2 + n).join(", "));
  }
  imports.Math = imports.Math || Math;
  imports.Date = imports.Date || Date;

  return baseModule;
}

/** Prepares the final module once instantiation is complete. */
function postInstantiate(baseModule, instance) {
  const rawExports = instance.exports;
  const memory = rawExports.memory;
  const table = rawExports.table;
  const alloc = rawExports["__alloc"];
  const retain = rawExports["__retain"];
  const rttiBase = rawExports["__rtti_base"] || ~0; // oob if not present

  /** Gets the runtime type info for the given id. */
  function getInfo(id) {
    const U32 = new Uint32Array(memory.buffer);
    const count = U32[rttiBase >>> 2];
    if ((id >>>= 0) >= count) throw Error("invalid id: " + id);
    return U32[(rttiBase + 4 >>> 2) + id * 2];
  }

  /** Gets the runtime base id for the given id. */
  function getBase(id) {
    const U32 = new Uint32Array(memory.buffer);
    const count = U32[rttiBase >>> 2];
    if ((id >>>= 0) >= count) throw Error("invalid id: " + id);
    return U32[(rttiBase + 4 >>> 2) + id * 2 + 1];
  }

  /** Gets the runtime alignment of a collection's values. */
  function getValueAlign(info) {
    return 31 - Math.clz32((info >>> VAL_ALIGN_OFFSET) & 31); // -1 if none
  }

  /** Gets the runtime alignment of a collection's keys. */
  function getKeyAlign(info) {
    return 31 - Math.clz32((info >>> KEY_ALIGN_OFFSET) & 31); // -1 if none
  }

  /** Allocates a new string in the module's memory and returns its retained pointer. */
  function __allocString(str) {
    const length = str.length;
    const ptr = alloc(length << 1, STRING_ID);
    const U16 = new Uint16Array(memory.buffer);
    for (var i = 0, p = ptr >>> 1; i < length; ++i) U16[p + i] = str.charCodeAt(i);
    return ptr;
  }

  baseModule.__allocString = __allocString;

  /** Reads a string from the module's memory by its pointer. */
  function __getString(ptr) {
    const buffer = memory.buffer;
    const id = new Uint32Array(buffer)[ptr + ID_OFFSET >>> 2];
    if (id !== STRING_ID) throw Error("not a string: " + ptr);
    return getStringImpl(buffer, ptr);
  }

  baseModule.__getString = __getString;

  /** Gets the view matching the specified alignment, signedness and floatness. */
  function getView(alignLog2, signed, float) {
    const buffer = memory.buffer;
    if (float) {
      switch (alignLog2) {
        case 2: return new Float32Array(buffer);
        case 3: return new Float64Array(buffer);
      }
    } else {
      switch (alignLog2) {
        case 0: return new (signed ? Int8Array : Uint8Array)(buffer);
        case 1: return new (signed ? Int16Array : Uint16Array)(buffer);
        case 2: return new (signed ? Int32Array : Uint32Array)(buffer);
        case 3: return new (signed ? BigInt64Array : BigUint64Array)(buffer);
      }
    }
    throw Error("unsupported align: " + alignLog2);
  }

  /** Allocates a new array in the module's memory and returns its retained pointer. */
  function __allocArray(id, values) {
    const info = getInfo(id);
    if (!(info & (ARRAYBUFFERVIEW | ARRAY))) throw Error("not an array: " + id + " @ " + info);
    const align = getValueAlign(info);
    const length = values.length;
    const buf = alloc(length << align, ARRAYBUFFER_ID);
    const arr = alloc(info & ARRAY ? ARRAY_SIZE : ARRAYBUFFERVIEW_SIZE, id);
    const U32 = new Uint32Array(memory.buffer);
    U32[arr + ARRAYBUFFERVIEW_BUFFER_OFFSET >>> 2] = retain(buf);
    U32[arr + ARRAYBUFFERVIEW_DATASTART_OFFSET >>> 2] = buf;
    U32[arr + ARRAYBUFFERVIEW_DATALENGTH_OFFSET >>> 2] = length << align;
    if (info & ARRAY) U32[arr + ARRAY_LENGTH_OFFSET >>> 2] = length;
    const view = getView(align, info & VAL_SIGNED, info & VAL_FLOAT);
    if (info & VAL_MANAGED) {
      for (let i = 0; i < length; ++i) view[(buf >>> align) + i] = retain(values[i]);
    } else {
      view.set(values, buf >>> align);
    }
    return arr;
  }

  baseModule.__allocArray = __allocArray;

  /** Gets a view on the values of an array in the module's memory. */
  function __getArrayView(arr) {
    const U32 = new Uint32Array(memory.buffer);
    const id = U32[arr + ID_OFFSET >>> 2];
    const info = getInfo(id);
    if (!(info & ARRAYBUFFERVIEW)) throw Error("not an array: " + id);
    const align = getValueAlign(info);
    var buf = U32[arr + ARRAYBUFFERVIEW_DATASTART_OFFSET >>> 2];
    const length = info & ARRAY
      ? U32[arr + ARRAY_LENGTH_OFFSET >>> 2]
      : U32[buf + SIZE_OFFSET >>> 2] >>> align;
    return getView(align, info & VAL_SIGNED, info & VAL_FLOAT)
          .subarray(buf >>>= align, buf + length);
  }

  baseModule.__getArrayView = __getArrayView;

  /** Reads (copies) the values of an array from the module's memory. */
  function __getArray(arr) {
    const input = __getArrayView(arr);
    const len = input.length;
    const out = new Array(len);
    for (let i = 0; i < len; i++) out[i] = input[i];
    return out;
  }

  baseModule.__getArray = __getArray;

  /** Reads (copies) the data of an ArrayBuffer from the module's memory. */
  function __getArrayBuffer(ptr) {
    const buffer = memory.buffer;
    const length = new Uint32Array(buffer)[ptr + SIZE_OFFSET >>> 2];
    return buffer.slice(ptr, ptr + length);
  }

  baseModule.__getArrayBuffer = __getArrayBuffer;

  function getTypedArrayImpl(Type, alignLog2, ptr) {
    const buffer = memory.buffer;
    const U32 = new Uint32Array(buffer);
    const bufPtr = U32[ptr + ARRAYBUFFERVIEW_DATASTART_OFFSET >>> 2];
    return new Type(buffer, bufPtr, U32[bufPtr + SIZE_OFFSET >>> 2] >>> alignLog2);
  }

  /** Gets a view on the values of a known-to-be Int8Array in the module's memory. */
  baseModule.__getInt8Array = getTypedArrayImpl.bind(null, Int8Array, 0);
  /** Gets a view on the values of a known-to-be Uint8Array in the module's memory. */
  baseModule.__getUint8Array = getTypedArrayImpl.bind(null, Uint8Array, 0);
  /** Gets a view on the values of a known-to-be Uint8ClampedArray in the module's memory. */
  baseModule.__getUint8ClampedArray = getTypedArrayImpl.bind(null, Uint8ClampedArray, 0);
  /** Gets a view on the values of a known-to-be Int16Array in the module's memory. */
  baseModule.__getInt16Array = getTypedArrayImpl.bind(null, Int16Array, 1);
  /** Gets a view on the values of a known-to-be Uint16Array in the module's memory. */
  baseModule.__getUint16Array = getTypedArrayImpl.bind(null, Uint16Array, 1);
  /** Gets a view on the values of a known-to-be Int32Array in the module's memory. */
  baseModule.__getInt32Array = getTypedArrayImpl.bind(null, Int32Array, 2);
  /** Gets a view on the values of a known-to-be Uint32Array in the module's memory. */
  baseModule.__getUint32Array = getTypedArrayImpl.bind(null, Uint32Array, 2);
  if (BIGINT) {
    /** Gets a view on the values of a known-to-be-Int64Array in the module's memory. */
    baseModule.__getInt64Array = getTypedArrayImpl.bind(null, BigInt64Array, 3);
    /** Gets a view on the values of a known-to-be-Uint64Array in the module's memory. */
    baseModule.__getUint64Array = getTypedArrayImpl.bind(null, BigUint64Array, 3);
  }
  /** Gets a view on the values of a known-to-be Float32Array in the module's memory. */
  baseModule.__getFloat32Array = getTypedArrayImpl.bind(null, Float32Array, 2);
  /** Gets a view on the values of a known-to-be Float64Array in the module's memory. */
  baseModule.__getFloat64Array = getTypedArrayImpl.bind(null, Float64Array, 3);

  /** Tests whether an object is an instance of the class represented by the specified base id. */
  function __instanceof(ptr, baseId) {
    const U32 = new Uint32Array(memory.buffer);
    var id = U32[(ptr + ID_OFFSET) >>> 2];
    if (id <= U32[rttiBase >>> 2]) {
      do if (id == baseId) return true;
      while (id = getBase(id));
    }
    return false;
  }

  baseModule.__instanceof = __instanceof;

  // Pull basic exports to baseModule so code in preInstantiate can use them
  baseModule.memory = baseModule.memory || memory;
  baseModule.table  = baseModule.table  || table;

  // Demangle exports and provide the usual utility on the prototype
  return demangle(rawExports, baseModule);
}

/** Wraps a WebAssembly function while also taking care of variable arguments. */
function wrapFunction(fn, setargc) {
  var wrap = (...args) => {
    setargc(args.length);
    return fn(...args);
  }
  wrap.original = fn;
  return wrap;
}

/** Instantiates an AssemblyScript module using the specified imports. */
function instantiate(module, imports) {
  return postInstantiate(
    preInstantiate(imports || (imports = {})),
    new WebAssembly.Instance(module, imports)
  );
}

exports.instantiate = instantiate;

/** Instantiates an AssemblyScript module from a buffer using the specified imports. */
function instantiateBuffer(buffer, imports) {
  return instantiate(new WebAssembly.Module(buffer), imports);
}

exports.instantiateBuffer = instantiateBuffer;

/** Instantiates an AssemblyScript module from a response using the specified imports. */
async function instantiateStreaming(response, imports) {
  return postInstantiate(
    preInstantiate(imports || (imports = {})),
    (await WebAssembly.instantiateStreaming(response, imports)).instance
  );
}

exports.instantiateStreaming = instantiateStreaming;

/** Demangles an AssemblyScript module's exports to a friendly object structure. */
function demangle(exports, baseModule) {
  var module = baseModule ? Object.create(baseModule) : {};
  var setargc = exports["__setargc"] || function() {};
  function hasOwnProperty(elem, prop) {
    return Object.prototype.hasOwnProperty.call(elem, prop);
  }
  for (let internalName in exports) {
    if (!hasOwnProperty(exports, internalName)) continue;
    let elem = exports[internalName];
    let parts = internalName.split(".");
    let curr = module;
    while (parts.length > 1) {
      let part = parts.shift();
      if (!hasOwnProperty(curr, part)) curr[part] = {};
      curr = curr[part];
    }
    let name = parts[0];
    let hash = name.indexOf("#");
    if (hash >= 0) {
      let className = name.substring(0, hash);
      let classElem = curr[className];
      if (typeof classElem === "undefined" || !classElem.prototype) {
        let ctor = function(...args) {
          return ctor.wrap(ctor.prototype.constructor(0, ...args));
        };
        ctor.prototype = {
          valueOf: function valueOf() {
            return this[THIS];
          }
        };
        ctor.wrap = function(thisValue) {
          return Object.create(ctor.prototype, { [THIS]: { value: thisValue, writable: false } });
        };
        if (classElem) Object.getOwnPropertyNames(classElem).forEach(name =>
          Object.defineProperty(ctor, name, Object.getOwnPropertyDescriptor(classElem, name))
        );
        curr[className] = ctor;
      }
      name = name.substring(hash + 1);
      curr = curr[className].prototype;
      if (/^(get|set):/.test(name)) {
        if (!hasOwnProperty(curr, name = name.substring(4))) {
          let getter = exports[internalName.replace("set:", "get:")];
          let setter = exports[internalName.replace("get:", "set:")];
          Object.defineProperty(curr, name, {
            get: function() { return getter(this[THIS]); },
            set: function(value) { setter(this[THIS], value); },
            enumerable: true
          });
        }
      } else {
        if (name === 'constructor') {
          curr[name] = wrapFunction(elem, setargc);
        } else { // for methods
          Object.defineProperty(curr, name, {
            value: function (...args) {
              setargc(args.length);
              return elem(this[THIS], ...args);
            }
          });
        }
      }
    } else {
      if (/^(get|set):/.test(name)) {
        if (!hasOwnProperty(curr, name = name.substring(4))) {
          Object.defineProperty(curr, name, {
            get: exports[internalName.replace("set:", "get:")],
            set: exports[internalName.replace("get:", "set:")],
            enumerable: true
          });
        }
      } else if (typeof elem === "function") {
        curr[name] = wrapFunction(elem, setargc);
      } else {
        curr[name] = elem;
      }
    }
  }

  return module;
}

exports.demangle = demangle;

},{}],"ts/functions/fibonacci.function.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function javascriptFibonacci(n) {
  if (n === 1) return 1;
  if (n === 2) return 1;
  return javascriptFibonacci(n - 1) + javascriptFibonacci(n - 2);
}

exports.javascriptFibonacci = javascriptFibonacci;
},{}],"ts/functions/get-elapsed-seconds.function.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function getElapsedMiliSeconds(start) {
  var now = Date.now();
  var elapsed = now - start;
  return elapsed + " miliseconds";
}

exports.getElapsedMiliSeconds = getElapsedMiliSeconds;
},{}],"ts/functions/get-input-value.function.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function getNumberFromInput(inputId) {
  return Number(document.getElementById(inputId).value);
}

exports.getNumberFromInput = getNumberFromInput;
},{}],"ts/functions/get-result-string.function.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function getResultString(result, elapsedTime) {
  var resultString = "elapsed time: " + elapsedTime;

  if (result) {
    resultString = "result: " + result + "\n" + resultString;
  }

  return resultString;
}

exports.getResultString = getResultString;
},{}],"ts/functions/output-result.function.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function outputResult(outputId, result) {
  document.getElementById(outputId).textContent = result;
}

exports.outputResult = outputResult;
},{}],"ts/functions/index.ts":[function(require,module,exports) {
"use strict";

function __export(m) {
  for (var p in m) {
    if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

__export(require("./fibonacci.function"));

__export(require("./get-elapsed-seconds.function"));

__export(require("./get-input-value.function"));

__export(require("./get-result-string.function"));

__export(require("./output-result.function"));
},{"./fibonacci.function":"ts/functions/fibonacci.function.ts","./get-elapsed-seconds.function":"ts/functions/get-elapsed-seconds.function.ts","./get-input-value.function":"ts/functions/get-input-value.function.ts","./get-result-string.function":"ts/functions/get-result-string.function.ts","./output-result.function":"ts/functions/output-result.function.ts"}],"ts/index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var element_ids_enum_1 = require("./enums/element-ids.enum");

var loader_1 = require("assemblyscript/lib/loader");

var index_1 = require("./functions/index");

var wasmModule;
var jsWarAndPeaceText;
var wasmWarAndPeaceText;
var imports = {
  env: {
    abort: function abort(_msg, _file, line, column) {
      console.error("abort called at index.ts:" + line + ":" + column);
    },
    logToConsole: function logToConsole(n) {
      console.log("wasm output: " + n);
    }
  }
};
loadWasmModule();
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById(element_ids_enum_1.ElementIds.FibSubmitButton).addEventListener('click', function () {
    calculateFibonacciNumber(index_1.javascriptFibonacci, element_ids_enum_1.ElementIds.JSFibResultParagraph);
    calculateFibonacciNumber(wasmModule.wasmFibonacci, element_ids_enum_1.ElementIds.WasmFibResultParagraph);
  });
  document.getElementById(element_ids_enum_1.ElementIds.WarSubmitButton).addEventListener('click', function () {
    var search = document.getElementById(element_ids_enum_1.ElementIds.SearchStringInput).value;
    var replace = document.getElementById(element_ids_enum_1.ElementIds.ReplaceStringInput).value;
    var startTime;
    var elapsedTime;
    var result;
    startTime = Date.now();
    var re = new RegExp(search, 'g');
    var jsResultString = jsWarAndPeaceText.replace(re, replace);
    elapsedTime = index_1.getElapsedMiliSeconds(startTime);
    result = index_1.getResultString(null, elapsedTime);
    index_1.outputResult(element_ids_enum_1.ElementIds.JSWarResultParagraph, result);
    startTime = Date.now();
    var wasmResult = wasmModule.replaceString(wasmWarAndPeaceText, wasmModule.__allocString(search), wasmModule.__allocString(replace)); //const wasmResultAsString = wasmModule.__getString(wasmResult);

    elapsedTime = index_1.getElapsedMiliSeconds(startTime);
    result = index_1.getResultString(null, elapsedTime);
    index_1.outputResult(element_ids_enum_1.ElementIds.WasmWarResultParagraph, result); //console.log(wasmResultAsString)
  });
});

function loadWasmModule() {
  var url = '/wasm/optimized.wasm';
  fetch(url).then(function (response) {
    return response.arrayBuffer();
  }).then(function (bytes) {
    return loader_1.instantiateBuffer(new Uint8Array(bytes), imports);
  }).then(function (bytes) {
    return wasmModule = bytes;
  }).then(function (_) {
    loadWarAndPeace();
  });
}

function loadWarAndPeace() {
  var url = 'https://www.gutenberg.org/files/2600/2600-0.txt';
  fetch(url).then(function (response) {
    return response.text();
  }).then(function (text) {
    jsWarAndPeaceText = text;
    wasmWarAndPeaceText = wasmModule.__allocString(text);
    console.log('war and peace loaded', wasmWarAndPeaceText);
  });
}

function calculateFibonacciNumber(fibonacciFunc, outputId) {
  var inputValue = index_1.getNumberFromInput(element_ids_enum_1.ElementIds.NumberInput);
  var startTime;
  var elapsedTime;
  startTime = Date.now();
  var fib = fibonacciFunc(inputValue);
  elapsedTime = index_1.getElapsedMiliSeconds(startTime);
  var result = index_1.getResultString(fib, elapsedTime);
  index_1.outputResult(outputId, result);
}
},{"./enums/element-ids.enum":"ts/enums/element-ids.enum.ts","assemblyscript/lib/loader":"../node_modules/assemblyscript/lib/loader/index.js","./functions/index":"ts/functions/index.ts"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "41871" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","ts/index.ts"], null)
//# sourceMappingURL=/ts.841fc46b.js.map