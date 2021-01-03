<template>
  <el-form
    v-if="formModel"
    ref="formModel"
    :model="formModel"
    label-width="100px"
    label-suffix="："
    @submit.stop.prevent="handleFormSubmit('formModel')"
  >
    <el-form-item
      label="标题"
      prop="title"
      :rules="[
        {
          required: true,
          message: '请输入文章标题',
          trigger: 'blur',
        },
      ]"
    >
      <el-col :md="10">
        <el-input v-model.trim="formModel.title" />
      </el-col>
    </el-form-item>
    <el-form-item
      label="别名"
      prop="slug"
      :rules="[
        {
          required: true,
          message: '请输入文章别名',
          trigger: 'blur',
        },
      ]"
    >
      <el-col :md="6">
        <el-input v-model.trim="formModel.slug" />
      </el-col>
    </el-form-item>
    <el-form-item label="图片" prop="image">
      <el-col :md="10">
        <image-upload
          v-model="formModel.image"
          :preview="[160, 100]"
          :multiple="false"
        />
      </el-col>
    </el-form-item>
    <el-form-item
      label="分类"
      prop="cmsCategoryId"
      :rules="[
        {
          required: true,
          message: '请选择文章分类',
          trigger: 'blur',
        },
      ]"
    >
      <el-col :md="15">
        <el-cascader
          style="width: 90%"
          placeholder="文章分类"
          v-model="formModel.cmsCategoryId"
          :options="categoryTree"
          :props="{
            value: 'id',
            label: 'name',
            checkStrictly: true,
          }"
        >
        </el-cascader>
        &nbsp;
        <el-button
          size="mini"
          title="刷新选项数据"
          icon="el-icon-refresh"
          @click="loadCategoryTree"
        ></el-button>
      </el-col>
    </el-form-item>
    <el-form-item
      label="介绍"
      prop="description"
      :rules="[
        {
          required: true,
          message: '请输入文章介绍',
          trigger: 'blur',
        },
      ]"
    >
      <el-col :md="20">
        <el-input
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 6 }"
          v-model.trim="formModel.description"
        />
      </el-col>
    </el-form-item>
    <el-form-item
      label="内容"
      prop="content"
      :rules="[
        {
          required: true,
          message: '请输入文章内容',
          trigger: 'blur',
        },
      ]"
    >
      <el-col :md="20">
        <tinymce v-model="formModel.content"></tinymce>
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
import ImageUpload from '@admin/components/upload/ImageUpload'
import UnprocessableEntityHttpErrorMixin from '@admin/mixins/UnprocessableEntityHttpErrorMixin'
import MiscService from '@admin/services/MiscService'
import Tinymce from '../../../../shared/components/Tinymce/index'

export default {
  components: { Tinymce, ImageUpload },
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
    cmsArticle: {
      type: Object,
      default: null,
    },
  },
  emits: ['submit'],
  data() {
    return {
      submitLoading: false,
      formModel: null,
      categoryTree: null,
      formCategoryParents: [],
    }
  },
  async created() {
    await this.loadCategoryTree()
    this.formModel = Object.assign({}, this.cmsArticle)
  },
  methods: {
    async loadCategoryTree() {
      const { data } = await MiscService.cmsCategoryTree()

      if (data) {
        this.categoryTree = data
      }
    },
    handleFormSubmit(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) {
          return false
        }

        this.submitLoading = true

        const cmsArticle = Object.assign({}, this.formModel)

        if (Array.isArray(this.formModel.cmsCategoryId)) {
          cmsArticle.cmsCategoryId = this.formModel.cmsCategoryId[
            this.formModel.cmsCategoryId.length - 1
          ]
        }

        this.$emit(
          'on-submit',
          cmsArticle,
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
