# express-middleware-chain
灵活、便于传输的express中间件工具

## 一、安装
npm i @byted/express-middleware-chain --save

## 二、快速使用

```
var express = require('express');
var app = express();

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var { MiddlewareChain, enhanceApp } = require('../../dist/index');

chain
  .middleware('logger')
  .use(logger('dev'))
  .end()
  .middleware('json')
  .use(express.json())
  .end()
  .middleware('urlEncoded')
  .use(express.urlencoded({ extended: false }))
  .end()
  .middleware('cookie')
  .use(cookieParser())
  .end()
  .middleware('static')
  .use(express.static(path.join(__dirname, 'public')))
  .end();

enhanceApp(app, chain.toConfig());

```
是不是非常简单，只需要提供中间件的名称和中间件，就可以生成中间件的配置。方便传输与展开配置。