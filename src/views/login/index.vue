<template>
  <div>
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <h2>Admin System</h2>
          <p>欢迎登录后台管理系统</p>
        </div>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username" required>
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
              required
            />
          </el-form-item>

          <el-form-item prop="password" required>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
              required
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import type { LoginForm } from '@/types'
import Starfield from '@/components/Starfield.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const captchaCanvas = ref<HTMLCanvasElement>()
const loading = ref(false)
const captchaText = ref('')

const loginForm = reactive<LoginForm>({
  username: 'admin',
  password: '123456',
  captcha: '',
  remember: false
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value.toLowerCase() !== captchaText.value.toLowerCase()) {
          callback(new Error('验证码错误'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 生成随机验证码
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 绘制验证码
const drawCaptcha = () => {
  if (!captchaCanvas.value) return

  const canvas = captchaCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 设置背景
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 生成验证码文本
  captchaText.value = generateCaptcha()

  // 绘制验证码文本
  ctx.font = '20px Arial'
  ctx.fillStyle = '#333'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < captchaText.value.length; i++) {
    const char = captchaText.value[i]
    const x = 20 + i * 20
    const y = 20 + Math.random() * 10 - 5
    const angle = (Math.random() - 0.5) * 0.5

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  }

  // 添加干扰线
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
    ctx.beginPath()
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.stroke()
  }

  // 添加干扰点
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
    ctx.beginPath()
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI)
    ctx.fill()
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  drawCaptcha()
  loginForm.captcha = ''
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    await userStore.loginAction(loginForm)

    ElMessage.success('登录成功')

    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error) {
    console.error('Login failed:', error)
    // 登录失败时刷新验证码
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  drawCaptcha()
})
</script>

<style scoped lang="scss">
@use '@/styles/theme.scss' as vars;

:deep(.el-button) {
  border: 0;
}

.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('@/assets/cns8.png');
  background-size: cover;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0);
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  color: vars.$primary-color;

  h2 {
    margin-bottom: 10px;
  }

  p {
    font-size: 14px;
  }
}

.login-form {
  .login-btn {
    width: 100%;
  }

  .captcha-container {
    display: flex;
    align-items: center;

    .captcha-image {
      cursor: pointer;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      background: #fff;
      transition: border-color 0.3s;

      &:hover {
        border-color: #409eff;
      }

      canvas {
        display: block;
      }
    }
  }
}
</style>
