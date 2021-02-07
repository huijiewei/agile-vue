<template>
  <el-form
    ref="formRef"
    :model="form"
    label-width="100px"
    label-suffix="："
    @submit.prevent="handleSubmit(onSubmit)"
  >
    <el-form-item
      label="手机号码"
      prop="phone"
      :error="errors.phone"
      :rules="[{ required: true, message: '请输入手机号码', trigger: 'blur' }]"
    >
      <el-col :md="9">
        <el-input v-model.trim="form.phone" />
      </el-col>
    </el-form-item>
    <el-form-item
      label="电子邮箱"
      prop="email"
      :error="errors.email"
      :rules="[{ required: true, message: '请输入电子邮箱', trigger: 'blur' }]"
    >
      <el-col :md="9">
        <el-input v-model.trim="form.email" />
      </el-col>
    </el-form-item>
    <el-form-item
      label="密码"
      prop="password"
      :error="errors.password"
      :rules="validatePassword"
    >
      <el-col :md="6">
        <el-input
          v-model.trim="form.password"
          type="password"
          autocomplete="off"
          show-password
        />
      </el-col>
      <el-col v-if="isEdit" :md="18">
        <span class="form-help form-help-inline">密码留空表示不修改密码</span>
      </el-col>
    </el-form-item>
    <el-form-item
      label="密码确认"
      prop="passwordConfirm"
      :error="errors.passwordConfirm"
      :rules="validatePasswordConfirm"
    >
      <el-col :md="6">
        <el-input
          v-model.trim="form.passwordConfirm"
          type="password"
          autocomplete="off"
          show-password
        />
      </el-col>
    </el-form-item>
    <el-form-item label="姓名" prop="name" :error="errors.name">
      <el-col :md="3">
        <el-input v-model.trim="form.name" />
      </el-col>
    </el-form-item>
    <el-form-item label="头像" prop="avatar" :error="errors.avatar">
      <avatar-upload v-model.trim="form.avatar" />
    </el-form-item>
    <el-form-item
      label="管理组"
      :error="errors.adminGroupId"
      prop="adminGroupId"
      :rules="[
        {
          required: true,
          message: '请选择所属管理组',
          trigger: 'change',
        },
      ]"
    >
      <el-col :md="5">
        <remote-select
          v-model="form.adminGroupId"
          :disabled="currentUserId === form.id"
          placeholder="所属管理组"
          option-value="id"
          option-label="name"
          :remote-method="loadAdminGroups"
        ></remote-select>
      </el-col>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit" :loading="loading">
        {{ submitText }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import AvatarUpload from '@admin/components/upload/AvatarUpload'
import RemoteSelect from '@admin/components/RemoteSelect'
import { useStore } from 'vuex'
import { computed, ref, toRaw } from 'vue'
import { useForm } from '@shared/hooks/useForm'
import { useHttpClient } from '@shared/plugins/HttpClient'

export default {
  components: { RemoteSelect, AvatarUpload },
  props: {
    submitText: {
      type: String,
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    admin: {
      type: Object,
      default: null,
    },
  },
  setup(props, { emit }) {
    const store = useStore()
    const httpClient = useHttpClient()

    const { loading, form, errors, setErrors, handleSubmit } = useForm({
      ...props.admin,
      password: '',
      passwordConfirm: '',
    })

    const formRef = ref()

    const currentUserId = computed(() => {
      return store.getters['auth/getCurrentUser']?.id || 0
    })

    const loadAdminGroups = async (callback) => {
      const { data } = await httpClient.get('misc/admin-groups', null, false)

      callback(data)
    }

    const onSubmit = async () => {
      formRef.value.validate((valid) => {
        if (!valid) {
          return false
        }

        loading.value = true

        emit(
          'on-submit',
          toRaw(form),
          () => {
            formRef.value.clearValidate()
          },
          async (error) => {
            await setErrors(error)
          },
          () => {
            loading.value = false
          }
        )
      })
    }

    const validatePassword = []
    const validatePasswordConfirm = []

    if (!props.isEdit) {
      validatePassword.push({
        required: true,
        message: '请输入密码',
        trigger: 'blur',
      })
      validatePasswordConfirm.push({
        required: true,
        message: '请输入密码确认',
        trigger: 'blur',
      })
    }

    validatePassword.push({
      validator: (rule, value, callback) => {
        if (form.passwordConfirm !== '') {
          formRef.value.validateField('passwordConfirm')
        }
        callback()
      },
      trigger: 'blur',
    })

    validatePasswordConfirm.push({
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('密码与密码确认不一致!'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    })

    return {
      currentUserId,
      loading,
      form,
      errors,
      formRef,
      handleSubmit,
      onSubmit,
      loadAdminGroups,
      validatePassword,
      validatePasswordConfirm,
    }
  },
}
</script>
