<template>
  <el-form
    v-if="formModel"
    :model="formModel"
    ref="formRef"
    label-width="100px"
    label-suffix="："
    @submit="handleSubmit(onSubmit)"
  >
    <el-form-item label="上级地区" prop="parentId" :error="errors.parentId">
      <el-col :span="12">
        <district-cascader
          placeholder="请选择上级地区"
          v-model="getDistrictParents"
          :leaf-length="6"
          :disabled-codes="[district.code]"
        >
        </district-cascader>
      </el-col>
    </el-form-item>
    <el-form-item
      label="地区名称"
      prop="name"
      :error="errors.name"
      :rules="[{ required: true, message: '请输入地区名称', trigger: 'blur' }]"
    >
      <el-col :span="7">
        <el-input v-model.trim="formModel.name" />
      </el-col>
    </el-form-item>
    <el-form-item
      label="地区代码"
      prop="code"
      :error="errors.code"
      :rules="[{ required: true, message: '请输入地区代码', trigger: 'blur' }]"
    >
      <el-col :md="7">
        <el-input class="text-mono" v-model.trim="formModel.code" />
      </el-col>
    </el-form-item>
    <el-form-item label="地区邮编" prop="zipCode" :error="errors.zipCode">
      <el-col :md="7">
        <el-input v-model.trim="formModel.zipCode" />
      </el-col>
    </el-form-item>
    <el-form-item label="电话区号" prop="areaCode" :error="errors.areaCode">
      <el-col :md="7">
        <el-input v-model.trim="formModel.areaCode" />
      </el-col>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        :disabled="!canSubmit"
        native-type="submit"
        :loading="loading"
        >{{ submitText }}
      </el-button>

      <el-button
        v-if="isEdit"
        :disabled="!this.$can('district/delete')"
        plain
        type="danger"
        size="small"
        @click="districtDelete"
      >
        删除
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import DistrictCascader from '@admin/components/DistrictCascader'
import { useForm } from '@shared/hooks/useForm'
import { computed, ref, toRaw } from 'vue'

export default {
  components: { DistrictCascader },
  props: {
    submitText: {
      type: String,
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    canSubmit: {
      type: Boolean,
      default: false,
    },
    district: {
      type: Object,
    },
    districtParents: {
      type: Array,
    },
  },
  setup(props, { emit }) {
    const { loading, form, errors, setErrors, handleSubmit } = useForm(
      props.district
    )
    const formRef = ref()

    const getDistrictParents = computed({
      get: () => props.districtParents,
      set: (value) => {
        emit('update:districtParents', value)
        form.parentId = value[value.length - 1]
      },
    })

    const districtDelete = () => {
      emit('on-delete', toRaw(form))
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

    return {
      loading,
      formModel: form,
      errors,
      formRef,
      handleSubmit,
      getDistrictParents,
      districtDelete,
      onSubmit,
    }
  },
}
</script>
