import routes from './router';
import proxy from './proxy';
import path from 'path';
import pxtorem from 'postcss-pxtorem';

export default {
  base: '/',
  publicPath: '/',
  hash: true,
  routes: routes,
  proxy: proxy['dev'],
  history: {
    type: 'browser',
  },
  define: {
    'process.env.MODE': 'debug',
  },
  alias: { '@': path.resolve(__dirname, '../src') },
  dynamicImport: {
    loading: '@/components/loading',
  },
  extraPostCSSPlugins: [
    pxtorem({
      rootValue: 16,
      unitPrecision: 5,
      propList: ['*'],
      selectorBlackList: [],
      replace: true,
      mediaQuery: true,
      minPixelValue: 0,
    }),
  ],
  antd: { mobile: false },
};
