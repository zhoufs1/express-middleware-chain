import { appMethods } from "./constant";

export class MiddlewareChain {
  constructor() {
    this._index = 0;
    this._chain = new Map();
    this._tempKey = undefined;

    this.initMethods();
  }

  initMethods() {
    appMethods.forEach((methodName) => {
      this[methodName] = (path, middleware) => {

        if (typeof path !== 'string') {
          middleware = path;
          path = '/'
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

        return this._addMiddleware(node)
      };

    })
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
    if (this._config) {
      return this._config;
    }

    const result = [];

    this._chain.forEach((v) => {
      result.push(v);
    });

    this._config = result.sort((a, b) => a.idx > b.idx);

    delete this._chain;
    return this._config;
  }

}

export function enhanceApp(app, config) {
  if (!Array.isArray(config)) {
    throw new Error('请输入一个合法的配置')
  }

  config.forEach((item) => {
    const { method, path, middleware } = item;
    app[method](path, middleware);
  })
}

class ChainNode {
  constructor(obj) {
    return {
      ...obj
    }
  }
}