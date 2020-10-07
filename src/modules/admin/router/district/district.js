export default [
  {
    path: '/district',
    component: () =>
      import(
        /* webpackChunkName: "chunk-district" */ '@admin/views/district/Layout'
      ),
    children: [
      {
        path: '',
        component: () =>
          import(
            /* webpackChunkName: "chunk-district" */ '@admin/views/district/Index'
          ),
        meta: {
          title: '地区',
        },
      },
      {
        path: 'create/:id',
        component: () =>
          import(
            /* webpackChunkName: "chunk-district" */ '@admin/views/district/Create'
          ),
        meta: {
          title: '新建地区',
          parent: {
            name: '',
            path: '/district',
            title: '地区',
          },
        },
      },
      {
        path: 'edit/:id',
        component: () =>
          import(
            /* webpackChunkName: "chunk-district" */ '@admin/views/district/Edit'
          ),
        meta: {
          title: '编辑地区',
          parent: {
            name: 'District',
            path: '/district',
            title: '地区',
          },
        },
      },
    ],
  },
]
