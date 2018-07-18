/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * @namespace The global gadgets namespace
 * @type {Object} 
 */
var gadgets = gadgets || {}; 

/** 
 * @namespace The global shindig namespace, used for shindig specific extensions and data
 * @type {Object} 
 */
var shindig = shindig || {};

/** 
 * @namespace The global osapi namespace, used for opensocial API specific extensions
 * @type {Object} 
 */
var osapi = osapi || {};
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview Provides unified configuration for all features.
 *
 *
 * <p>This is a custom shindig library that has not yet been submitted for
 * standardization. It is designed to make developing of features for the
 * opensocial / gadgets platforms easier and is intended as a supplemental
 * tool to Shindig's standardized feature loading mechanism.
 *
 * <p>Usage:
 * First, you must register a component that needs configuration:
 * <pre>
 *   var config = {
 *     name : gadgets.config.NonEmptyStringValidator,
 *     url : new gadgets.config.RegExValidator(/.+%mySpecialValue%.+/)
 *   };
 *   gadgets.config.register("my-feature", config, myCallback);
 * </pre>
 *
 * <p>This will register a component named "my-feature" that expects input config
 * containing a "name" field with a value that is a non-empty string, and a
 * "url" field with a value that matches the given regular expression.
 *
 * <p>When gadgets.config.init is invoked by the container, it will automatically
 * validate your registered configuration and will throw an exception if
 * the provided configuration does not match what was required.
 *
 * <p>Your callback will be invoked by passing all configuration data passed to
 * gadgets.config.init, which allows you to optionally inspect configuration
 * from other features, if present.
 *
 * <p>Note that the container may optionally bypass configuration validation for
 * performance reasons. This does not mean that you should duplicate validation
 * code, it simply means that validation will likely only be performed in debug
 * builds, and you should assume that production builds always have valid
 * configuration.
 */

/** @namespace */
gadgets.config = function() {
  var components = {};
  var configuration;

  return {
    'register':
    /**
     * Registers a configurable component and its configuration parameters.
     * Multiple callbacks may be registered for a single component if needed.
     *
     * @param {string} component The name of the component to register. Should
     *     be the same as the fully qualified name of the <Require> feature or
     *     the name of a fully qualified javascript object reference
     *     (e.g. "gadgets.io").
     * @param {Object=} opt_validators Mapping of option name to validation
     *     functions that take the form function(data) {return isValid(data);}
     * @param {function(Object)=} opt_callback A function to be invoked when a
     *     configuration is registered. If passed, this function will be invoked
     *     immediately after a call to init has been made. Do not assume that
     *     dependent libraries have been configured until after init is
     *     complete. If you rely on this, it is better to defer calling
     *     dependent libraries until you can be sure that configuration is
     *     complete. Takes the form function(config), where config will be
     *     all registered config data for all components. This allows your
     *     component to read configuration from other components.
     * @member gadgets.config
     * @name register
     * @function
     */
    function(component, opt_validators, opt_callback) {
      var registered = components[component];
      if (!registered) {
        registered = [];
        components[component] = registered;
      }

      registered.push({
        validators: opt_validators || {},
        callback: opt_callback
      });
    },

    'get':
    /**
     * Retrieves configuration data on demand.
     *
     * @param {string=} opt_component The component to fetch. If not provided
     *     all configuration will be returned.
     * @return {Object} The requested configuration, or an empty object if no
     *     configuration has been registered for that component.
     * @member gadgets.config
     * @name get
     * @function
     */
    function(opt_component) {
      if (opt_component) {
        return configuration[opt_component] || {};
      }
      return configuration;
    },

    /**
     * Initializes the configuration.
     *
     * @param {Object} config The full set of configuration data.
     * @param {boolean=} opt_noValidation True if you want to skip validation.
     * @throws {Error} If there is a configuration error.
     * @member gadgets.config
     * @name init 
     * @function
     */
    'init': function(config, opt_noValidation) {
      configuration = config;
      for (var name in components) {
        if (components.hasOwnProperty(name)) {
          var componentList = components[name],
              conf = config[name];

          for (var i = 0, j = componentList.length; i < j; ++i) {
            var component = componentList[i];
            if (conf && !opt_noValidation) {
              var validators = component.validators;
              for (var v in validators) {
                if (validators.hasOwnProperty(v)) {
                  if (!validators[v](conf[v])) {
                    throw new Error('Invalid config value "' + conf[v] +
                        '" for parameter "' + v + '" in component "' +
                        name + '"');
                  }
                }
              }
            }

            if (component.callback) {
              component.callback(config);
            }
          }
        }
      }
    },

    // Standard validators go here.

    /**
     * Ensures that data is one of a fixed set of items.
     * Also supports argument sytax: EnumValidator("Dog", "Cat", "Fish");
     *
     * @param {Array.<string>} list The list of valid values.
     *
     * @member gadgets.config
     * @name  EnumValidator
     * @function
     */
    'EnumValidator': function(list) {
      var listItems = [];
      if (arguments.length > 1) {
        for (var i = 0, arg; (arg = arguments[i]); ++i) {
          listItems.push(arg);
        }
      } else {
        listItems = list;
      }
      return function(data) {
        for (var i = 0, test; (test = listItems[i]); ++i) {
          if (data === listItems[i]) {
            return true;
          }
        }
        return false;
      };
    },

    /**
     * Tests the value against a regular expression.
     * @member gadgets.config
     * @name RegexValidator
     * @function
     */
    'RegExValidator': function(re) {
      return function(data) {
        return re.test(data);
      };
    },

    /**
     * Validates that a value was provided.
     * @param {*} data
     * @member gadgets.config
     * @name ExistsValidator
     * @function
     */
    'ExistsValidator': function(data) {
      return typeof data !== "undefined";
    },

    /**
     * Validates that a value is a non-empty string.
     * @param {*} data
     * @member gadgets.config
     * @name NonEmptyStringValidator
     * @function
     */
    'NonEmptyStringValidator': function(data) {
      return typeof data === "string" && data.length > 0;
    },

    /**
     * Validates that the value is a boolean.
     * @param {*} data
     * @member gadgets.config
     * @name BooleanValidator
     * @function
     */
    'BooleanValidator': function(data) {
      return typeof data === "boolean";
    },

    /**
     * Similar to the ECMAScript 4 virtual typing system, ensures that
     * whatever object was passed in is "like" the existing object.
     * Doesn't actually do type validation though, but instead relies
     * on other validators.
     *
     * This can be used recursively as well to validate sub-objects.
     *
     * @example
     *
     *  var validator = new gadgets.config.LikeValidator(
     *    "booleanField" : gadgets.config.BooleanValidator,
     *    "regexField" : new gadgets.config.RegExValidator(/foo.+/);
     *  );
     *
     *
     * @param {Object} test The object to test against.
     * @member gadgets.config
     * @name BooleanValidator
     * @function
     */
    'LikeValidator' : function(test) {
      return function(data) {
        for (var member in test) {
          if (test.hasOwnProperty(member)) {
            var t = test[member];
            if (!t(data[member])) {
              return false;
            }
          }
        }
        return true;
      };
    }
  };
}();
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview Provides gadget/container configuration flags.
 */

/** @type {boolean} */
gadgets.config.isGadget = false;
/** @type {boolean} */
gadgets.config.isContainer = true;
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview Support for basic logging capability for gadgets.
 *
 * This functionality replaces alert(msg) and window.console.log(msg).
 *
 * <p>Currently only works on browsers with a console (WebKit based browsers,
 * Firefox with Firebug extension, or Opera).
 *
 * <p>API is designed to be equivalent to existing console.log | warn | error
 * logging APIs supported by Firebug and WebKit based browsers. The only
 * addition is the ability to call gadgets.setLogLevel().
 */

/**
 * @static
 * @namespace Support for basic logging capability for gadgets.
 * @name gadgets.log
 */

gadgets['log'] = (function() {
   /** @const */
   var info_=1;
   /** @const */
   var warning_=2;
   /** @const */
   var error_=3;
   /** @const */
   var none_=4;

/**
 * Log an informational message
 * @param {Object} message - the message to log
 * @member gadgets
 * @name log
 * @function
 */
var log = function(message) {
  logAtLevel(info_, message);
};
 
/**
 * Log a warning
 * @param {Object} message - the message to log
 * @static 
 */
gadgets.warn = function(message) {
  logAtLevel(warning_, message);
};

/**
 * Log an error
 * @param {Object} message - The message to log
 * @static 
 */
gadgets.error = function(message) {
  logAtLevel(error_, message);
};

/**
 * Sets the log level threshold.
 * @param {number} logLevel - New log level threshold.
 * @static
 * @member gadgets.log
 * @name setLogLevel
 */
gadgets['setLogLevel'] = function(logLevel) {
  logLevelThreshold_ = logLevel;
};

/**
 * Logs a log message if output console is available, and log threshold is met.
 * @param {number} level - the level to log with. Optional, defaults to gadgets.log.INFO.
 * @param {Object} message - The message to log
 * @private
 */
 function logAtLevel(level, message) {
  if (level < logLevelThreshold_ || !_console) {
    return;
  }

  if (level === warning_ && _console.warn) {
    _console.warn(message);
  } else if (level === error_ && _console.error) {
    _console.error(message);
  } else if (_console.log) {
    _console.log(message);
  }
};

/**
 * Log level for informational logging.
 * @static
 * @const
 * @member gadgets.log
 * @name INFO
 */
log['INFO'] = info_;

/**
 * Log level for warning logging.
 * @static
 * @const
 * @member gadgets.log
 * @name WARNING
 */
log['WARNING'] = warning_;

/**
 * Log level for no logging
 * @static
 * @const
 * @member gadgets.log
 * @name NONE
 */
log['NONE'] = none_;

/**
 * Current log level threshold.
 * @type {number}
 * @private
 */
var logLevelThreshold_ = info_;



/**
 * Console to log to
 * @private
 * @static
 */
var _console = window.console ? window.console :
                       window.opera   ? window.opera.postError : undefined;

   return log; 
})();
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose core gadgets.* API to cajoled gadgets
 */
var tamings___ = tamings___ || [];
tamings___.push(function(imports) {
  ___.grantRead(gadgets.log, 'INFO');
  ___.grantRead(gadgets.log, 'WARNING');
  ___.grantRead(gadgets.log, 'ERROR');
  ___.grantRead(gadgets.log, 'NONE');
  caja___.whitelistFuncs([
    [gadgets, 'log'],
    [gadgets, 'warn'],
    [gadgets, 'error'],
    [gadgets, 'setLogLevel']
  ]);
});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview
 * The global object gadgets.json contains two methods.
 *
 * gadgets.json.stringify(value) takes a JavaScript value and produces a JSON
 * text. The value must not be cyclical.
 *
 * gadgets.json.parse(text) takes a JSON text and produces a JavaScript value.
 * It will return false if there is an error.
 */

/**
 * @static
 * @class Provides operations for translating objects to and from JSON.
 * @name gadgets.json
 */

/**
 * Port of the public domain JSON library by Douglas Crockford.
 * See: http://www.json.org/json2.js
 */
if (window.JSON && window.JSON.parse && window.JSON.stringify) {
  // HTML5 implementation, or already defined.
  // Not a direct alias as the opensocial specification disagrees with the HTML5 JSON spec.
  // JSON says to throw on parse errors and to support filtering functions. OS does not.
  gadgets['json'] = (function() {
    var endsWith___ = /___$/;
    return {
      /* documented below */
      'parse': function(str) {
        try {
          return window.JSON.parse(str);
        } catch (e) {
          return false;
        }
      },
      /* documented below */
      'stringify': function(obj) {
        try {
          return window.JSON.stringify(obj, function(k,v) {
            return !endsWith___.test(k) ? v : null;
          });
        } catch (e) {
          return null;
        }
      }
    };
  })();
} else {
/**
 * Port of the public domain JSON library by Douglas Crockford.
 * See: http://www.json.org/json2.js
 */
  gadgets['json'] = function () {
  
    /**
     * Formats integers to 2 digits.
     * @param {number} n
     * @private
     */
    function f(n) {
      return n < 10 ? '0' + n : n;
    }
  
    Date.prototype.toJSON = function () {
      return [this.getUTCFullYear(), '-',
             f(this.getUTCMonth() + 1), '-',
             f(this.getUTCDate()), 'T',
             f(this.getUTCHours()), ':',
             f(this.getUTCMinutes()), ':',
             f(this.getUTCSeconds()), 'Z'].join("");
    };
  
    // table of character substitutions
    /**
     * @const
     * @enum {string}
     */
    var m = {
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"' : '\\"',
      '\\': '\\\\'
    };
  
    /**
     * Converts a json object into a string.
     * @param {*} value
     * @return {string}
     * @member gadgets.json
     */
    function stringify(value) {
      var a,          // The array holding the partial texts.
          i,          // The loop counter.
          k,          // The member key.
          l,          // Length.
          r = /["\\\x00-\x1f\x7f-\x9f]/g,
          v;          // The member value.
  
      switch (typeof value) {
      case 'string':
      // If the string contains no control characters, no quote characters, and no
      // backslash characters, then we can safely slap some quotes around it.
      // Otherwise we must also replace the offending characters with safe ones.
        return r.test(value) ?
            '"' + value.replace(r, function (a) {
              var c = m[a];
              if (c) {
                return c;
              }
              c = a.charCodeAt();
              return '\\u00' + Math.floor(c / 16).toString(16) +
                  (c % 16).toString(16);
              }) + '"' : '"' + value + '"';
      case 'number':
      // JSON numbers must be finite. Encode non-finite numbers as null.
        return isFinite(value) ? String(value) : 'null';
      case 'boolean':
      case 'null':
        return String(value);
      case 'object':
      // Due to a specification blunder in ECMAScript,
      // typeof null is 'object', so watch out for that case.
        if (!value) {
          return 'null';
        }
        // toJSON check removed; re-implement when it doesn't break other libs.
        a = [];
        if (typeof value.length === 'number' &&
            !value.propertyIsEnumerable('length')) {
          // The object is an array. Stringify every element. Use null as a
          // placeholder for non-JSON values.
          l = value.length;
          for (i = 0; i < l; i += 1) {
            a.push(stringify(value[i]) || 'null');
          }
          // Join all of the elements together and wrap them in brackets.
          return '[' + a.join(',') + ']';
        }
        // Otherwise, iterate through all of the keys in the object.
        for (k in value) {
          if (k.match('___$'))
            continue;
          if (value.hasOwnProperty(k)) {
            if (typeof k === 'string') {
              v = stringify(value[k]);
              if (v) {
                a.push(stringify(k) + ':' + v);
              }
            }
          }
        }
        // Join all of the member texts together and wrap them in braces.
        return '{' + a.join(',') + '}';
      }
      return "undefined";
    }
  
    return {
      'stringify': stringify,
      'parse': function (text) {
      // Parsing happens in three stages. In the first stage, we run the text against
      // regular expressions that look for non-JSON patterns. We are especially
      // concerned with '()' and 'new' because they can cause invocation, and '='
      // because it can cause mutation. But just to be safe, we want to reject all
      // unexpected forms.
      
      // We split the first stage into 4 regexp operations in order to work around
      // crippling inefficiencies in IE's and Safari's regexp engines. First we
      // replace all backslash pairs with '@' (a non-JSON character). Second, we
      // replace all simple value tokens with ']' characters. Third, we delete all
      // open brackets that follow a colon or comma or that begin the text. Finally,
      // we look to see that the remaining characters are only whitespace or ']' or
      // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
  
        if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/b-u]/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
          return eval('(' + text + ')');
        }
        // If the text is not JSON parseable, then return false.
  
        return false;
      }
    };
  }();
}
/**
 * Flatten an object to a stringified values. Useful for dealing with
 * json->querystring transformations. 
 * 
 * @param obj {Object}
 * @return {Object} object with only string values
 * @private not in official specification yet
 */

gadgets['json'].flatten = function(obj) {
  var flat = {};

  if (obj === null || obj === undefined) return flat;

  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      var value = obj[k];
      if (null === value || undefined === value) {
        continue;
      }
      flat[k] = (typeof value === 'string') ? value : gadgets.json.stringify(value);
    }
  }
  return flat;
}
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose core gadgets.* API to cajoled gadgets
 */
var tamings___ = tamings___ || [];
tamings___.push(function(imports) {
    ___.tamesTo(gadgets.json.stringify, safeJSON.stringify);
    ___.tamesTo(gadgets.json.parse, safeJSON.parse);
});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview General purpose utilities that gadgets can use.
 */

/**
 * @static
 * @class Provides general-purpose utility functions.
 * @name gadgets.util
 */

gadgets['util'] = function() {
  /**
   * Parses URL parameters into an object.
   * @param {string} url - the url parameters to parse
   * @return {Array.<string>} The parameters as an array
   */
  function parseUrlParams(url) {
    // Get settings from url, 'hash' takes precedence over 'search' component
    // don't use document.location.hash due to browser differences.
    var query;
    var queryIdx = url.indexOf("?");
    var hashIdx = url.indexOf("#");
    if (hashIdx === -1) {
      query = url.substr(queryIdx + 1);
    } else {
      // essentially replaces "#" with "&"
      query = [url.substr(queryIdx + 1, hashIdx - queryIdx - 1), "&",
               url.substr(hashIdx + 1)].join("");
    }
    return query.split("&");
  }

  var parameters = null;
  var features = {};
  var services = {};
  var onLoadHandlers = [];

  /**
   * @enum {boolean}
   * @const
   * @private
   * Maps code points to the value to replace them with.
   * If the value is "false", the character is removed entirely, otherwise
   * it will be replaced with an html entity.
   */
  
  var escapeCodePoints = {
   // nul; most browsers truncate because they use c strings under the covers.
   0 : false,
   // new line
   10 : true,
   // carriage return
   13 : true,
   // double quote
   34 : true,
   // single quote
   39 : true,
   // less than
   60 : true,
   // greater than
   62 : true,
   // Backslash
   92 : true,
   // line separator
   8232 : true,
   // paragraph separator
   8233 : true
  };

  /**
   * Regular expression callback that returns strings from unicode code points.
   *
   * @param {Array} match Ignored
   * @param {number} value The codepoint value to convert
   * @return {string} The character corresponding to value.
   */
  function unescapeEntity(match, value) {
    return String.fromCharCode(value);
  }

  /**
   * Initializes feature parameters.
   */
  function init(config) {
    features = config["core.util"] || {};
  }
  if (gadgets.config) {
    gadgets.config.register("core.util", null, init);
  }

  return /** @scope gadgets.util */ {

    /**
     * Gets the URL parameters.
     *
     * @param {string=} opt_url Optional URL whose parameters to parse.
     *                         Defaults to window's current URL.
     * @return {Object} Parameters passed into the query string
     * @member gadgets.util
     * @private Implementation detail.
     */
    'getUrlParameters' : function (opt_url) {
      var no_opt_url = typeof opt_url === "undefined";
      if (parameters !== null && no_opt_url) {
        // "parameters" is a cache of current window params only.
        return parameters;
      }
      var parsed = {};
      var pairs = parseUrlParams(opt_url || document.location.href);
      var unesc = window.decodeURIComponent ? decodeURIComponent : unescape;
      for (var i = 0, j = pairs.length; i < j; ++i) {
        var pos = pairs[i].indexOf('=');
        if (pos === -1) {
          continue;
        }
        var argName = pairs[i].substring(0, pos);
        var value = pairs[i].substring(pos + 1);
        // difference to IG_Prefs, is that args doesn't replace spaces in
        // argname. Unclear on if it should do:
        // argname = argname.replace(/\+/g, " ");
        value = value.replace(/\+/g, " ");
        parsed[argName] = unesc(value);
      }
      if (no_opt_url) {
        // Cache current-window params in parameters var.
        parameters = parsed;
      }
      return parsed;
    },

    /**
     * Creates a closure that is suitable for passing as a callback.
     * Any number of arguments
     * may be passed to the callback;
     * they will be received in the order they are passed in.
     *
     * @param {Object} scope The execution scope; may be null if there is no
     *     need to associate a specific instance of an object with this
     *     callback
     * @param {function(Object,Object)} callback The callback to invoke when this is run;
     *     any arguments passed in will be passed after your initial arguments
     * @param {Object} var_args Initial arguments to be passed to the callback
     *
     * @member gadgets.util
     * @private Implementation detail.
     */
    'makeClosure' : function (scope, callback, var_args) {
      // arguments isn't a real array, so we copy it into one.
      var baseArgs = [];
      for (var i = 2, j = arguments.length; i < j; ++i) {
       baseArgs.push(arguments[i]);
      }
      return function() {
        // append new arguments.
        var tmpArgs = baseArgs.slice();
        for (var i = 0, j = arguments.length; i < j; ++i) {
          tmpArgs.push(arguments[i]);
        }
        return callback.apply(scope, tmpArgs);
      };
    },

    /**
     * Utility function for generating an "enum" from an array.
     *
     * @param {Array.<string>} values The values to generate.
     * @return {Object.<string,string>} An object with member fields to handle
     *   the enum.
     *
     * @private Implementation detail.
     */
    'makeEnum' : function (values) {
      var i, v, obj = {};
      for (i = 0; (v = values[i]); ++i) {
        obj[v] = v;
      }
      return obj;
    },

    /**
     * Gets the feature parameters.
     *
     * @param {string} feature The feature to get parameters for
     * @return {Object} The parameters for the given feature, or null
     *
     * @member gadgets.util
     */
    'getFeatureParameters' : function (feature) {
      return typeof features[feature] === "undefined" ? null : features[feature];
    },

    /**
     * Returns whether the current feature is supported.
     *
     * @param {string} feature The feature to test for
     * @return {boolean} True if the feature is supported
     *
     * @member gadgets.util
     */
    'hasFeature' : function (feature) {
      return typeof features[feature] !== "undefined";
    },
    
    /**
     * Returns the list of services supported by the server
     * serving this gadget.
     *
     * @return {Object} List of Services that enumerate their methods
     *
     * @member gadgets.util
     */
    'getServices' : function () {
      return services;
    },

    /**
     * Registers an onload handler.
     * @param {function()} callback The handler to run
     *
     * @member gadgets.util
     */
    'registerOnLoadHandler' : function (callback) {
      onLoadHandlers.push(callback);
    },

    /**
     * Runs all functions registered via registerOnLoadHandler.
     * @private Only to be used by the container, not gadgets.
     */
    'runOnLoadHandlers' : function () {
      for (var i = 0, j = onLoadHandlers.length; i < j; ++i) {
        onLoadHandlers[i]();
      }
    },

    /**
     * Escapes the input using html entities to make it safer.
     *
     * If the input is a string, uses gadgets.util.escapeString.
     * If it is an array, calls escape on each of the array elements
     * if it is an object, will only escape all the mapped keys and values if
     * the opt_escapeObjects flag is set. This operation involves creating an
     * entirely new object so only set the flag when the input is a simple
     * string to string map.
     * Otherwise, does not attempt to modify the input.
     *
     * @param {Object} input The object to escape
     * @param {boolean=} opt_escapeObjects Whether to escape objects.
     * @return {Object} The escaped object
     * @private Only to be used by the container, not gadgets.
     */
    'escape' : function(input, opt_escapeObjects) {
      if (!input) {
        return input;
      } else if (typeof input === "string") {
        return gadgets.util.escapeString(input);
      } else if (typeof input === "array") {
        for (var i = 0, j = input.length; i < j; ++i) {
          input[i] = gadgets.util.escape(input[i]);
        }
      } else if (typeof input === "object" && opt_escapeObjects) {
        var newObject = {};
        for (var field in input) {
          if (input.hasOwnProperty(field)) {
            newObject[gadgets.util.escapeString(field)] = gadgets.util.escape(input[field], true);
          }
        }
        return newObject;
      }
      return input;
    },

    /**
     * Escapes the input using html entities to make it safer.
     *
     * Currently not in the spec -- future proposals may change
     * how this is handled.
     *
     * TODO: Parsing the string would probably be more accurate and faster than
     * a bunch of regular expressions.
     *
     * @param {string} str The string to escape
     * @return {string} The escaped string
     */
    'escapeString' : function(str) {
      if (!str) return str;
      var out = [], ch, shouldEscape;
      for (var i = 0, j = str.length; i < j; ++i) {
        ch = str.charCodeAt(i);
        shouldEscape = escapeCodePoints[ch];
        if (shouldEscape === true) {
          out.push("&#", ch, ";");
        } else if (shouldEscape !== false) {
          // undefined or null are OK.
          out.push(str.charAt(i));
        }
      }
      return out.join("");
    },

    /**
     * Reverses escapeString
     *
     * @param {string} str The string to unescape.
     * @return {string}
     */
    'unescapeString' : function(str) {
      if (!str) return str;
      return str.replace(/&#([0-9]+);/g, unescapeEntity);
    },


    /**
     * Attach an event listener to given DOM element (Not a gadget standard)
     * 
     * @param {Object} elem  DOM element on which to attach event.
     * @param {string} eventName  Event type to listen for.
     * @param {function()} callback  Invoked when specified event occurs.
     * @param {boolean} useCapture  If true, initiates capture.
     */
    'attachBrowserEvent': function(elem, eventName, callback, useCapture) {
      if (typeof elem.addEventListener != 'undefined') {
        elem.addEventListener(eventName, callback, useCapture);
      } else if (typeof elem.attachEvent != 'undefined') {
        elem.attachEvent('on' + eventName, callback);
      } else {
        gadgets.warn("cannot attachBrowserEvent: " + eventName);
      }
    },

    /**
     * Remove event listener. (Shindig internal implementation only)
     * 
     * @param {Object} elem  DOM element from which to remove event.
     * @param {string} eventName  Event type to remove.
     * @param {function()} callback  Listener to remove.
     * @param {boolean} useCapture  Specifies whether listener being removed was added with
     *                              capture enabled.
     */
    'removeBrowserEvent': function(elem, eventName, callback, useCapture) {
      if (elem.removeEventListener) {
        elem.removeEventListener(eventName, callback, useCapture);
      } else if (elem.detachEvent){
        elem.detachEvent('on' + eventName, callback);
      } else {
        gadgets.warn("cannot removeBrowserEvent: " + eventName);
      }
    }
  };
}();
// Initialize url parameters so that hash data is pulled in before it can be
// altered by a click.
gadgets['util'].getUrlParameters();

;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose core gadgets.* API to cajoled gadgets
 */
var tamings___ = tamings___ || [];
tamings___.push(function(imports) {
  caja___.whitelistFuncs([
    [gadgets.util, 'escapeString'],
    [gadgets.util, 'getFeatureParameters'],
    [gadgets.util, 'getUrlParameters'],
    [gadgets.util, 'hasFeature'],
    [gadgets.util, 'registerOnLoadHandler'],
    [gadgets.util, 'unescapeString']
  ]);
});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

gadgets.rpctx = gadgets.rpctx || {};

/**
 * Transport for browsers that support native messaging (various implementations
 * of the HTML5 postMessage method). Officially defined at
 * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html.
 *
 * postMessage is a native implementation of XDC. A page registers that
 * it would like to receive messages by listening the the "message" event
 * on the window (document in DPM) object. In turn, another page can
 * raise that event by calling window.postMessage (document.postMessage
 * in DPM) with a string representing the message and a string
 * indicating on which domain the receiving page must be to receive
 * the message. The target page will then have its "message" event raised
 * if the domain matches and can, in turn, check the origin of the message
 * and process the data contained within.
 *
 *   wpm: postMessage on the window object.
 *      - Internet Explorer 8+
 *      - Safari 4+
 *      - Chrome 2+
 *      - Webkit nightlies
 *      - Firefox 3+
 *      - Opera 9+
 */
if (!gadgets.rpctx.wpm) {  // make lib resilient to double-inclusion

gadgets.rpctx.wpm = function() {
  var process, ready;
  var postMessage;
  var pmSync = false;
  var pmEventDomain = false;
  var isForceSecure = false;

  // Some browsers (IE, Opera) have an implementation of postMessage that is
  // synchronous, although HTML5 specifies that it should be asynchronous.  In
  // order to make all browsers behave consistently, we run a small test to detect
  // if postMessage is asynchronous or not.  If not, we wrap calls to postMessage
  // in a setTimeout with a timeout of 0.
  // Also, Opera's "message" event does not have an "origin" property (at least,
  // it doesn't in version 9.64;  presumably, it will in version 10).  If
  // event.origin does not exist, use event.domain.  The other difference is that
  // while event.origin looks like <scheme>://<hostname>:<port>, event.domain
  // consists only of <hostname>.
  //
  function testPostMessage() {
    var hit = false;
    function receiveMsg(event) {
      if (event.data == "postmessage.test") {
        hit = true;
        if (typeof event.origin === "undefined") {
          pmEventDomain = true;
        }
      }
    }
    
    gadgets.util.attachBrowserEvent(window, "message", receiveMsg, false);
    window.postMessage("postmessage.test", "*");
    
    // if 'hit' is true here, then postMessage is synchronous
    if (hit) {
      pmSync = true;
    }
    
    gadgets.util.removeBrowserEvent(window, "message", receiveMsg, false);
  }

  function onmessage(packet) {
    var rpc = gadgets.json.parse(packet.data);
    if (isForceSecure) {
      if (!rpc || !rpc.f) {
        return;
      }
    
      // for security, check origin against expected value
      var origRelay = gadgets.rpc.getRelayUrl(rpc.f) ||
                      gadgets.util.getUrlParameters()["parent"];
      var origin = gadgets.rpc.getOrigin(origRelay);
      if (!pmEventDomain ? packet.origin !== origin :
                           packet.domain !== /^.+:\/\/([^:]+).*/.exec( origin )[1]) {
        return;
      }
    }
    process(rpc);
  }

  return {
    getCode: function() {
      return 'wpm';
    },

    isParentVerifiable: function() {
      return true;
    },

    init: function(processFn, readyFn) {
      process = processFn;
      ready = readyFn;

      testPostMessage();
      if (!pmSync) {
        postMessage = function(win, msg, origin) {
          win.postMessage(msg, origin);
        };
      } else {
        postMessage = function(win, msg, origin) {
          window.setTimeout( function() {
            win.postMessage(msg, origin);
          }, 0);
        };
      }
 
      // Set up native postMessage handler.
      gadgets.util.attachBrowserEvent(window, 'message', onmessage, false);

      ready('..', true);  // Immediately ready to send to parent.
      return true;
    },

    setup: function(receiverId, token, forceSecure) {
      isForceSecure = forceSecure;
      // If we're a gadget, send an ACK message to indicate to container
      // that we're ready to receive messages.
      if (receiverId === '..') {
        if (isForceSecure) {
          gadgets.rpc._createRelayIframe(token);
        } else {
          gadgets.rpc.call(receiverId, gadgets.rpc.ACK);
        }
      }
      return true;
    },

    call: function(targetId, from, rpc) {
      var targetWin = gadgets.rpc._getTargetWin(targetId);

      // targetOrigin = canonicalized relay URL
      var origRelay = gadgets.rpc.getRelayUrl(targetId) ||
                      gadgets.util.getUrlParameters()["parent"];
      var origin = gadgets.rpc.getOrigin(origRelay);
      if (origin) {
        postMessage(targetWin, gadgets.json.stringify(rpc), origin);
      } else {
        gadgets.error("No relay set (used as window.postMessage targetOrigin)" +
            ", cannot send cross-domain message");
      }
      return true;
    },

    relayOnload: function(receiverId, data) {
      ready(receiverId, true);
    }
  };
}();

} // !end of double-inclusion guard
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

gadgets.rpctx = gadgets.rpctx || {};

/*
 * For Gecko-based browsers, the security model allows a child to call a
 * function on the frameElement of the iframe, even if the child is in
 * a different domain. This method is dubbed "frameElement" (fe).
 *
 * The ability to add and call such functions on the frameElement allows
 * a bidirectional channel to be setup via the adding of simple function
 * references on the frameElement object itself. In this implementation,
 * when the container sets up the authentication information for that gadget
 * (by calling setAuth(...)) it as well adds a special function on the
 * gadget's iframe. This function can then be used by the gadget to send
 * messages to the container. In turn, when the gadget tries to send a
 * message, it checks to see if this function has its own function stored
 * that can be used by the container to call the gadget. If not, the
 * function is created and subsequently used by the container.
 * Note that as a result, FE can only be used by a container to call a
 * particular gadget *after* that gadget has called the container at
 * least once via FE.
 *
 *   fe: Gecko-specific frameElement trick.
 *      - Firefox 1+
 */
if (!gadgets.rpctx.frameElement) {  // make lib resilient to double-inclusion

gadgets.rpctx.frameElement = function() {
  // Consts for FrameElement.
  var FE_G2C_CHANNEL = '__g2c_rpc';
  var FE_C2G_CHANNEL = '__c2g_rpc';
  var process;
  var ready;

  function callFrameElement(targetId, from, rpc) {
    try {
      if (from !== '..') {
        // Call from gadget to the container.
        var fe = window.frameElement;

        if (typeof fe[FE_G2C_CHANNEL] === 'function') {
          // Complete the setup of the FE channel if need be.
          if (typeof fe[FE_G2C_CHANNEL][FE_C2G_CHANNEL] !== 'function') {
            fe[FE_G2C_CHANNEL][FE_C2G_CHANNEL] = function(args) {
              process(gadgets.json.parse(args));
            };
          }

          // Conduct the RPC call.
          fe[FE_G2C_CHANNEL](gadgets.json.stringify(rpc));
          return true;
        }
      } else {
        // Call from container to gadget[targetId].
        var frame = document.getElementById(targetId);

        if (typeof frame[FE_G2C_CHANNEL] === 'function' &&
            typeof frame[FE_G2C_CHANNEL][FE_C2G_CHANNEL] === 'function') {

          // Conduct the RPC call.
          frame[FE_G2C_CHANNEL][FE_C2G_CHANNEL](gadgets.json.stringify(rpc));
          return true;
        }
      }
    } catch (e) {
    }
    return false;
  }

  return {
    getCode: function() {
      return 'fe';
    },

    isParentVerifiable: function() {
      return false;
    },
  
    init: function(processFn, readyFn) {
      // No global setup.
      process = processFn;
      ready = readyFn;
      return true;
    },

    setup: function(receiverId, token) {
      // Indicate OK to call to container. This will be true
      // by the end of this method.
      if (receiverId !== '..') {
        try {
          var frame = document.getElementById(receiverId);
          frame[FE_G2C_CHANNEL] = function(args) {
            process(gadgets.json.parse(args));
          };
        } catch (e) {
          return false;
        }
      }
      if (receiverId === '..') {
        ready('..', true);
        var ackFn = function() {
          window.setTimeout(function() {
            gadgets.rpc.call(receiverId, gadgets.rpc.ACK);
          }, 500);
        };
        // Setup to container always happens before onload.
        // If it didn't, the correct fix would be in gadgets.util.
        gadgets.util.registerOnLoadHandler(ackFn);
      }
      return true;
    },

    call: function(targetId, from, rpc) {
      return callFrameElement(targetId, from, rpc);
    } 

  };
}();

} // !end of double-inclusion guard
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

gadgets.rpctx = gadgets.rpctx || {};

/**
 * For Internet Explorer before version 8, the security model allows anyone
 * parent to set the value of the "opener" property on another window,
 * with only the receiving window able to read it.
 * This method is dubbed "Native IE XDC" (NIX).
 *
 * This method works by placing a handler object in the "opener" property
 * of a gadget when the container sets up the authentication information
 * for that gadget (by calling setAuthToken(...)). At that point, a NIX
 * wrapper is created and placed into the gadget by calling
 * theframe.contentWindow.opener = wrapper. Note that as a result, NIX can
 * only be used by a container to call a particular gadget *after* that
 * gadget has called the container at least once via NIX.
 *
 * The NIX wrappers in this RPC implementation are instances of a VBScript
 * class that is created when this implementation loads. The reason for
 * using a VBScript class stems from the fact that any object can be passed
 * into the opener property.
 * While this is a good thing, as it lets us pass functions and setup a true
 * bidirectional channel via callbacks, it opens a potential security hole
 * by which the other page can get ahold of the "window" or "document"
 * objects in the parent page and in turn wreak havok. This is due to the
 * fact that any JS object useful for establishing such a bidirectional
 * channel (such as a function) can be used to access a function
 * (eg. obj.toString, or a function itself) created in a specific context,
 * in particular the global context of the sender. Suppose container
 * domain C passes object obj to gadget on domain G. Then the gadget can
 * access C's global context using:
 * var parentWindow = (new obj.toString.constructor("return window;"))();
 * Nulling out all of obj's properties doesn't fix this, since IE helpfully
 * restores them to their original values if you do something like:
 * delete obj.toString; delete obj.toString;
 * Thus, we wrap the necessary functions and information inside a VBScript
 * object. VBScript objects in IE, like DOM objects, are in fact COM
 * wrappers when used in JavaScript, so we can safely pass them around
 * without worrying about a breach of context while at the same time
 * allowing them to act as a pass-through mechanism for information
 * and function calls. The implementation details of this VBScript wrapper
 * can be found in the setupChannel() method below.
 *
 *   nix: Internet Explorer-specific window.opener trick.
 *     - Internet Explorer 6
 *     - Internet Explorer 7
 */
if (!gadgets.rpctx.nix) {  // make lib resilient to double-inclusion

gadgets.rpctx.nix = function() {
  // Consts for NIX. VBScript doesn't
  // allow items to start with _ for some reason,
  // so we need to make these names quite unique, as
  // they will go into the global namespace.
  var NIX_WRAPPER = 'GRPC____NIXVBS_wrapper';
  var NIX_GET_WRAPPER = 'GRPC____NIXVBS_get_wrapper';
  var NIX_HANDLE_MESSAGE = 'GRPC____NIXVBS_handle_message';
  var NIX_CREATE_CHANNEL = 'GRPC____NIXVBS_create_channel';
  var MAX_NIX_SEARCHES = 10;
  var NIX_SEARCH_PERIOD = 500;

  // JavaScript reference to the NIX VBScript wrappers.
  // Gadgets will have but a single channel under
  // nix_channels['..'] while containers will have a channel
  // per gadget stored under the gadget's ID.
  var nix_channels = {};
  var isForceSecure = {};

  // Store the ready signal method for use on handshake complete.
  var ready;
  var numHandlerSearches = 0;

  // Search for NIX handler to parent. Tries MAX_NIX_SEARCHES times every
  // NIX_SEARCH_PERIOD milliseconds.
  function conductHandlerSearch() {
    // Call from gadget to the container.
    var handler = nix_channels['..'];
    if (handler) {
      return;
    }

    if (++numHandlerSearches > MAX_NIX_SEARCHES) {
      // Handshake failed. Will fall back.
      gadgets.warn('Nix transport setup failed, falling back...');
      ready('..', false);
      return;
    }

    // If the gadget has yet to retrieve a reference to
    // the NIX handler, try to do so now. We don't do a
    // typeof(window.opener.GetAuthToken) check here
    // because it means accessing that field on the COM object, which,
    // being an internal function reference, is not allowed.
    // "in" works because it merely checks for the prescence of
    // the key, rather than actually accessing the object's property.
    // This is just a sanity check, not a validity check.
    if (!handler && window.opener && "GetAuthToken" in window.opener) {
      handler = window.opener;

      // Create the channel to the parent/container.
      // First verify that it knows our auth token to ensure it's not
      // an impostor.
      if (handler.GetAuthToken() == gadgets.rpc.getAuthToken('..')) {
        // Auth match - pass it back along with our wrapper to finish.
        // own wrapper and our authentication token for co-verification.
        var token = gadgets.rpc.getAuthToken('..');
        handler.CreateChannel(window[NIX_GET_WRAPPER]('..', token),
                              token);
        // Set channel handler
        nix_channels['..'] = handler;
        window.opener = null;

        // Signal success and readiness to send to parent.
        // Container-to-gadget bit flipped in CreateChannel.
        ready('..', true);
        return;
      }
    }

    // Try again.
    window.setTimeout(function() { conductHandlerSearch(); },
                      NIX_SEARCH_PERIOD);
  }

  // Returns current window location, without hash values
  function getLocationNoHash() {
    var loc = window.location.href;
    var idx = loc.indexOf('#');
    if (idx == -1) {
      return loc;
    }
    return loc.substring(0, idx);
  }

  // When "forcesecure" is set to true, use the relay file and a simple variant of IFPC to first
  // authenticate the container and gadget with each other.  Once that is done, then initialize
  // the NIX protocol. 
  function setupSecureRelayToParent(rpctoken) {
    // To the parent, transmit the child's URL, the passed in auth
    // token, and another token generated by the child.
    var childToken = (0x7FFFFFFF * Math.random()) | 0;    // TODO expose way to have child set this value
    var data = [
      getLocationNoHash(),
      childToken
    ];
    gadgets.rpc._createRelayIframe(rpctoken, data);
    
    // listen for response from parent
    var hash = window.location.href.split('#')[1] || '';
  
    function relayTimer() {
      var newHash = window.location.href.split('#')[1] || '';
      if (newHash !== hash) {
        clearInterval(relayTimerId);
        var params = gadgets.util.getUrlParameters(window.location.href);
        if (params.childtoken == childToken) {
          // parent has been authenticated; now init NIX
          conductHandlerSearch();
          return;
        }
        // security error -- token didn't match
        ready('..', false);
      }
    }
    var relayTimerId = setInterval( relayTimer, 100 );
  }

  return {
    getCode: function() {
      return 'nix';
    },

    isParentVerifiable: function(opt_receiverId) {
      // NIX is only parent verifiable if a receiver was setup with "forcesecure" set to TRUE.
      if (opt_receiverId) {
        return isForceSecure[opt_receiverId];
      }
      return false;
    },

    init: function(processFn, readyFn) {
      ready = readyFn;

      // Ensure VBScript wrapper code is in the page and that the
      // global Javascript handlers have been set.
      // VBScript methods return a type of 'unknown' when
      // checked via the typeof operator in IE. Fortunately
      // for us, this only applies to COM objects, so we
      // won't see this for a real Javascript object.
      if (typeof window[NIX_GET_WRAPPER] !== 'unknown') {
        window[NIX_HANDLE_MESSAGE] = function(data) {
          window.setTimeout(
              function() { processFn(gadgets.json.parse(data)); }, 0);
        };

        window[NIX_CREATE_CHANNEL] = function(name, channel, token) {
          // Verify the authentication token of the gadget trying
          // to create a channel for us.
          if (gadgets.rpc.getAuthToken(name) === token) {
            nix_channels[name] = channel;
            ready(name, true);
          }
        };

        // Inject the VBScript code needed.
        var vbscript =
          // We create a class to act as a wrapper for
          // a Javascript call, to prevent a break in of
          // the context.
          'Class ' + NIX_WRAPPER + '\n '

          // An internal member for keeping track of the
          // name of the document (container or gadget)
          // for which this wrapper is intended. For
          // those wrappers created by gadgets, this is not
          // used (although it is set to "..")
          + 'Private m_Intended\n'

          // Stores the auth token used to communicate with
          // the gadget. The GetChannelCreator method returns
          // an object that returns this auth token. Upon matching
          // that with its own, the gadget uses the object
          // to actually establish the communication channel.
          + 'Private m_Auth\n'

          // Method for internally setting the value
          // of the m_Intended property.
          + 'Public Sub SetIntendedName(name)\n '
          + 'If isEmpty(m_Intended) Then\n'
          + 'm_Intended = name\n'
          + 'End If\n'
          + 'End Sub\n'

          // Method for internally setting the value of the m_Auth property.
          + 'Public Sub SetAuth(auth)\n '
          + 'If isEmpty(m_Auth) Then\n'
          + 'm_Auth = auth\n'
          + 'End If\n'
          + 'End Sub\n'

          // A wrapper method which actually causes a
          // message to be sent to the other context.
          + 'Public Sub SendMessage(data)\n '
          + NIX_HANDLE_MESSAGE + '(data)\n'
          + 'End Sub\n'

          // Returns the auth token to the gadget, so it can
          // confirm a match before initiating the connection
          + 'Public Function GetAuthToken()\n '
          + 'GetAuthToken = m_Auth\n'
          + 'End Function\n'

          // Method for setting up the container->gadget
          // channel. Not strictly needed in the gadget's
          // wrapper, but no reason to get rid of it. Note here
          // that we pass the intended name to the NIX_CREATE_CHANNEL
          // method so that it can save the channel in the proper place
          // *and* verify the channel via the authentication token passed
          // here.
          + 'Public Sub CreateChannel(channel, auth)\n '
          + 'Call ' + NIX_CREATE_CHANNEL + '(m_Intended, channel, auth)\n'
          + 'End Sub\n'
          + 'End Class\n'

          // Function to get a reference to the wrapper.
          + 'Function ' + NIX_GET_WRAPPER + '(name, auth)\n'
          + 'Dim wrap\n'
          + 'Set wrap = New ' + NIX_WRAPPER + '\n'
          + 'wrap.SetIntendedName name\n'
          + 'wrap.SetAuth auth\n'
          + 'Set ' + NIX_GET_WRAPPER + ' = wrap\n'
          + 'End Function';

        try {
          window.execScript(vbscript, 'vbscript');
        } catch (e) {
          return false;
        }
      }
      return true;
    },

    setup: function(receiverId, token, forcesecure) {
      isForceSecure[receiverId] = !!forcesecure;
      if (receiverId === '..') {
        if (forcesecure) {
          setupSecureRelayToParent(token);
        } else {
          conductHandlerSearch();
        }
        return true;
      }
      try {
        var frame = document.getElementById(receiverId);
        var wrapper = window[NIX_GET_WRAPPER](receiverId, token);
        frame.contentWindow.opener = wrapper;
      } catch (e) {
        return false;
      }
      return true;
    },

    call: function(targetId, from, rpc) {
      try {
        // If we have a handler, call it.
        if (nix_channels[targetId]) {
          nix_channels[targetId].SendMessage(gadgets.json.stringify(rpc));
        }
      } catch (e) {
        return false;
      }
      return true;
    },
    
    // data = [child URL, child auth token]
    relayOnload: function(receiverId, data) {
      // transmit childtoken back to child to complete authentication
      var src = data[0] + '#childtoken=' + data[1];
      var childIframe = document.getElementById(receiverId);
      childIframe.src = src;
    }
  };
}();

} // !end of double-inclusion guard
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

gadgets.rpctx = gadgets.rpctx || {};

/*
 * For older WebKit-based browsers, the security model does not allow for any
 * known "native" hacks for conducting cross browser communication. However,
 * a variation of the IFPC (see below) can be used, entitled "RMR". RMR is
 * a technique that uses the resize event of the iframe to indicate that a
 * message was sent (instead of the much slower/performance heavy polling
 * technique used when a defined relay page is not avaliable). Simply put,
 * RMR uses the same "pass the message by the URL hash" trick that IFPC
 * uses to send a message, but instead of having an active relay page that
 * runs a piece of code when it is loaded, RMR merely changes the URL
 * of the relay page (which does not even have to exist on the domain)
 * and then notifies the other party by resizing the relay iframe. RMR
 * exploits the fact that iframes in the dom of page A can be resized
 * by page A while the onresize event will be fired in the DOM of page B,
 * thus providing a single bit channel indicating "message sent to you".
 * This method has the added benefit that the relay need not be active,
 * nor even exist: a 404 suffices just as well.
 *
 *   rmr: WebKit-specific resizing trick.
 *      - Safari 2+
 *      - Chrome 1
 */
if (!gadgets.rpctx.rmr) {  // make lib resilient to double-inclusion

gadgets.rpctx.rmr = function() {
  // Consts for RMR, including time in ms RMR uses to poll for
  // its relay frame to be created, and the max # of polls it does.
  var RMR_SEARCH_TIMEOUT = 500;
  var RMR_MAX_POLLS = 10;

  // JavaScript references to the channel objects used by RMR.
  // Gadgets will have but a single channel under
  // rmr_channels['..'] while containers will have a channel
  // per gadget stored under the gadget's ID.
  var rmr_channels = {};
  
  var process;
  var ready;

  /**
   * Append an RMR relay frame to the document. This allows the receiver
   * to start receiving messages.
   *
   * @param {Node} channelFrame Relay frame to add to the DOM body.
   * @param {string} relayUri Base URI for the frame.
   * @param {string} data to pass along to the frame.
   * @param {string=} opt_frameId ID of frame for which relay is being appended (optional).
   */
  function appendRmrFrame(channelFrame, relayUri, data, opt_frameId) {
    var appendFn = function() {
      // Append the iframe.
      document.body.appendChild(channelFrame);

      // Set the src of the iframe to 'about:blank' first and then set it
      // to the relay URI. This prevents the iframe from maintaining a src
      // to the 'old' relay URI if the page is returned to from another.
      // In other words, this fixes the bfcache issue that causes the iframe's
      // src property to not be updated despite us assigning it a new value here.
      channelFrame.src = 'about:blank';
      if (opt_frameId) {
        // Process the initial sent payload (typically sent by container to
        // child/gadget) only when the relay frame has finished loading. We
        // do this to ensure that, in processRmrData(...), the ACK sent due
        // to processing can actually be sent. Before this time, the frame's
        // contentWindow is null, making it impossible to do so.
        channelFrame.onload = function() {
          processRmrData(opt_frameId);
        };
      }
      channelFrame.src = relayUri + '#' + data;
    };

    if (document.body) {
      appendFn();
    } else {
      // Common gadget case: attaching header during in-gadget handshake,
      // when we may still be in script in head. Attach onload.
      gadgets.util.registerOnLoadHandler(function() { appendFn(); });
    }
  }

  /**
   * Sets up the RMR transport frame for the given frameId. For gadgets
   * calling containers, the frameId should be '..'.
   *
   * @param {string} frameId The ID of the frame.
   */
  function setupRmr(frameId) {
    if (typeof rmr_channels[frameId] === "object") {
      // Sanity check. Already done.
      return;
    }

    var channelFrame = document.createElement('iframe');
    var frameStyle = channelFrame.style;
    frameStyle.position = 'absolute';
    frameStyle.top = '0px';
    frameStyle.border = '0';
    frameStyle.opacity = '0';

    // The width here is important as RMR
    // makes use of the resize handler for the frame.
    // Do not modify unless you test thoroughly!
    frameStyle.width = '10px';
    frameStyle.height = '1px';
    channelFrame.id = 'rmrtransport-' + frameId;
    channelFrame.name = channelFrame.id;

    // Use the explicitly set relay, if one exists. Otherwise,
    // Construct one using the parent parameter plus robots.txt
    // as a synthetic relay. This works since browsers using RMR
    // treat 404s as legitimate for the purposes of cross domain
    // communication.
    var relayUri = gadgets.rpc.getRelayUrl(frameId);
    if (!relayUri) {
      relayUri =
          gadgets.rpc.getOrigin(gadgets.util.getUrlParameters()["parent"]) +
          '/robots.txt';
    }

    rmr_channels[frameId] = {
      frame: channelFrame,
      receiveWindow: null,
      relayUri: relayUri,
      searchCounter : 0,
      width: 10,

      // Waiting means "waiting for acknowledgement to be received."
      // Acknowledgement always comes as a special ACK
      // message having been received. This message is received
      // during handshake in different ways by the container and
      // gadget, and by normal RMR message passing once the handshake
      // is complete.
      waiting: true,
      queue: [],

      // Number of non-ACK messages that have been sent to the recipient
      // and have been acknowledged.
      sendId: 0,

      // Number of messages received and processed from the sender.
      // This is the number that accompanies every ACK to tell the
      // sender to clear its queue.
      recvId: 0
    };

    if (frameId !== '..') {
      // Container always appends a relay to the gadget, before
      // the gadget appends its own relay back to container. The
      // gadget, in the meantime, refuses to attach the container
      // relay until it finds this one. Thus, the container knows
      // for certain that gadget to container communication is set
      // up by the time it finds its own relay. In addition to
      // establishing a reliable handshake protocol, this also
      // makes it possible for the gadget to send an initial batch
      // of messages to the container ASAP.
      appendRmrFrame(channelFrame, relayUri, getRmrData(frameId));
    }
     
    // Start searching for our own frame on the other page.
    conductRmrSearch(frameId);
  }

  /**
   * Searches for a relay frame, created by the sender referenced by
   * frameId, with which this context receives messages. Once
   * found with proper permissions, attaches a resize handler which
   * signals messages to be sent.
   *
   * @param {string} frameId Frame ID of the prospective sender.
   */
  function conductRmrSearch(frameId) {
    var channelWindow = null;

    // Increment the search counter.
    rmr_channels[frameId].searchCounter++;

    try {
      var targetWin = gadgets.rpc._getTargetWin(frameId);
      if (frameId === '..') {
        // We are a gadget.
        channelWindow = targetWin.frames['rmrtransport-' + gadgets.rpc.RPC_ID];
      } else {
        // We are a container.
        channelWindow = targetWin.frames['rmrtransport-..'];
      }
    } catch (e) {
      // Just in case; may happen when relay is set to about:blank or unset.
      // Catching exceptions here ensures that the timeout to continue the
      // search below continues to work.
    }

    var status = false;

    if (channelWindow) {
      // We have a valid reference to "our" RMR transport frame.
      // Register the proper event handlers.
      status = registerRmrChannel(frameId, channelWindow);
    }

    if (!status) {
      // Not found yet. Continue searching, but only if the counter
      // has not reached the threshold.
      if (rmr_channels[frameId].searchCounter > RMR_MAX_POLLS) {
        // If we reach this point, then RMR has failed and we
        // fall back to IFPC.
        return;
      }

      window.setTimeout(function() {
        conductRmrSearch(frameId);
      }, RMR_SEARCH_TIMEOUT);
    }
  }

  /**
   * Attempts to conduct an RPC call to the specified
   * target with the specified data via the RMR
   * method. If this method fails, the system attempts again
   * using the known default of IFPC.
   *
   * @param {string} targetId Module Id of the RPC service provider.
   * @param {string} serviceName Name of the service to call.
   * @param {string} from Module Id of the calling provider.
   * @param {Object} rpc The RPC data for this call.
   */
  function callRmr(targetId, serviceName, from, rpc) {
    var handler = null;

    if (from !== '..') {
      // Call from gadget to the container.
      handler = rmr_channels['..'];
    } else {
      // Call from container to the gadget.
      handler = rmr_channels[targetId];
    }

    if (handler) {
      // Queue the current message if not ACK.
      // ACK is always sent through getRmrData(...).
      if (serviceName !== gadgets.rpc.ACK) {
        handler.queue.push(rpc);
      }

      if (handler.waiting ||
          (handler.queue.length === 0 &&
           !(serviceName === gadgets.rpc.ACK && rpc && rpc.ackAlone === true))) {
        // If we are awaiting a response from any previously-sent messages,
        // or if we don't have anything new to send, just return.
        // Note that we don't short-return if we're ACKing just-received
        // messages.
        return true;
      }

      if (handler.queue.length > 0) {
        handler.waiting = true;
      }

      var url = handler.relayUri + "#" + getRmrData(targetId);

      try {
        // Update the URL with the message.
        handler.frame.contentWindow.location = url;

        // Resize the frame.
        var newWidth = handler.width == 10 ? 20 : 10;
        handler.frame.style.width = newWidth + 'px';
        handler.width = newWidth;

        // Done!
      } catch (e) {
        // Something about location-setting or resizing failed.
        // This should never happen, but if it does, fall back to
        // the default transport.
        return false;
      }
    }

    return true;
  }

  /**
   * Returns as a string the data to be appended to an RMR relay frame,
   * constructed from the current request queue plus an ACK message indicating
   * the currently latest-processed message ID.
   *
   * @param {string} toFrameId Frame whose sendable queued data to retrieve.
   */
  function getRmrData(toFrameId) {
    var channel = rmr_channels[toFrameId];
    var rmrData = {id: channel.sendId};
    if (channel) {
      rmrData.d = Array.prototype.slice.call(channel.queue, 0);
      rmrData.d.push({s:gadgets.rpc.ACK, id:channel.recvId});
    }
    return gadgets.json.stringify(rmrData);
  }

  /**
   * Retrieve data from the channel keyed by the given frameId,
   * processing it as a batch. All processed data is assumed to have been
   * generated by getRmrData(...), pairing that method with this.
   *
   * @param {string} fromFrameId Frame from which data is being retrieved.
   */
  function processRmrData(fromFrameId) {
    var channel = rmr_channels[fromFrameId];
    var data = channel.receiveWindow.location.hash.substring(1);

    // Decode the RPC object array.
    var rpcObj = gadgets.json.parse(decodeURIComponent(data)) || {};
    var rpcArray = rpcObj.d || [];

    var nonAckReceived = false;
    var noLongerWaiting = false;

    var numBypassed = 0;
    var numToBypass = (channel.recvId - rpcObj.id);
    for (var i = 0; i < rpcArray.length; ++i) {
      var rpc = rpcArray[i];

      // If we receive an ACK message, then mark the current
      // handler as no longer waiting and send out the next
      // queued message.
      if (rpc.s === gadgets.rpc.ACK) {
        // ACK received - whether this came from a handshake or
        // an active call, in either case it indicates readiness to
        // send messages to the from frame.
        ready(fromFrameId, true);

        if (channel.waiting) {
          noLongerWaiting = true;
        }

        channel.waiting = false;
        var newlyAcked = Math.max(0, rpc.id - channel.sendId);
        channel.queue.splice(0, newlyAcked);
        channel.sendId = Math.max(channel.sendId, rpc.id || 0);
        continue;
      }

      // If we get here, we've received > 0 non-ACK messages to
      // process. Indicate this bit for later.
      nonAckReceived = true;

      // Bypass any messages already received.
      if (++numBypassed <= numToBypass) {
        continue;
      }

      ++channel.recvId;
      process(rpc);  // actually dispatch the message
    }

    // Send an ACK indicating that we got/processed the message(s).
    // Do so if we've received a message to process or if we were waiting
    // before but a received ACK has cleared our waiting bit, and we have
    // more messages to send. Performing this operation causes additional
    // messages to be sent.
    if (nonAckReceived ||
        (noLongerWaiting && channel.queue.length > 0)) {
      var from = (fromFrameId === '..') ? gadgets.rpc.RPC_ID : '..';
      callRmr(fromFrameId, gadgets.rpc.ACK, from, {ackAlone: nonAckReceived});
    }
  }

  /**
   * Registers the RMR channel handler for the given frameId and associated
   * channel window.
   *
   * @param {string} frameId The ID of the frame for which this channel is being
   *   registered.
   * @param {Object} channelWindow The window of the receive frame for this
   *   channel, if any.
   *
   * @return {boolean} True if the frame was setup successfully, false
   *   otherwise.
   */
  function registerRmrChannel(frameId, channelWindow) {
    var channel = rmr_channels[frameId];

    // Verify that the channel is ready for receiving.
    try {
      var canAccess = false;

      // Check to see if the document is in the window. For Chrome, this
      // will return 'false' if the channelWindow is inaccessible by this
      // piece of JavaScript code, meaning that the URL of the channelWindow's
      // parent iframe has not yet changed from 'about:blank'. We do this
      // check this way because any true *access* on the channelWindow object
      // will raise a security exception, which, despite the try-catch, still
      // gets reported to the debugger (it does not break execution, the try
      // handles that problem, but it is still reported, which is bad form).
      // This check always succeeds in Safari 3.1 regardless of the state of
      // the window.
      canAccess = 'document' in channelWindow;

      if (!canAccess) {
        return false;
      }

      // Check to see if the document is an object. For Safari 3.1, this will
      // return undefined if the page is still inaccessible. Unfortunately, this
      // *will* raise a security issue in the debugger.
      // TODO Find a way around this problem.
      canAccess = typeof channelWindow['document'] == 'object';

      if (!canAccess) {
        return false;
      }

      // Once we get here, we know we can access the document (and anything else)
      // on the window object. Therefore, we check to see if the location is
      // still about:blank (this takes care of the Safari 3.2 case).
      var loc = channelWindow.location.href;

      // Check if this is about:blank for Safari.
      if (loc === 'about:blank') {
        return false;
      }
    } catch (ex) {
      // For some reason, the iframe still points to about:blank. We try
      // again in a bit.
      return false;
    }

    // Save a reference to the receive window.
    channel.receiveWindow = channelWindow;

    // Register the onresize handler.
    function onresize() {
      processRmrData(frameId);
    };

    if (typeof channelWindow.attachEvent === "undefined") {
      channelWindow.onresize = onresize;
    } else {
      channelWindow.attachEvent("onresize", onresize);
    }

    if (frameId === '..') {
      // Gadget to container. Signal to the container that the gadget
      // is ready to receive messages by attaching the g -> c relay.
      // As a nice optimization, pass along any gadget to container
      // queued messages that have backed up since then. ACK is enqueued in
      // getRmrData to ensure that the container's waiting flag is set to false
      // (this happens in the below code run on the container side).
      appendRmrFrame(channel.frame, channel.relayUri, getRmrData(frameId), frameId);
    } else {
      // Process messages that the gadget sent in its initial relay payload.
      // We can do this immediately because the container has already appended
      // and loaded a relay frame that can be used to ACK the messages the gadget
      // sent. In the preceding if-block, however, the processRmrData(...) call
      // must wait. That's because appendRmrFrame may not actually append the
      // frame - in the context of a gadget, this code may be running in the
      // head element, so it cannot be appended to body. As a result, the
      // gadget cannot ACK the container for messages it received.
      processRmrData(frameId);
    }

    return true;
  }

  return {
    getCode: function() {
      return 'rmr';
    },

    isParentVerifiable: function() {
      return true;
    },

    init: function(processFn, readyFn) {
      // No global setup.
      process = processFn;
      ready = readyFn;
      return true;
    },

    setup: function(receiverId, token) {
      try {
        setupRmr(receiverId);
      } catch (e) {
        gadgets.warn('Caught exception setting up RMR: ' + e);
        return false;
      }
      return true;
    },

    call: function(targetId, from, rpc) {
      return callRmr(targetId, rpc.s, from, rpc);
    }
  };
}();

} // !end of double-inclusion guard
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

gadgets.rpctx = gadgets.rpctx || {};

/*
 * For all others, we have a fallback mechanism known as "ifpc". IFPC
 * exploits the fact that while same-origin policy prohibits a frame from
 * accessing members on a window not in the same domain, that frame can,
 * however, navigate the window heirarchy (via parent). This is exploited by
 * having a page on domain A that wants to talk to domain B create an iframe
 * on domain B pointing to a special relay file and with a message encoded
 * after the hash (#). This relay, in turn, finds the page on domain B, and
 * can call a receipt function with the message given to it. The relay URL
 * used by each caller is set via the gadgets.rpc.setRelayUrl(..) and
 * *must* be called before the call method is used.
 *
 *   ifpc: Iframe-based method, utilizing a relay page, to send a message.
 *      - No known major browsers still use this method, but it remains
 *        useful as a catch-all fallback for the time being.
 */
if (!gadgets.rpctx.ifpc) {  // make lib resilient to double-inclusion

gadgets.rpctx.ifpc = function() {
  var iframePool = [];
  var callId = 0;
  var ready;

  /**
   * Encodes arguments for the legacy IFPC wire format.
   *
   * @param {Object} args
   * @return {string} the encoded args
   */
  function encodeLegacyData(args) {
    var argsEscaped = [];
    for(var i = 0, j = args.length; i < j; ++i) {
      argsEscaped.push(encodeURIComponent(gadgets.json.stringify(args[i])));
    }
    return argsEscaped.join('&');
  }

  /**
   * Helper function to emit an invisible IFrame.
   * @param {string} src SRC attribute of the IFrame to emit.
   * @private
   */
  function emitInvisibleIframe(src) {
    var iframe;
    // Recycle IFrames
    for (var i = iframePool.length - 1; i >=0; --i) {
      var ifr = iframePool[i];
      try {
        if (ifr && (ifr.recyclable || ifr.readyState === 'complete')) {
          ifr.parentNode.removeChild(ifr);
          if (window.ActiveXObject) {
            // For MSIE, delete any iframes that are no longer being used. MSIE
            // cannot reuse the IFRAME because a navigational click sound will
            // be triggered when we set the SRC attribute.
            // Other browsers scan the pool for a free iframe to reuse.
            iframePool[i] = ifr = null;
            iframePool.splice(i, 1);
          } else {
            ifr.recyclable = false;
            iframe = ifr;
            break;
          }
        }
      } catch (e) {
        // Ignore; IE7 throws an exception when trying to read readyState and
        // readyState isn't set.
      }
    }
    // Create IFrame if necessary
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.style.border = iframe.style.width = iframe.style.height = '0px';
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.onload = function() { this.recyclable = true; };
      iframePool.push(iframe);
    }
    iframe.src = src;
    window.setTimeout(function() { document.body.appendChild(iframe); }, 0);
  }

  return {
    getCode: function() {
      return 'ifpc';
    },

    isParentVerifiable: function() {
      return true;
    },

    init: function(processFn, readyFn) {
      // No global setup.
      ready = readyFn;
      ready('..', true);  // Ready immediately.
      return true;
    },

    setup: function(receiverId, token) {
      // Indicate readiness to send to receiver.
      ready(receiverId, true);
      return true;
    },

    call: function(targetId, from, rpc) {
      // Retrieve the relay file used by IFPC. Note that
      // this must be set before the call, and so we conduct
      // an extra check to ensure it is not blank.
      var relay = gadgets.rpc.getRelayUrl(targetId);
      ++callId;

      if (!relay) {
        gadgets.warn('No relay file assigned for IFPC');
        return false;
      }

      // The RPC mechanism supports two formats for IFPC (legacy and current).
      var src = null;
      if (rpc.l) {
        // Use legacy protocol.
        // Format: #iframe_id&callId&num_packets&packet_num&block_of_data
        var callArgs = rpc.a;
        src = [relay, '#', encodeLegacyData([from, callId, 1, 0,
               encodeLegacyData([from, rpc.s, '', '', from].concat(
                 callArgs))])].join('');
      } else {
        // Format: #targetId & sourceId@callId & packetNum & packetId & packetData
        src = [relay, '#', targetId, '&', from, '@', callId,
               '&1&0&', encodeURIComponent(gadgets.json.stringify(rpc))].join('');
      }

      // Conduct the IFPC call by creating the Iframe with
      // the relay URL and appended message.
      emitInvisibleIframe(src);
      return true;
    }
  };
}();

} // !end of double inclusion guard
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview Remote procedure call library for gadget-to-container,
 * container-to-gadget, and gadget-to-gadget (thru container) communication.
 */

/**
 * gadgets.rpc Transports
 *
 * All transports are stored in object gadgets.rpctx, and are provided
 * to the core gadgets.rpc library by various build rules.
 * 
 * Transports used by core gadgets.rpc code to actually pass messages.
 * each transport implements the same interface exposing hooks that
 * the core library calls at strategic points to set up and use
 * the transport.
 *
 * The methods each transport must implement are:
 * + getCode(): returns a string identifying the transport. For debugging.
 * + isParentVerifiable(): indicates (via boolean) whether the method
 *     has the property that its relay URL verifies for certain the
 *     receiver's protocol://host:port.
 * + init(processFn, readyFn): Performs any global initialization needed. Called
 *     before any other gadgets.rpc methods are invoked. processFn is
 *     the function in gadgets.rpc used to process an rpc packet. readyFn is
 *     a function that must be called when the transport is ready to send
 *     and receive messages bidirectionally. Returns
 *     true if successful, false otherwise.
 * + setup(receiverId, token): Performs per-receiver initialization, if any.
 *     receiverId will be '..' for gadget-to-container. Returns true if
 *     successful, false otherwise.
 * + call(targetId, from, rpc): Invoked to send an actual
 *     message to the given targetId, with the given serviceName, from
 *     the sender identified by 'from'. Payload is an rpc packet. Returns
 *     true if successful, false otherwise.
 */

if (!gadgets.rpc) { // make lib resilient to double-inclusion

/**
 * @static
 * @namespace Provides operations for making rpc calls.
 * @name gadgets.rpc
 */

gadgets.rpc = function() {
  /** 
   * @const
   * @private
   */
  var CALLBACK_NAME = '__cb';

  /** 
   * @const
   * @private
   */
  var DEFAULT_NAME = '';

  /** Exported constant, for use by transports only.
   * @const
   * @type {string}
   * @member gadgets.rpc
   */
  var ACK = '__ack';

  /** 
   * Timeout and number of attempts made to setup a transport receiver.
   * @const
   * @private
   */
  var SETUP_FRAME_TIMEOUT = 500;

  /** 
   * @const
   * @private
   */
  var SETUP_FRAME_MAX_TRIES = 10;

  var services = {};
  var relayUrl = {};
  var useLegacyProtocol = {};
  var authToken = {};
  var callId = 0;
  var callbacks = {};
  var setup = {};
  var sameDomain = {};
  var params = {};
  var receiverTx = {};
  var earlyRpcQueue = {};

  // isGadget =~ isChild for the purposes of rpc (used only in setup).
  var isChild = (window.top !== window.self);

  // Set the current rpc ID from window.name immediately, to prevent
  // shadowing of window.name by a "var name" declaration, or similar.
  var rpcId = window.name;

  var securityCallback = function() {};
  var LOAD_TIMEOUT = 0;
  var FRAME_PHISH = 1;
  var FORGED_MSG = 2;

  // Fallback transport is simply a dummy impl that emits no errors
  // and logs info on calls it receives, to avoid undesired side-effects
  // from falling back to IFPC or some other transport.
  var fallbackTransport = (function() {
    function logFn(name) {
      return function() {
        gadgets.log("gadgets.rpc." + name + "(" +
                    gadgets.json.stringify(Array.prototype.slice.call(arguments)) +
                    "): call ignored. [caller: " + document.location +
                    ", isChild: " + isChild + "]");
      };
    }
    return {
      getCode: function() {
        return "noop";
      },
      isParentVerifiable: function() {
        return true;  // Not really, but prevents transport assignment to IFPC.
      },
      init: logFn("init"),
      setup: logFn("setup"),
      call: logFn("call")
    };
  })();

  // Load the authentication token for speaking to the container
  // from the gadget's parameters, or default to '0' if not found.
  if (gadgets.util) {
    params = gadgets.util.getUrlParameters();
  }

  /**
   * Return a transport representing the best available cross-domain
   * message-passing mechanism available to the browser.
   *
   * <p>Transports are selected on a cascading basis determined by browser
   * capability and other checks. The order of preference is:
   * <ol>
   * <li> wpm: Uses window.postMessage standard.
   * <li> dpm: Uses document.postMessage, similar to wpm but pre-standard.
   * <li> nix: Uses IE-specific browser hacks.
   * <li> rmr: Signals message passing using relay file's onresize handler.
   * <li> fe: Uses FF2-specific window.frameElement hack.
   * <li> ifpc: Sends messages via active load of a relay file.
   * </ol>
   * <p>See each transport's commentary/documentation for details.
   * @return {Object}
   * @member gadgets.rpc
   */
  function getTransport() {
    return typeof window.postMessage === 'function' ? gadgets.rpctx.wpm :
           typeof window.postMessage === 'object' ? gadgets.rpctx.wpm :
           window.ActiveXObject ? gadgets.rpctx.nix :
           navigator.userAgent.indexOf('WebKit') > 0 ? gadgets.rpctx.rmr :
           navigator.product === 'Gecko' ? gadgets.rpctx.frameElement :
           gadgets.rpctx.ifpc;
  }

  /**
   * Function passed to, and called by, a transport indicating it's ready to
   * send and receive messages.
   */
  function transportReady(receiverId, readySuccess) {
    var tx = transport;
    if (!readySuccess) {
      tx = fallbackTransport;
    }
    receiverTx[receiverId] = tx;

    // If there are any early-queued messages, send them now directly through
    // the needed transport.
    var earlyQueue = earlyRpcQueue[receiverId] || [];
    for (var i = 0; i < earlyQueue.length; ++i) {
      var rpc = earlyQueue[i];
      // There was no auth/rpc token set before, so set it now.
      rpc.t = getAuthToken(receiverId);
      tx.call(receiverId, rpc.f, rpc);
    }

    // Clear the queue so it won't be sent again.
    earlyRpcQueue[receiverId] = [];
  }

  //  Track when this main page is closed or navigated to a different location
  // ("unload" event).
  //  NOTE: The use of the "unload" handler here and for the relay iframe
  // prevents the use of the in-memory page cache in modern browsers.
  // See: https://developer.mozilla.org/en/using_firefox_1.5_caching
  // See: http://webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
  var mainPageUnloading = false,
      hookedUnload = false;
  
  function hookMainPageUnload() {
    if ( hookedUnload ) {
      return;
    }
    function onunload() {
      mainPageUnloading = true;
    }
    gadgets.util.attachBrowserEvent(window, 'unload', onunload, false);
    hookedUnload = true;
  }

  function relayOnload(targetId, sourceId, token, data, relayWindow) {
    // Validate auth token.
    if (!authToken[sourceId] || authToken[sourceId] !== token) {
      gadgets.error("Invalid auth token. " + authToken[sourceId] + " vs " + token);
      securityCallback(sourceId, FORGED_MSG);
    }
    
    relayWindow.onunload = function() {
      if (setup[sourceId] && !mainPageUnloading) {
        securityCallback(sourceId, FRAME_PHISH);
        gadgets.rpc.removeReceiver(sourceId);
      }
    };
    hookMainPageUnload();
    
    data = gadgets.json.parse(decodeURIComponent(data));
    transport.relayOnload(sourceId, data);
  }

  /**
   * Helper function to process an RPC request
   * @param {Object} rpc RPC request object
   * @private
   */
  function process(rpc) {
    //
    // RPC object contents:
    //   s: Service Name
    //   f: From
    //   c: The callback ID or 0 if none.
    //   a: The arguments for this RPC call.
    //   t: The authentication token.
    //
    if (rpc && typeof rpc.s === 'string' && typeof rpc.f === 'string' &&
        rpc.a instanceof Array) {

      // Validate auth token.
      if (authToken[rpc.f]) {
        // We don't do type coercion here because all entries in the authToken
        // object are strings, as are all url params. See setupReceiver(...).
        if (authToken[rpc.f] !== rpc.t) {
          gadgets.error("Invalid auth token. " + authToken[rpc.f] + " vs " + rpc.t);
          securityCallback(rpc.f, FORGED_MSG);
        }
      }

      if (rpc.s === ACK) {
        // Acknowledgement API, used to indicate a receiver is ready.
        window.setTimeout(function() { transportReady(rpc.f, true); }, 0);
        return;
      }

      // If there is a callback for this service, attach a callback function
      // to the rpc context object for asynchronous rpc services.
      //
      // Synchronous rpc request handlers should simply ignore it and return a
      // value as usual.
      // Asynchronous rpc request handlers, on the other hand, should pass its
      // result to this callback function and not return a value on exit.
      //
      // For example, the following rpc handler passes the first parameter back
      // to its rpc client with a one-second delay.
      //
      // function asyncRpcHandler(param) {
      //   var me = this;
      //   setTimeout(function() {
      //     me.callback(param);
      //   }, 1000);
      // }
      if (rpc.c) {
        rpc.callback = function(result) {
          gadgets.rpc.call(rpc.f, CALLBACK_NAME, null, rpc.c, result);
        };
      }

      // Call the requested RPC service.
      var result = (services[rpc.s] ||
                    services[DEFAULT_NAME]).apply(rpc, rpc.a);

      // If the rpc request handler returns a value, immediately pass it back
      // to the callback. Otherwise, do nothing, assuming that the rpc handler
      // will make an asynchronous call later.
      if (rpc.c && typeof result !== 'undefined') {
        gadgets.rpc.call(rpc.f, CALLBACK_NAME, null, rpc.c, result);
      }
    }
  }

  /**
   * Helper method returning a canonicalized protocol://host[:port] for
   * a given input URL, provided as a string. Used to compute convenient
   * relay URLs and to determine whether a call is coming from the same
   * domain as its receiver (bypassing the try/catch capability detection
   * flow, thereby obviating Firebug and other tools reporting an exception).
   *
   * @param {string} url Base URL to canonicalize.
   * @memberOf gadgets.rpc
   */

  function getOrigin(url) {
    if (!url) {
      return "";
    }
    url = url.toLowerCase();
    if (url.indexOf("//") == 0) {
      url = window.location.protocol + url;
    }
    if (url.indexOf("://") == -1) {
      // Assumed to be schemaless. Default to current protocol.
      url = window.location.protocol + "//" + url;
    }
    // At this point we guarantee that "://" is in the URL and defines
    // current protocol. Skip past this to search for host:port.
    var host = url.substring(url.indexOf("://") + 3);

    // Find the first slash char, delimiting the host:port.
    var slashPos = host.indexOf("/");
    if (slashPos != -1) {
      host = host.substring(0, slashPos);
    }

    var protocol = url.substring(0, url.indexOf("://"));

    // Use port only if it's not default for the protocol.
    var portStr = "";
    var portPos = host.indexOf(":");
    if (portPos != -1) {
      var port = host.substring(portPos + 1);
      host = host.substring(0, portPos);
      if ((protocol === "http" && port !== "80") ||
          (protocol === "https" && port !== "443")) {
        portStr = ":" + port;
      }
    }

    // Return <protocol>://<host>[<port>]
    return protocol + "://" + host + portStr;
  }

  function getTargetWin(id) {
    if (typeof id === "undefined" ||
        id === "..") {
      return window.parent;
    }

    // Cast to a String to avoid an index lookup.
    id = String(id);
    
    // Try window.frames first
    var target = window.frames[id];
    if (target) {
      return target;
    }
    
    // Fall back to getElementById()
    target = document.getElementById(id);
    if (target && target.contentWindow) {
      return target.contentWindow;
    }

    return null;
  }

  // Pick the most efficient RPC relay mechanism.
  var transport = getTransport();

  // Create the Default RPC handler.
  services[DEFAULT_NAME] = function() {
    gadgets.warn('Unknown RPC service: ' + this.s);
  };

  // Create a Special RPC handler for callbacks.
  services[CALLBACK_NAME] = function(callbackId, result) {
    var callback = callbacks[callbackId];
    if (callback) {
      delete callbacks[callbackId];
      callback(result);
    }
  };

  /**
   * Conducts any frame-specific work necessary to setup
   * the channel type chosen. This method is called when
   * the container page first registers the gadget in the
   * RPC mechanism. Gadgets, in turn, will complete the setup
   * of the channel once they send their first messages.
   */
  function setupFrame(frameId, token, forcesecure) {
    if (setup[frameId] === true) {
      return;
    }

    if (typeof setup[frameId] === 'undefined') {
      setup[frameId] = 0;
    }
    
    var tgtFrame = document.getElementById(frameId);
    if (frameId === '..' || tgtFrame != null) {
      if (transport.setup(frameId, token, forcesecure) === true) {
        setup[frameId] = true;
        return;
      }
    }

    if (setup[frameId] !== true && setup[frameId]++ < SETUP_FRAME_MAX_TRIES) {
      // Try again in a bit, assuming that frame will soon exist.
      window.setTimeout(function() { setupFrame(frameId, token, forcesecure) },
                        SETUP_FRAME_TIMEOUT);
    } else {
      // Fail: fall back for this gadget.
      receiverTx[frameId] = fallbackTransport;
      setup[frameId] = true;
    }
  }

  /**
   * Attempts to make an rpc by calling the target's receive method directly.
   * This works when gadgets are rendered on the same domain as their container,
   * a potentially useful optimization for trusted content which keeps
   * RPC behind a consistent interface.
   *
   * @param {string} target Module id of the rpc service provider
   * @param {Object} rpc RPC data
   * @return {boolean}
   */
  function callSameDomain(target, rpc) {
    if (typeof sameDomain[target] === 'undefined') {
      // Seed with a negative, typed value to avoid
      // hitting this code path repeatedly.
      sameDomain[target] = false;
      var targetRelay = gadgets.rpc.getRelayUrl(target);

      if (getOrigin(targetRelay) !== getOrigin(window.location.href)) {
        // Not worth trying -- avoid the error and just return.
        return false;
      }

      var targetEl = getTargetWin(target);
      try {
        // If this succeeds, then same-domain policy applied
        sameDomain[target] = targetEl.gadgets.rpc.receiveSameDomain;
      } catch (e) {
        // Shouldn't happen due to origin check. Caught to emit
        // more meaningful error to the caller.
        gadgets.error("Same domain call failed: parent= incorrectly set.");
      }
    }

    if (typeof sameDomain[target] === 'function') {
      // Call target's receive method
      sameDomain[target](rpc);
      return true;
    }

    return false;
  }

  /**
   * Sets the relay URL of a target frame.
   * @param {string} targetId Name of the target frame.
   * @param {string} url Full relay URL of the target frame.
   * @param {boolean=} opt_useLegacy True if this relay needs the legacy IFPC
   *     wire format.
   *
   * @member gadgets.rpc
   * @deprecated
   */
  function setRelayUrl(targetId, url, opt_useLegacy) {
    // make URL absolute if necessary
    if (!/http(s)?:\/\/.+/.test(url)) {
      if (url.indexOf("//") == 0) {
        url = window.location.protocol + url;
      } else if (url.charAt(0) == '/') {
        url = window.location.protocol + "//" + window.location.host + url;
      } else if (url.indexOf("://") == -1) {
        // Assumed to be schemaless. Default to current protocol.
        url = window.location.protocol + "//" + url;
      }
    }
    relayUrl[targetId] = url;
    useLegacyProtocol[targetId] = !!opt_useLegacy;
  }

  /**
   * Helper method to retrieve the authToken for a given gadget.
   * Not to be used directly.
   * @member gadgets.rpc
   * @return {string}
   */
  function getAuthToken(targetId) {
    return authToken[targetId];
  }

  /**
   * Sets the auth token of a target frame.
   * @param {string} targetId Name of the target frame.
   * @param {string} token The authentication token to use for all
   *     calls to or from this target id.
   *
   * @member gadgets.rpc
   * @deprecated
   */
  function setAuthToken(targetId, token, forcesecure) {
    token = token || "";

    // Coerce token to a String, ensuring that all authToken values
    // are strings. This ensures correct comparison with URL params
    // in the process(rpc) method.
    authToken[targetId] = String(token);

    setupFrame(targetId, token, forcesecure);
  }

  function setupContainerGadgetContext(rpctoken, opt_forcesecure) {
    /**
     * Initializes gadget to container RPC params from the provided configuration.
     */
    function init(config) {
      var configRpc = config ? config.rpc : {};
      var parentRelayUrl = configRpc.parentRelayUrl;

      // Allow for wild card parent relay files as long as it's from a
      // white listed domain. This is enforced by the rendering servlet.
      if (parentRelayUrl.substring(0, 7) !== 'http://' &&
          parentRelayUrl.substring(0, 8) !== 'https://' &&
          parentRelayUrl.substring(0, 2) !== '//') {
        // Relative path: we append to the parent.
        // We're relying on the server validating the parent parameter in this
        // case. Because of this, parent may only be passed in the query, not fragment.
        if (typeof params.parent === "string" && params.parent !== "") {
          // Otherwise, relayUrl['..'] will be null, signaling transport
          // code to ignore rpc calls since they cannot work without a
          // relay URL with host qualification.
          if (parentRelayUrl.substring(0, 1) !== '/') {
            // Path-relative. Trust that parent is passed in appropriately.
            var lastSlash = params.parent.lastIndexOf('/');
            parentRelayUrl = params.parent.substring(0, lastSlash + 1) + parentRelayUrl;
          } else {
            // Host-relative.
            parentRelayUrl = getOrigin(params.parent) + parentRelayUrl;
          }
        }
      }

      var useLegacy = !!configRpc.useLegacyProtocol;
      setRelayUrl('..', parentRelayUrl, useLegacy);

      if (useLegacy) {
        transport = gadgets.rpctx.ifpc;
        transport.init(process, transportReady);
      }

      // Sets the auth token and signals transport to setup connection to container.
      var forceSecure = opt_forcesecure || params.forcesecure || false;
      setAuthToken('..', rpctoken, forceSecure);
    }

    var requiredConfig = {
      parentRelayUrl : gadgets.config.NonEmptyStringValidator
    };
    gadgets.config.register("rpc", requiredConfig, init);
  }

  function setupContainerGenericIframe(rpctoken, opt_parent, opt_forcesecure) {
    // Generic child IFRAME setting up connection w/ its container.
    // Use the opt_parent param if provided, or the "parent" query param
    // if found -- otherwise, do nothing since this call might be initiated
    // automatically at first, then actively later in IFRAME code.
    var forcesecure = opt_forcesecure || params.forcesecure || false;
    var parent = opt_parent || params.parent;
    if (parent) {
      setRelayUrl('..', parent);
      setAuthToken('..', rpctoken, forcesecure);
    }
  }

  function setupChildIframe(gadgetId, opt_frameurl, opt_authtoken, opt_forcesecure) {
    if (!gadgets.util) {
      return;
    }
    var childIframe = document.getElementById(gadgetId);
    if (!childIframe) {
      throw new Error("Cannot set up gadgets.rpc receiver with ID: " + gadgetId +
          ", element not found.");
    }

    // The "relay URL" can either be explicitly specified or is set as
    // the child IFRAME URL verbatim.
    var relayUrl = opt_frameurl || childIframe.src;
    setRelayUrl(gadgetId, relayUrl);

    // The auth token is parsed from child params (rpctoken) or overridden.
    var childParams = gadgets.util.getUrlParameters(childIframe.src);
    var rpctoken = opt_authtoken || childParams.rpctoken;
    var forcesecure = opt_forcesecure || childParams.forcesecure;
    setAuthToken(gadgetId, rpctoken, forcesecure);
  }

  /**
   * Sets up the gadgets.rpc library to communicate with the receiver.
   * <p>This method replaces setRelayUrl(...) and setAuthToken(...)
   *
   * <p>Simplified instructions - highly recommended:
   * <ol>
   * <li> Generate &lt;iframe id="&lt;ID&gt;" src="...#parent=&lt;PARENTURL&gt;&rpctoken=&lt;RANDOM&gt;"/&gt;
   *      and add to DOM.
   * <li> Call gadgets.rpc.setupReceiver("&lt;ID>");
   *      <p>All parent/child communication initializes automatically from here.
   *         Naturally, both sides need to include the library.
   * </ol>
   *
   * <p>Detailed container/parent instructions:
   * <ol>
   * <li> Create the target IFRAME (eg. gadget) with a given &lt;ID> and params
   *    rpctoken=<token> (eg. #rpctoken=1234), which is a random/unguessbable
   *    string, and parent=&lt;url>, where &lt;url> is the URL of the container.
   * <li> Append IFRAME to the document.
   * <li> Call gadgets.rpc.setupReceiver(&lt;ID>)
   * <p>[Optional]. Strictly speaking, you may omit rpctoken and parent. This
   *             practice earns little but is occasionally useful for testing.
   *             If you omit parent, you MUST pass your container URL as the 2nd
   *             parameter to this method.
   * </ol>
   *
   * <p>Detailed gadget/child IFRAME instructions:
   * <ol>
   * <li> If your container/parent passed parent and rpctoken params (query string
   *    or fragment are both OK), you needn't do anything. The library will self-
   *    initialize.
   * <li> If "parent" is omitted, you MUST call this method with targetId '..'
   *    and the second param set to the parent URL.
   * <li> If "rpctoken" is omitted, but the container set an authToken manually
   *    for this frame, you MUST pass that ID (however acquired) as the 2nd param
   *    to this method.
   * </ol>
   *
   * @member gadgets.rpc
   * @param {string} targetId
   * @param {string=} opt_receiverurl
   * @param {string=} opt_authtoken
   * @param {boolean=} opt_forcesecure
   */
  function setupReceiver(targetId, opt_receiverurl, opt_authtoken, opt_forcesecure) {
    if (targetId === '..') {
      // Gadget/IFRAME to container.
      var rpctoken = opt_authtoken || params.rpctoken || params.ifpctok || "";
      if (window['__isgadget'] === true) {
        setupContainerGadgetContext(rpctoken, opt_forcesecure);
      } else {
        setupContainerGenericIframe(rpctoken, opt_receiverurl, opt_forcesecure);
      }
    } else {
      // Container to child.
      setupChildIframe(targetId, opt_receiverurl, opt_authtoken, opt_forcesecure);
    }
  }

  return /** @scope gadgets.rpc */ {
    config: function(config) {
      if (typeof config.securityCallback === 'function') {
        securityCallback = config.securityCallback;
      }
    },
    
    /**
     * Registers an RPC service.
     * @param {string} serviceName Service name to register.
     * @param {function(Object,Object)} handler Service handler.
     *
     * @member gadgets.rpc
     */
    register: function(serviceName, handler) {
      if (serviceName === CALLBACK_NAME || serviceName === ACK) {
        throw new Error("Cannot overwrite callback/ack service");
      }

      if (serviceName === DEFAULT_NAME) {
        throw new Error("Cannot overwrite default service:"
                        + " use registerDefault");
      }

      services[serviceName] = handler;
    },

    /**
     * Unregisters an RPC service.
     * @param {string} serviceName Service name to unregister.
     *
     * @member gadgets.rpc
     */
    unregister: function(serviceName) {
      if (serviceName === CALLBACK_NAME || serviceName === ACK) {
        throw new Error("Cannot delete callback/ack service");
      }

      if (serviceName === DEFAULT_NAME) {
        throw new Error("Cannot delete default service:"
                        + " use unregisterDefault");
      }

      delete services[serviceName];
    },

    /**
     * Registers a default service handler to processes all unknown
     * RPC calls which raise an exception by default.
     * @param {function(Object,Object)} handler Service handler.
     *
     * @member gadgets.rpc
     */
    registerDefault: function(handler) {
      services[DEFAULT_NAME] = handler;
    },

    /**
     * Unregisters the default service handler. Future unknown RPC
     * calls will fail silently.
     *
     * @member gadgets.rpc
     */
    unregisterDefault: function() {
      delete services[DEFAULT_NAME];
    },

    /**
     * Forces all subsequent calls to be made by a transport
     * method that allows the caller to verify the message receiver
     * (by way of the parent parameter, through getRelayUrl(...)).
     * At present this means IFPC or WPM.
     * @member gadgets.rpc
     */
    forceParentVerifiable: function() {
      if (!transport.isParentVerifiable()) {
        transport = gadgets.rpctx.ifpc;
      }
    },

    /**
     * Calls an RPC service.
     * @param {string} targetId Module Id of the RPC service provider.
     *                          Empty if calling the parent container.
     * @param {string} serviceName Service name to call.
     * @param {function()|null} callback Callback function (if any) to process
     *                                 the return value of the RPC request.
     * @param {*} var_args Parameters for the RPC request.
     *
     * @member gadgets.rpc
     */
    call: function(targetId, serviceName, callback, var_args) {
        // Si rpcId es vacío se vuelve a establecer su valor, por si la ventana
        // ha actualizado su nombre antes de invocar al método call
        if(rpcId == ""){
          rpcId = window.name;
        }
        targetId = targetId || '..';
        // Default to the container calling.
        var from = '..';
  
        if (targetId === '..') {
          from = rpcId;
        }

      ++callId;
      if (callback) {
        callbacks[callId] = callback;
      }
      var rpc = {
        s: serviceName,
        f: from,
        c: callback ? callId : 0,
        a: Array.prototype.slice.call(arguments, 3),
        t: authToken[targetId],
        l: useLegacyProtocol[targetId]
      };

      if (targetId !== '..' && !document.getElementById(targetId)) {
        // The target has been removed from the DOM. Don't even try.
        gadgets.log("WARNING: attempted send to nonexistent frame: " + targetId);
        return;
      }

      // If target is on the same domain, call method directly
      if (callSameDomain(targetId, rpc)) {
        return;
      }

      // Attempt to make call via a cross-domain transport.
      // Retrieve the transport for the given target - if one
      // target is misconfigured, it won't affect the others.
      var channel = receiverTx[targetId];
      if (!channel) {
        // Not set up yet. Enqueue the rpc for such time as it is.
        if (!earlyRpcQueue[targetId]) {
          earlyRpcQueue[targetId] = [ rpc ];
        } else {
          earlyRpcQueue[targetId].push(rpc);
        }
        return;
      }

      // If we are told to use the legacy format, then we must
      // default to IFPC.
      if (useLegacyProtocol[targetId]) {
        channel = gadgets.rpctx.ifpc;
      }

      if (channel.call(targetId, from, rpc) === false) {
        // Fall back to IFPC. This behavior may be removed as IFPC is as well.
        receiverTx[targetId] = fallbackTransport;
        transport.call(targetId, from, rpc);
      }
    },

    /**
     * Gets the relay URL of a target frame.
     * @param {string} targetId Name of the target frame.
     * @return {string|undefined} Relay URL of the target frame.
     *
     * @member gadgets.rpc
     */
    getRelayUrl: function(targetId) {
      var url = relayUrl[targetId];
      // Some RPC methods (wpm, for one) are unhappy with schemeless URLs.
      if (url && url.substring(0,1) === '/') {
        if (url.substring(1,2) === '/') {    // starts with '//'
          url = document.location.protocol + url;
        } else {    // relative URL, starts with '/'
          url = document.location.protocol + '//' + document.location.host + url;
        }
      }
      
      return url;
    },

    setRelayUrl: setRelayUrl,
    setAuthToken: setAuthToken,
    setupReceiver: setupReceiver,
    getAuthToken: getAuthToken,
    
    // Note: Does not delete iframe
    removeReceiver: function(receiverId) {
      delete relayUrl[receiverId];
      delete useLegacyProtocol[receiverId];
      delete authToken[receiverId];
      delete setup[receiverId];
      delete sameDomain[receiverId];
      delete receiverTx[receiverId];
    },

    /**
     * Gets the RPC relay mechanism.
     * @return {string} RPC relay mechanism. See above for
     *   a list of supported types.
     *
     * @member gadgets.rpc
     */
    getRelayChannel: function() {
      return transport.getCode();
    },

    /**
     * Receives and processes an RPC request. (Not to be used directly.)
     * Only used by IFPC.
     * @param {Array.<string>} fragment An RPC request fragment encoded as
     *        an array. The first 4 elements are target id, source id & call id,
     *        total packet number, packet id. The last element stores the actual
     *        JSON-encoded and URI escaped packet data.
     *
     * @member gadgets.rpc
     * @deprecated
     */
    receive: function(fragment, otherWindow) {
      if (fragment.length > 4) {
        process(gadgets.json.parse(
            decodeURIComponent(fragment[fragment.length - 1])));
      } else {
        relayOnload.apply(null, fragment.concat(otherWindow));
      }
    },

    /**
     * Receives and processes an RPC request sent via the same domain.
     * (Not to be used directly). Converts the inbound rpc object's
     * Array into a local Array to pass the process() Array test.
     * @param {Object} rpc RPC object containing all request params
     * @member gadgets.rpc
     */
    receiveSameDomain: function(rpc) {
      // Pass through to local process method but converting to a local Array
      rpc.a = Array.prototype.slice.call(rpc.a);
      window.setTimeout(function() { process(rpc); }, 0);
    },

    // Helper method to get the protocol://host:port of an input URL.
    // see docs above
    getOrigin: getOrigin,

    getReceiverOrigin: function(receiverId) {
      var channel = receiverTx[receiverId];
      if (!channel) {
        // not set up yet
        return null;
      }
      if (!channel.isParentVerifiable(receiverId)) {
        // given transport cannot verify receiver origin
        return null;
      }
      var origRelay = gadgets.rpc.getRelayUrl(receiverId) ||
                      gadgets.util.getUrlParameters().parent;
      return gadgets.rpc.getOrigin(origRelay);
    },

    /**
     * Internal-only method used to initialize gadgets.rpc.
     * @member gadgets.rpc
     */
    init: function() {
      // Conduct any global setup necessary for the chosen transport.
      // Do so after gadgets.rpc definition to allow transport to access
      // gadgets.rpc methods.
      if (transport.init(process, transportReady) === false) {
        transport = fallbackTransport;
      }

      if (isChild) {
        setupReceiver('..');
      }
    },

    /** Returns the window keyed by the ID. null/".." for parent, else child */
    _getTargetWin: getTargetWin,

    /** Create an iframe for loading the relay URL. Used by child only. */ 
    _createRelayIframe: function(token, data) {
      var relay = gadgets.rpc.getRelayUrl('..');
      if (!relay) {
        return null;
      }
      // Format: #targetId & sourceId & authToken & data
      var src = relay + '#..&' + rpcId + '&' + token + '&' +
          encodeURIComponent(gadgets.json.stringify(data));
  
      var iframe = document.createElement('iframe');
      iframe.style.border = iframe.style.width = iframe.style.height = '0px';
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';

      function appendFn() {
        // Append the iframe.
        document.body.appendChild(iframe);
  
        // Set the src of the iframe to 'about:blank' first and then set it
        // to the relay URI. This prevents the iframe from maintaining a src
        // to the 'old' relay URI if the page is returned to from another.
        // In other words, this fixes the bfcache issue that causes the iframe's
        // src property to not be updated despite us assigning it a new value here.
        iframe.src = 'javascript:"<html></html>"';
        iframe.src = src;
      }
      
      if (document.body) {
        appendFn();
      } else {
        gadgets.util.registerOnLoadHandler(function() { appendFn(); });
      }
      
      return iframe;
    },

    ACK: ACK,

    RPC_ID: rpcId,
    
    SEC_ERROR_LOAD_TIMEOUT: LOAD_TIMEOUT,
    SEC_ERROR_FRAME_PHISH: FRAME_PHISH,
    SEC_ERROR_FORGED_MSG : FORGED_MSG
  };
}();

// Initialize library/transport.
gadgets.rpc.init();

} // !end of double-inclusion guard
;
gadgets.config.init({"rpc":{"parentRelayUrl":"/SHINDIG/container/rpc_relay.html","useLegacyProtocol":false}});