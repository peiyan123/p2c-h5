export default [
  {
    path: '/',
    redirect: '/timeline',
    exact: true,
  },
  {
    path: '/login',
    component: './login',
    title: 'login',
  },
  {
    path: '/welcome',
    component: './welcome',
    title: 'welcome',
  },
  {
    path: '/microAuth',
    component: './microAuth',
    title: 'microAuth',
  },
  {
    path: '/callSkyway',
    component: './callSkyway',
    title: 'callSkyway',
  },
  {
    path: '/call',
    component: './call',
    title: 'call',
  },
  {
    path: '/visitor/list-history',
    component: './visitor/history',
    title: 'record',
  },
  {
    path: '/visitor/history',
    component: './visitor/history/edit',
    title: 'record',
  },
  {
    path: '/',
    component: '../layout',
    wrappers: ['@/wrappers/auth'],
    routes: [
      {
        path: '/timeline',
        component: './timeline',
        title: 'timeline',
      },
      {
        path: '/visitor',
        component: './visitor',
        title: 'visitor',
      },
      {
        path: '/visitor/reject',
        component: './visitor/reject',
        title: 'reject',
      },
      {
        path: '/visitor/detail/:id',
        component: './visitor/detail',
        title: 'detail',
      },
      {
        path: '/visitor/edit/:id',
        component: './visitor/detail/edit',
        title: 'edit',
      },
      {
        path: '/visitor/record',
        component: './visitor/detail/record',
        title: 'record',
      },
      {
        path: '/other',
        component: './other',
        title: 'other',
      },
      {
        path: '/other/message',
        component: './other/message',
        title: 'message',
      },
      {
        path: '/other/auto',
        component: './other/auto',
        title: 'auto',
      },
      {
        path: '/other/about',
        component: './other/about',
        title: 'about',
      },
      {
        path: '/other/contact',
        component: './other/contact',
        title: 'contact',
      },
      {
        path: '/setting',
        component: './setting',
        title: 'setting',
      },
      {
        path: '/subAccount',
        component: './subAccount',
        title: 'subAccount',
      },
      {
        path: '/indoorTerminal',
        component: './indoorTerminal',
        title: 'indoorTerminal',
      },
    ],
  },
];
