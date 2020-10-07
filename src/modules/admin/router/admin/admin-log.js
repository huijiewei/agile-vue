export default [
  {
    path: '/admin-log',
    component: () =>
      import(
        /* webpackChunkName: "chunk-admin" */ '@admin/views/admin-log/Index'
      ),
    meta: {
      title: '操作日志',
    },
  },
]
