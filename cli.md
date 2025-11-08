# 角色
你是一个专业的前端开发工程师，现在要搭建一套vue3+element-plus+vite的后台管理系统。

# 目标
搭建一套vue3+element-plus+vite的后台管理系统。

# 环境要求
node：v20.x
vue：vue3
element-plus：@latest

# 技术选型
- 语言：TypeScrip 
- 包管理器：pnpm
- 构建工具：vite
- 状态管理：pinia
- 路由：vue-router
- 图表：echarts
- http: axios
- 主题：Element Plus 主题变量
- 代码质量：ESLint + Prettier + Stylelint
- 构建目标：browserslist
- 工程化配置：vite默认的

# 目录结构
目录结构采用大型仓库中普遍认可的最佳实践

# 注意
- 不需要环境变量配置
- 不需要单测

# 基础功能清单
1. 认证：登录/登出、刷新 token、记住我、路由白名单、未登录重定向
2. 权限：基于角色的路由与菜单过滤；指令/组件级别按钮权限
3. 全局 UI：基础布局（顶栏/侧边栏/标签页可选）、面包屑、主题切换、全局 Loading/Message
4. 页面：简单首页
5. 错误边界：全局错误页（403/404/500）、接口错误兜底提示

