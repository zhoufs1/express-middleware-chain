# express-middleware-chain
灵活、便于传输的express中间件工具

## 一、安装
```
npm i @byted/express-middleware-chain --save
```
## 二、快速使用

```
var express = require('express');
var app = express();

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var { MiddlewareChain, enhanceApp } = require('@byted/express-middleware-chain');

var chain = new MiddlewareChain();

chain
  .middleware('logger')
  .use((req, res, next) => {
    console.log('我是一个假logger,一会儿会有一个真的把我替换掉');
    next();
  }) //logger('dev')
  .end()

  .middleware('json')
  .use(express.json())
  .end()
  .before('logger')
  .use((req, res, next) => {
    console.log('我在logger前执行');
    next();
  })
  .end()

  .middleware('cookie')
  .use(cookieParser())
  .end()

  .before('cookie')
  .use(express.urlencoded({ extended: false }))
  .end()

  .after('cookie')
  .use(express.static(path.join(__dirname, 'public')))
  .end()

  .after('cookie')
  .use((req, res, next) => {
    console.log('我在cookie后执行');
    next();
  })
  .end()

  .before('cookie')
  .use((req, res, next) => {
    console.log('我在cookie前执行');
    next();
  })
  .end()

  .middleware('logger') //使用真实的logger替换假冒的logger，服务日志可以正确打印
  .use(logger('dev'))
  .end();

const config = chain.toConfig();

//此时app按顺序use了上述各个中间件
enhanceApp(app, config);

```
是不是非常简单，只需要提供中间件的名称和中间件，就可以生成中间件的配置。方便传输与展开配置。
