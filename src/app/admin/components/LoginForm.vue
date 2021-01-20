<template>
  <el-form ref="formRef" :model="form" @submit.prevent="submit()">
    <el-form-item
      prop="account"
      :error="errors.account"
      :rules="[{ required: true, message: '请输入帐号', trigger: 'blur' }]"
    >
      <el-input
        v-model.trim="form.account"
        placeholder="手机号码或者电子邮箱"
        type="text"
        prefix-icon="el-icon-user"
      />
    </el-form-item>
    <el-form-item
      prop="password"
      :error="errors.password"
      :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]"
    >
      <el-input
        v-model.trim="form.password"
        placeholder="密码"
        type="password"
        prefix-icon="el-icon-lock"
      />
    </el-form-item>
    <el-form-item
      v-if="captcha"
      prop="captcha"
      :error="errors.captcha"
      :rules="[{ required: true, message: '请输入验证码', trigger: 'blur' }]"
    >
      <el-input
        class="uppercase"
        v-model.trim="form.captcha"
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
        :loading="loading"
      >
        确 定
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { useHttpClient } from '@shared/plugins/HttpClient'
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import { useStore } from 'vuex'
import { useForm } from '@shared/hooks/useForm'

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

    const { loading, form, errors, submit } = useForm({
      data: { account: '', password: '', captcha: '' },
      validator: async () => {
        return await formRef.value.validate()
      },
      onSubmit: async (data) => {
        return await httpClient.post('auth/login', data, null, false)
      },
      onSuccess: async (data) => {
        await store.dispatch('auth/login', data)

        ElNotification.success({
          title: data.message,
          message: '欢迎光临 Agile 管理系统',
          duration: 2000,
        })

        // this.$emit('on-success')
      },
      onError: async (errors) => {
        if (errors.captcha) {
          await updateCaptcha()
        } else {
          removeCaptcha()
        }
      },
      beforeSubmit: (data) => {
        if (captcha.value) {
          // eslint-disable-next-line no-new-func
          const captchaProcess = new Function('captcha', captcha.value.process)

          return Object.assign({}, data, {
            captcha: captchaProcess(data.captcha),
          })
        }
        return data
      },
    })

    const captcha = ref(null)
    const formRef = ref()

    const updateCaptcha = async () => {
      const { data } = await httpClient.get('open/captcha', null, false, true)

      captcha.value = data
      form.captcha = ''
    }

    const removeCaptcha = () => {
      captcha.value = null
      form.captcha = ''
    }

    return {
      submit,
      loading,
      form,
      errors,
      formRef,
      captcha,
      updateCaptcha,
      removeCaptcha,
    }
  },
}
</script>
