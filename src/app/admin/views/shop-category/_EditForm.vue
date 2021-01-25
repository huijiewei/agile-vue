<template>
  <el-form
    v-if="formModel"
    :model="formModel"
    ref="formRef"
    label-width="100px"
    label-suffix="："
    @submit.prevent="handleSubmit(onSubmit)"
  >
    <el-form-item label="所属分类" prop="parentId" :error="errors.parentId">
      <el-col :md="16">
        <el-cascader
          style="width: 100%"
          placeholder="请选择上级分类"
          :options="getCategoryTree"
          :props="{ value: 'id', label: 'name', checkStrictly: true }"
          v-model="getCategoryParents"
        >
        </el-cascader>
      </el-col>
    </el-form-item>
    <el-form-item
      label="分类名称"
      prop="name"
      :error="errors.name"
      :rules="[
        { required: true, message: '请输入商品分类名称', trigger: 'blur' },
      ]"
    >
      <el-col :span="12">
        <el-input v-model.trim="formModel.name" />
      </el-col>
    </el-form-item>
    <el-form-item label="分类图标" prop="icon" :error="errors.icon">
      <el-col :span="16">
        <ag-icon v-if="formModel.icon" :path="formModel.icon" />
        <el-input
          placeholder="请填写 SVG 图标的 PATH 节点"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 5 }"
          v-model="formModel.icon"
        />
      </el-col>
    </el-form-item>
    <el-form-item label="图片" prop="image" :error="errors.image">
      <image-upload v-model="formModel.image" />
    </el-form-item>
    <el-form-item
      label="分类介绍"
      prop="description"
      :error="errors.description"
    >
      <el-col :md="16">
        <el-input
          :autosize="{ minRows: 3, maxRows: 6 }"
          type="textarea"
          v-model="formModel.description"
        />
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
        :disabled="!$can('shop-category/delete')"
        plain
        type="danger"
        size="small"
        @click="onShopCategoryDelete"
      >
        删除
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import ImageUpload from '@admin/components/upload/ImageUpload'
import AgIcon from '@shared/components/Icon'
import { useForm } from '@shared/hooks/useForm'
import { computed, ref, toRaw } from 'vue'

export default {
  components: { ImageUpload, AgIcon },
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
    shopCategory: {
      type: Object,
    },
    categoryTree: {
      type: Array,
    },
    categoryParents: {
      type: Array,
    },
  },
  setup(props, { emit }) {
    const { loading, form, errors, setErrors, handleSubmit } = useForm(
      props.shopCategory
    )

    const formRef = ref()

    const getCategoryParents = computed({
      get: () => props.categoryParents,
      set: (value) => {
        emit('update:categoryParents', value)
        form.parentId = value[value.length - 1]
      },
    })

    const getCategoryTree = computed(() => {
      disableCategoryInTree(props.shopCategory.id, props.categoryTree)

      return [...[{ id: 0, name: '根分类' }], ...props.categoryTree]
    })

    const disableCategoryInTree = (id, tree) => {
      tree.forEach((item) => {
        item.disabled = props.shopCategory.id === item.id

        if (Array.isArray(item.children) && item.children.length > 0) {
          disableCategoryInTree(id, item.children)
        }
      })
    }

    const onShopCategoryDelete = () => {
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
      onSubmit,
      getCategoryTree,
      getCategoryParents,
      onShopCategoryDelete,
    }
  },
}
</script>
