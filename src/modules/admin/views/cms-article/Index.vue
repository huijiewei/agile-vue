<template>
  <div class="box">
    <div class="box-toolbar">
      <div class="box-toolbar-search">
        <search-form v-if="searchFields" :search-fields="searchFields" />
      </div>
      <div class="box-toolbar-button">
        <el-button
          :disabled="!$can('cms-article/create')"
          type="primary"
          size="medium"
          @click="handleCmsArticleCreate()"
        >
          新建文章
        </el-button>
      </div>
    </div>

    <el-table class="cms-articles" v-loading="loading" :data="cmsArticles">
      <el-table-column
        fixed
        width="90"
        class-name="text-mono"
        prop="id"
        label="Id"
      />
      <el-table-column label="文章">
        <template slot-scope="scope">
          <div class="title">{{ scope.row.title }}</div>
          <div class="slug">{{ scope.row.slug }}</div>
        </template>
      </el-table-column>
      <el-table-column width="110" align="center" label="图片">
        <template slot-scope="scope">
          <img
            width="80"
            :alt="scope.row.title"
            v-if="scope.row.image"
            :src="scope.row.image"
            class="logo"
          />
        </template>
      </el-table-column>
      <el-table-column width="160" label="文章分类">
        <template slot-scope="scope">
          <el-tag size="medium">
            {{ scope.row.cmsCategory.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        class-name="text-mono"
        prop="createdAt"
        label="创建时间"
        width="160"
      />
      <el-table-column width="135" label="操作" fixed="right" align="right">
        <template slot-scope="scope">
          <el-button
            :disabled="!$can('cms-article/edit')"
            type="primary"
            size="mini"
            plain
            class="button"
            @click="handleCmsArticleEdit(scope.row)"
            >编辑
          </el-button>
          <el-button
            :disabled="!$can('cms-article/delete')"
            type="danger"
            size="mini"
            plain
            class="button"
            @click="handleCmsArticleDelete(scope.row)"
            >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :pages="pages"></pagination>
  </div>
</template>

<script>
import SearchFormFieldsMixin from '@admin/mixins/SearchFormFieldsMixin'
import SearchForm from '@admin/components/SearchForm'
import Pagination from '@admin/components/Pagination'
import CmsArticleService from '@admin/services/CmsArticleService'

export default {
  name: 'CmsArticle',
  components: { SearchForm, Pagination },
  mixins: [SearchFormFieldsMixin],
  data() {
    return {
      loading: true,
      cmsArticles: [],
      pages: null,
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.getCmsArticles(to.query)
    next()
  },
  created() {
    this.getCmsArticles(this.$route.query)
  },
  methods: {
    async getCmsArticles(query) {
      this.loading = true

      const { data } = await CmsArticleService.all(this.buildRouteQuery(query))

      if (data) {
        this.cmsArticles = Object.freeze(data.items)
        this.pages = data.pages

        this.setSearchFields(data.searchFields)
      }

      this.loading = false
    },
    handleCmsArticleCreate() {
      this.$router.push({ path: '/cms-article/create' })
    },
    handleCmsArticleEdit(cmsArticle) {
      this.$router.push({
        path: `/cms-article/edit/${cmsArticle.id}`,
      })
    },
    handleCmsArticleDelete(cmsArticle) {
      this.$deleteDialog({
        message: `你确定要删除文章 <strong>${cmsArticle.title}</strong> 吗`,
        callback: async () => {
          this.loading = true

          const { data } = await CmsArticleService.delete(cmsArticle.id)

          if (data) {
            this.cmsArticles = Object.freeze(
              this.cmsArticles.filter((item) => item.id !== cmsArticle.id)
            )

            this.$message({
              type: 'success',
              message: '删除成功',
            })
          }

          this.loading = false
        },
      })
    },
  },
}
</script>
<style lang="less">
.cms-articles {
  .title {
    font-weight: bold;
    font-size: 15px;
    margin-bottom: 3px;
  }
}
</style>
