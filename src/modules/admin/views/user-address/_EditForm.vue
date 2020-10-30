<template>
  <el-form
    v-if="formModel"
    ref="formModel"
    :model="formModel"
    label-width="100px"
    label-suffix="："
    @submit.native.stop.prevent="handleFormSubmit('formModel')"
  >
    <el-form-item
      label="别名"
      prop="alias"
      :rules="[{ required: true, message: '请输入别名', trigger: 'blur' }]"
    >
      <el-col :md="3">
        <el-input v-model.trim="formModel.alias" />
      </el-col>
    </el-form-item>
    <el-form-item
      label="联系人"
      prop="name"
      :rules="[{ required: true, message: '请输入联系人', trigger: 'blur' }]"
    >
      <el-col :md="5">
        <el-input v-model.trim="formModel.name" />
      </el-col>
    </el-form-item>
    <el-form-item
      label="联系电话"
      prop="phone"
      :rules="[{ required: true, message: '请输入联系电话', trigger: 'blur' }]"
    >
      <el-col :md="7">
        <el-input v-model.trim="formModel.phone" />
      </el-col>
    </el-form-item>
    <el-form-item
      label="详细地址"
      prop="address"
      :rules="[{ required: true, message: '请输入详细地址', trigger: 'blur' }]"
    >
      <el-col :md="9">
        <el-input v-model.trim="formModel.address" />
      </el-col>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit" :loading="submitLoading">
        {{ submitText }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import UnprocessableEntityHttpErrorMixin from '@admin/mixins/UnprocessableEntityHttpErrorMixin'

export default {
  mixins: [UnprocessableEntityHttpErrorMixin],
  props: {
    submitText: {
      type: String,
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    userAddress: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      submitLoading: false,
      formModel: null,
    }
  },
  created() {
    this.formModel = Object.assign({}, this.userAddress)
  },
  methods: {
    handleFormSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }

        this.submitLoading = true

        this.$emit(
          'on-submit',
          this.formModel,
          () => {
            this.$refs[formName].clearValidate()
          },
          (error) => {
            this.handleViolationError(error, formName)
          },
          () => {
            this.submitLoading = false
          }
        )
      })
    },
  },
}
</script>
