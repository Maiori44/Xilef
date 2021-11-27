const VM = require('vm');

/**
 * @typedef {object} EvaluatorOptions
 * @property {?string[]} EvaluatorOptions.stdlibs
 * @property {?Record<string, unknown>} EvaluatorOptions.customModules
 * @property {?number} EvaluatorOptions.timeout
 */

/**
 * **Evaluate a JavaScript code using node's `vm` module.**
 *
 * @param {string} code - The code string to evaluate.
 * @param {VM.Context} [globals] - Globals to put. May be used to override other variables.
 * @param {EvaluatorOptions} config - Configurations for use. Properties may include:
 * - **`stdlibs`** {`string[]`} - node standard library modules to put.
 * - **`customModules`** {`{[K: string]: unknown}`} - custom modules to put. these modules
 *   can be accessed by `require('debug:<module>')`
 * - **`timeout`** {`number`} - the timout for the vm process.
 * @returns - The result of the last expression in the code. May be a {@link Promise}.
 */
function evaluate(code, globals, config = {}) {
  const context = {
    require: new Proxy(require, {
      apply(target, thisArg, [name]) {
        if (typeof name != 'string')
          throw new TypeError("The 'id' argument must be of type string.")

        if (require('module').builtinModules.includes(name)) {
          if (config?.stdlibs?.includes(name)) {
            return Reflect.apply(target, thisArg, [name]);
          } else throw new Error(`module '${name}' is restricted`);
        } else if (name.startsWith('debug:')) {
          return config.customModules[name.slice(6).toLowerCase()]
        } else throw new Error(`module '${name}' does not exist`);
      },
      get(target, property, receiver) {
        if (['cache', 'main'].includes(property))
          return 'restricted'
        else return Reflect.get(target, property,receiver)
      }
    }),
    ...globals
  };

  return new VM.Script(code, {
    filename: 'evaluate',
  }).runInNewContext(context, {
    breakOnSigint: true,
    timeout: config.timeout ?? 1000
  });
}

module.exports = evaluate;
