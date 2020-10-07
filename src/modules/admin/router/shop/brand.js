export default [
  {
    path: '/shop-brand',
    component: () =>
      import(
        /* webpackChunkName: "chunk-shop" */ '@admin/views/shop-brand/Index'
      ),
    meta: {
      title: '商品品牌',
    },
  },
  {
    path: '/shop-brand/create',
    component: () =>
      import(
        /* webpackChunkName: "chunk-shop" */ '@admin/views/shop-brand/Create'
      ),
    meta: {
      title: '新建商品品牌',
    },
  },
  {
    path: '/shop-brand/edit/:id',
    component: () =>
      import(
        /* webpackChunkName: "chunk-shop" */ '@admin/views/shop-brand/Edit'
      ),
    meta: {
      title: '编辑商品品牌',
    },
  },
]
