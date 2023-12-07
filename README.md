# 火鹏运营平台日志消费服务

#### 欢迎访问 [openhn官网](https://www.openhn.com) 
#### 前往更详细 [部署文档](https://www.openhn.com/development-manual) 

## 项目结构

项目目录结构
| 文件或文件夹 | 作用                             |
| ------------ | ------------------------------|
| src          | 后端 - nestjs                  |
| scripts      | 存放所有的 shell 命令            |
| logs         | 服务日志                        |

## 开发流程

### 初次开发

**开发环境准备**
- Node（18.18.2)
- 采用 [scripty](https://www.npmjs.com/package/scripty) 管理本项目的所有命令。所有的命令（shell 文件）定义在 `scripts`
  文件夹下。

### 开发命令

```sh
# 初始化，拉取依赖，编译成js
npm run bootstrap

# 启动 （服务端），本地环境开发
npm run start

# 启动 （服务端），测试环境
npm run start:test

# 启动 （服务端），生产环境
npm run start:prod

