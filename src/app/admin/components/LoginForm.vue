<template>
  <el-form
    ref="loginFormRef"
    :model="loginForm"
    :rules="loginFromRules"
    @submit.prevent="loginSubmit()"
  >
    <el-form-item prop="account" :error="loginFormError.account">
      <el-input
        v-model.trim="loginForm.account"
        placeholder="手机号码或者电子邮箱"
        type="text"
        prefix-icon="el-icon-user"
      />
    </el-form-item>
    <el-form-item prop="password" :error="loginFormError.password">
      <el-input
        v-model.trim="loginForm.password"
        placeholder="密码"
        type="password"
        prefix-icon="el-icon-lock"
      />
    </el-form-item>
    <el-form-item v-if="captcha" prop="captcha" :error="loginFormError.captcha">
      <el-input
        class="uppercase"
        v-model.trim="loginForm.captcha"
        placeholder="验证码"
        type="text"
        auto-complete="off"
        prefix-icon="el-icon-view"
      >
        <template v-slot:append>
          <img
            style="cursor: pointer; vertical-align: middle"
            @click="updateCaptcha"
            alt="点击更新验证码"
            title="点击更新验证码"
            :src="captcha.image"
          />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        :style="{ width: '100%' }"
        native-type="submit"
        :loading="submitLoading"
      >
        确 定
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { useHttpClient } from '@shared/plugins/HttpClient'
import { reactive, ref } from 'vue'
import { ElNotification } from 'element-plus'
import { useStore } from 'vuex'
import { useFormError } from '@admin/hooks/useFormError'

export default {
  name: 'LoginForm',
  props: {
    inModal: {
      type: Boolean,
    },
  },
  emits: ['submit'],
  setup() {
    const httpClient = useHttpClient()

    const store = useStore()

    const { getViolation, handleViolation } = useFormError()

    const submitLoading = ref(false)
    const captcha = ref(null)
    const loginForm = reactive({
      account: '',
      password: '',
      captcha: '',
    })
    const loginFormError = reactive({})
    const loginFormRef = ref(null)

    const loginFromRules = reactive({
      account: [{ required: true, message: '请输入帐号', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
    })

    const updateCaptcha = async () => {
      const { data } = await httpClient.get('open/captcha', null, false, true)

      captcha.value = data
      loginForm.captcha = ''
    }

    const removeCaptcha = () => {
      captcha.value = null
      loginForm.captcha = ''
    }

    const loginSubmit = async () => {
      const valid = await loginFormRef.value.validate()

      if (!valid) {
        return false
      }

      submitLoading.value = true

      let loginFormData

      if (captcha.value) {
        // eslint-disable-next-line no-new-func
        const captchaProcess = new Function('captcha', captcha.value.process)

        loginFormData = Object.assign({}, loginForm, {
          captcha: captchaProcess(loginForm.captcha),
        })
      } else {
        loginFormData = loginForm
      }

      const { data, error } = await httpClient.post(
        'auth/login',
        loginFormData,
        null,
        false
      )

      if (data) {
        await store.dispatch('auth/login', data)

        ElNotification.success({
          title: data.message,
          message: '欢迎光临 Agile 管理系统',
          duration: 2000,
        })

        this.$emit('on-success')
      }

      if (error) {
        let violations = getViolation(error)

        if (violations) {
          const violationCaptcha = violations.find((violation) => {
            return violation.field.split('.').pop() === 'captcha'
          })

          if (violationCaptcha) {
            await updateCaptcha()
          } else {
            removeCaptcha()
          }
        }

        handleViolation(violations, loginFormError)
      }

      submitLoading.value = false
    }

    return {
      submitLoading,
      loginForm,
      loginFromRules,
      loginFormRef,
      loginFormError,
      captcha,
      updateCaptcha,
      removeCaptcha,
      loginSubmit,
    }
  },
}
</script>
