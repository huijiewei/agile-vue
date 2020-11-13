<template>
  <div class="box">
    <div class="box-header">
      <h4>{{ pageTitle }}{{ name }}</h4>
    </div>
    <cms-article-form
      v-if="cmsArticle"
      :submit-text="pageTitle"
      :cms-article="cmsArticle"
      :is-edit="true"
      @on-submit="editCmsArticle"
    />
    <placeholder-form v-else />
  </div>
</template>

<script>
import CmsArticleForm from '@admin/views/cms-article/_EditForm'
import PlaceholderForm from '@core/components/Placeholder/PlaceholderForm'
import CmsArticleService from '@admin/services/CmsArticleService'

export default {
  name: 'CmsArticleEdit',
  components: { PlaceholderForm, CmsArticleForm },
  props: {
    name: String,
  },
  data() {
    return {
      pageTitle: '编辑文章',
      cmsArticle: null,
    }
  },
  inject: ['historyBack'],
  async created() {
    const { data } = await CmsArticleService.view(this.$route.params.id)

    if (data) {
      const { cmsCategory, ...cmsArticle } = data

      cmsArticle.cmsCategoryId = cmsCategory.id

      this.cmsArticle = cmsArticle
    }
  },
  methods: {
    async editCmsArticle(cmsArticle, done, fail, always) {
      const { data, error } = await CmsArticleService.edit(cmsArticle)

      if (data) {
        done()

        this.$message.success('文章编辑成功')

        await this.$store.dispatch('tabs/deleteCache', 'CmsArticle')
        await this.historyBack('/cms-article', false, true)
      }

      if (error) {
        fail(error)
      }

      always()
    },
  },
}
</script>
