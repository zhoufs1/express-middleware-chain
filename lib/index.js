import { appMethods } from "./constant";
import invariant from './utils/invariant';

export class MiddlewareChain {
  constructor() {
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
    appMethods.forEach(this._applyAppMethod)
  }

  _applyAppMethod = (methodName) => {
    this[methodName] = (path, middleware) => {

      if (typeof path !== 'string') {
        middleware = path;
        path = '/'
      }

      this._checkHasTempKey();
      const middlewareName = this._tempKey;


      if (this._isBefore || this._isAfter) {
        return this._extendMiddleware({
          name: middlewareName,
          methodName,
          middleware,
          isBefore : this._isBefore,
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

      return this._addMiddleware(node)
    };

  };

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
    invariant(
      typeof name === 'string',
      `请输入一个字符串作为中间件的key`
    );

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

    invariant(
      hasBaseChainNode,
      '中间件不存在'
    );

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

    invariant(
      hasBaseChainNode,
      '中间件不存在'
    );

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
    invariant(
      this._tempKey !== undefined,
      '请先调用.add(name)方法为这个中间件注册一个名称'
    );
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

    this._chain.forEach((v) => {
      result.push(v);
    });

    this._config = result.sort((a, b) => (a.idx > b.idx) ? 1 : -1);

    delete this._chain;
    return this._config;
  }

}

export function enhanceApp(app, config) {

  if (!Array.isArray(config)) {
    throw new Error('请输入一个合法的配置')
  }

  config.forEach((item) => {
    const { method, path, middleware, before, after } = item;

    if (before.length > 0) {
      before.forEach((extend) => {
        app[extend.method](extend.path, extend.middleware)
      })
    }

    if (after.length > 0) {
      after.forEach((extend) => {
        app[extend.method](extend.path, extend.middleware)
      })
    }

    app[method](path, middleware);
  })
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
    return {
      ...defaultNode,
      ...obj
    }
  }
}
