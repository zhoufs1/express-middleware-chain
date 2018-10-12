"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.enhanceApp = enhanceApp;
exports.MiddlewareChain = void 0;

var _constant = require("./constant");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class MiddlewareChain {
  constructor() {
    this._index = 0;
    this._chain = new Map();
    this._tempKey = undefined;
    this.initMethods();
  }

  static isChainNode(unknown) {
    return unknown instanceof ChainNode;
  }

  initMethods() {
    _constant.appMethods.forEach(methodName => {
      this[methodName] = (path, middleware) => {
        if (typeof path !== 'string') {
          middleware = path;
          path = '/';
        }

        this.checkHasTempKey();
        debugger;
        const idx = this._index++;
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
  }

  _addMiddleware(chainNode) {
    if (this._chain.get(chainNode.name) !== undefined) {
      throw new Error(`已经存在注册的中间件 ${middlewareKey}，请重新命名`);
    }

    this._chain.set(chainNode.name, chainNode);

    delete this._tempKey;
    return this;
  }

  middleware(name) {
    if (!typeof name === 'string') {
      throw new Error('请输入一个字符串作为中间件的key');
    }

    this._tempKey = name;
    return this;
  }

  remove(name) {
    this._chain.delete(name);

    return this;
  }

  checkHasTempKey() {
    if (this._tempKey === undefined) {
      throw new Error('请先调用.add(name)方法为这个中间件注册一个名称');
    }
  }

  end() {
    return this;
  }

  toConfig() {
    const result = [];

    this._chain.forEach(v => {
      result.push(v);
    });

    this._config = result.sort((a, b) => a.idx > b.idx);
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
      middleware
    } = item;
    console.log(item);
    app[method](path, middleware);
  });
}

class ChainNode {
  constructor(obj) {
    return _objectSpread({}, obj);
  }

}