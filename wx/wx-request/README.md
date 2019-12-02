### 微信 request 请求封装

#### 1. 支持功能

> access token 鉴权

> 请求/响应处理链

> 统一的请求解析,响应解析

#### 2. use

```
 import { Request } from "wx-conn"; // import

 // instantiation
 let request = new Request({...your config});

 // use
 request.executeRequest({
     method:...,
     url:...,
     data:...
 }).[then or catch];

 // single use

 request.get(url,data,options?).[then or catch]

 // global use

 global.request = request; // demo 1

 // or push request to global properties.

```
