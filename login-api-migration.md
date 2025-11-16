# 登录接口迁移指南

## 📋 概述

已成功将登录系统从纯Mock API迁移到支持真实API的架构，同时保留了开发环境的Mock功能。

## 🔧 主要修改

### 1. API接口更新 (`src/api/auth.ts`)
- ✅ 登录接口改为调用真实API `/api/auth/login`
- ✅ 获取用户信息接口 `/api/auth/user`
- ✅ 刷新Token接口 `/api/auth/refresh`
- ✅ 登出接口 `/api/auth/logout`
- ✅ 保留Mock模式支持，可灵活切换

### 2. 请求拦截器优化 (`src/utils/request.ts`)
- ✅ 增强响应格式兼容性
- ✅ 支持多种API响应格式
- ✅ 完善错误处理机制

### 3. 开发工具增强 (`src/utils/dev-tools.ts`)
- ✅ 新增API模式切换功能
- ✅ 支持Mock/真实API动态切换
- ✅ 完善的控制台工具

## 🌐 API配置

### 服务器代理配置
在 `vite.config.ts` 中已配置API代理：
```typescript
proxy: {
  '/api': {
    target: 'http://49.232.241.94:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

### 接口地址映射
- 前端调用: `/api/auth/login`
- 实际请求: `http://49.232.241.94:8080/auth/login`

## 🧪 测试指南

### 1. 开发环境测试
启动开发服务器：
```bash
npm run dev
# 或
pnpm dev
```

### 2. API模式切换
在浏览器控制台中：
```javascript
// 切换到Mock API模式
window.DEV_TOOLS.toggleApiMode(true)

// 切换到真实API模式
window.DEV_TOOLS.toggleApiMode(false)

// 查看当前模式
console.log('当前API模式:', window.DEV_TOOLS ? 'Mock' : '真实API')
```

### 3. 测试账号
#### Mock模式测试账号：
- admin / 123456 (管理员)
- developer / 123456 (开发者)
- user / 123456 (普通用户)

#### 真实API测试：
需要后端API提供真实的认证接口

## 📡 API接口规范

### 登录接口
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "用户名",
  "password": "密码",
  "captcha": "验证码",
  "remember": false
}
```

**响应格式：**
```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "用户名",
    "email": "邮箱",
    "avatar": "头像URL",
    "roles": ["user", "admin"],
    "permissions": ["read", "write"]
  }
}
```

### 获取用户信息
```http
GET /api/auth/user
Authorization: Bearer <token>
```

### 刷新Token
```http
POST /api/auth/refresh
Authorization: Bearer <token>
```

### 登出
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

## 🔍 调试功能

### 1. 控制台日志
所有API调用都会在控制台输出详细日志：
- 🌐 真实API调用标记
- 🔧 Mock API调用标记
- 请求URL和参数
- 响应数据
- 错误信息

### 2. 网络面板
在浏览器开发者工具的网络面板中查看：
- 实际请求URL
- 请求头和响应头
- 响应数据
- 状态码和耗时

### 3. 开发工具快捷方法
```javascript
// 快速登录不同角色
window.DEV_TOOLS.loginAsAdmin()
window.DEV_TOOLS.loginAsDev()
window.DEV_TOOLS.loginAsUser()

// 清除认证信息
window.DEV_TOOLS.clearAuth()

// 切换API模式
window.DEV_TOOLS.toggleApiMode()
```

## ⚠️ 注意事项

### 1. 生产环境
- 生产环境始终使用真实API
- Mock功能仅在开发环境可用
- 确保后端API地址正确配置

### 2. 错误处理
- 网络错误会显示用户友好的提示
- API响应格式异常会记录详细日志
- 登出失败不会阻止前端状态清理

### 3. 兼容性
- 支持多种API响应格式
- 向后兼容原有的Mock数据
- 渐进式迁移，支持新旧系统并存

## 🚀 下一步

1. **后端API开发**：确保后端提供对应的认证接口
2. **接口测试**：使用Postman等工具测试API功能
3. **安全配置**：配置HTTPS、CORS等安全设置
4. **性能优化**：添加请求缓存、限流等机制
5. **监控日志**：完善API调用的监控和日志记录

---

**迁移完成时间：** 2025-11-16
**当前状态：** ✅ 已完成Mock/真实API混合架构