"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.enhanceApp = enhanceApp;
exports.MiddlewareChain = void 0;

var _constant = require("./constant");

var _invariant = _interopRequireDefault(require("./utils/invariant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class MiddlewareChain {
  constructor() {
    _defineProperty(this, "_applyAppMethod", methodName => {
      this[methodName] = (path, middleware) => {
        if (typeof path !== 'string') {
          middleware = path;
          path = '/';
        }

        this._checkHasTempKey();

        const middlewareName = this._tempKey;

        if (this._isBefore || this._isAfter) {
          return this._extendMiddleware({
            name: middlewareName,
            methodName,
            middleware,
            isBefore: this._isBefore,
            path
          });
        }

        const isMiddlewareExist = this._chain.has(middlewareName);

        let idx;

        if (isMiddlewareExist) {
          console.warn(`中间件${middlewareName}已经存在，原有中间件将被替换`);
          idx = this._chain.get(middlewareName).idx;
        } else {
          idx = this._index++;
        }

        const node = new ChainNode({
          idx,
          method: methodName,
          middleware,
          path,
          name: this._tempKey
        });
        return this._addMiddleware(node);
      };
    });

    this._index = 0;
    this._chain = new Map();
    this._tempKey = undefined;
    this._isBefore = false;
    this._isAfter = false;
    this.initMethods();
  }
  /**
   * 初始化库导出的各个方法
   * from appMethods
   */


  initMethods() {
    _constant.appMethods.forEach(this._applyAppMethod);
  }

  /**
   * 缇娜家一个中间件
   * @param chainNode
   * @returns {MiddlewareChain}
   * @private
   */
  _addMiddleware(chainNode) {
    this._chain.set(chainNode.name, chainNode);

    delete this._tempKey;
    return this;
  }
  /**
   * 声明一个中间件
   * @param name
   * @returns {MiddlewareChain}
   */


  middleware(name) {
    (0, _invariant.default)(typeof name === 'string', `请输入一个字符串作为中间件的key`);
    this._tempKey = name;
    this._isAfter = this._isBefore = false;
    return this;
  }
  /**
   * 在某个中间件前挂载的中间件
   * @param name
   * @returns {MiddlewareChain}
   */


  before(name) {
    const hasBaseChainNode = this._chain.has(name);

    (0, _invariant.default)(hasBaseChainNode, '中间件不存在');
    this._isBefore = true;
    this._isAfter = false;
    this._tempKey = name;
    return this;
  }
  /**
   * 在某个中间件后挂载的中间件
   * @param name
   * @returns {MiddlewareChain}
   */


  after(name) {
    const hasBaseChainNode = this._chain.has(name);

    (0, _invariant.default)(hasBaseChainNode, '中间件不存在');
    this._isBefore = false;
    this._isAfter = true;
    this._tempKey = name;
    return this;
  }

  _extendMiddleware({
    name,
    methodName,
    middleware,
    isBefore,
    path
  }) {
    const baseChainNode = this._chain.get(name);

    const extendChainNode = new ChainNode({
      method: methodName,
      middleware,
      path,
      name: this._tempKey
    });

    if (isBefore) {
      baseChainNode.before.unshift(extendChainNode);
    } else {
      baseChainNode.after.push(extendChainNode);
    }

    return this;
  }
  /**
   * 删除一个中间件
   * @param name
   * @returns {MiddlewareChain}
   */


  remove(name) {
    this._chain.delete(name);

    return this;
  }
  /**
   * 检查是否在调用appMethods之前调用了 .middleware(string)
   * @private
   */


  _checkHasTempKey() {
    (0, _invariant.default)(this._tempKey !== undefined, '请先调用.add(name)方法为这个中间件注册一个名称');
  }
  /**
   * 这个方法纯粹是为了调用链好看一点
   * @returns {MiddlewareChain}
   */


  end() {
    return this;
  }
  /**
   * 将this._chain转化为数组类型的this._config
   * @returns {Array}
   */


  toConfig() {
    if (this._config) {
      return this._config;
    }

    const result = [];

    this._chain.forEach(v => {
      result.push(v);
    });

    this._config = result.sort((a, b) => a.idx > b.idx ? 1 : -1);
    delete this._chain;
    return this._config;
  }

}

exports.MiddlewareChain = MiddlewareChain;

function enhanceApp(app, config) {
  if (!Array.isArray(config)) {
    throw new Error('请输入一个合法的配置');
  }

  config.forEach(item => {
    const {
      method,
      path,
      middleware,
      before,
      after
    } = item;

    if (before.length > 0) {
      before.forEach(extend => {
        app[extend.method](extend.path, extend.middleware);
      });
    }

    if (after.length > 0) {
      after.forEach(extend => {
        app[extend.method](extend.path, extend.middleware);
      });
    }

    app[method](path, middleware);
  });
}

class ChainNode {
  constructor(obj) {
    const defaultNode = {
      idx: -1,
      method: 'get',
      middleware: undefined,
      path: '/',
      name: Symbol(),
      before: [],
      after: []
    };
    return _objectSpread({}, defaultNode, obj);
  }

}