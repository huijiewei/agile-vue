<template>
  <div class="box">
    <div class="box-header">
      <h4>{{ pageTitle }}</h4>
    </div>
    <cms-article-form
      v-if="cmsArticle"
      :submit-text="pageTitle"
      :cms-article="cmsArticle"
      @on-submit="createCmsArticle"
    />
    <placeholder-form v-else />
  </div>
</template>

<script>
import PlaceholderForm from '@core/components/Placeholder/PlaceholderForm'
import CmsArticleForm from '@admin/views/cms-article/_EditForm'
import CmsArticleService from '@admin/services/CmsArticleService'

export default {
  name: 'CmsArticleCreate',
  components: { PlaceholderForm, CmsArticleForm },
  data() {
    return {
      pageTitle: '新建文章',
      cmsArticle: null,
    }
  },
  inject: ['historyBack'],
  created() {
    this.cmsArticle = {
      title: '',
      slug: '',
      image: '',
      description: '',
      content: '',
      cmsCategoryId: 0,
    }
  },
  methods: {
    async createCmsArticle(cmsArticle, done, fail, always) {
      const { data, error } = await CmsArticleService.create(cmsArticle)

      if (data) {
        done()

        this.$message.success('新建文章成功')

        await this.$store.dispatch('tabs/deleteCache', 'CmsArticle')
        await this.historyBack('/cms-article', true, true)
      }

      if (error) {
        fail(error)
      }

      always()
    },
  },
}
</script>
