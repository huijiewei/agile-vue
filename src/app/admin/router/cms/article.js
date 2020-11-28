export default [
  {
    path: '/cms-article',
    name: 'CmsArticle',
    component: () =>
      import(
        /* webpackChunkName: "chunk-cms" */ '@admin/views/cms-article/Index'
      ),
    meta: {
      title: '文章管理',
    },
  },
  {
    path: '/cms-article/create',
    name: 'CmsArticleCreate',
    component: () =>
      import(
        /* webpackChunkName: "chunk-cms" */ '@admin/views/cms-article/Create'
      ),
    meta: {
      title: '新建文章',
    },
  },
  {
    path: '/cms-article/edit/:id',
    name: 'CmsArticleEdit',
    component: () =>
      import(
        /* webpackChunkName: "chunk-cms" */ '@admin/views/cms-article/Edit'
      ),
    meta: {
      title: '编辑文章',
    },
  },
]
