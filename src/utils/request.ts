import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getToken } from '@/utils'
import router from '@/router'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}


// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '/',
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 优先从 store 获取 token，如果为空则直接从 Cookie 获取
    const userStore = useUserStore()
    let token = userStore.token
    
    // 如果 store 中的 token 为空，直接从 Cookie 读取
    if (!token) {
      token = getToken() || ''
    }

    console.log('request token from store:', userStore.token)
    console.log('request token from cookie:', getToken())
    console.log('final token:', token)
    
    if (token) {
      config.headers = {
        ...config.headers,
       "X-Auth-Token": `${token}`
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const { data } = response

    // 兼容多种响应格式
    if (typeof data === 'object' && data !== null) {
      // 格式1: { code: 0, message: '', data: {...} }
      if (data.code !== undefined) {
        if (data.code === 0) {
          return data.data
        } else {
          return Promise.reject(new Error(data.message || '请求失败'))
        }
      }

      // 格式2: 直接返回数据 { token: '', user: {...} }
      // 格式3: 其他成功响应格式
      if (data.token || data.user || data.id) {
        return data
      }

      // 格式4: 标准的成功响应
      if (data.success === true || data.status === 'success') {
        return data.data || data
      }

      // 如果都不匹配，直接返回原数据
      return data
    }

    // 非对象类型的响应
    return data
  },
  (error) => {
    const { response } = error
    
    if (response) {
      switch (response.status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          const userStore = useUserStore()
          userStore.resetState()
          router.push('/login')
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(response.data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default service