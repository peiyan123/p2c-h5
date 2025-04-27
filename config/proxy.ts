export default {
  dev: {
    '/api': {
      // 成日
      // target: 'http://10.4.12.124:8881',
      // dev
      // target: 'http://192.168.87.40:8881',
      // target: 'http://p2c-h5-dev.cdcloud.top',
      // target: 'https://web-p2cdev.10fw.co.jp/',
      // puyuejinn
      // target: 'http://10.4.13.83:8881',
      // test-ts
      //target: 'https://p2cdev.10fw.co.jp:8443/',
      target: 'https://p2cdev.10fw.co.jp/',
      // stage
      // target: 'https://p2cstg.10fw.co.jp',
      // test
      // target: 'https://web-p2cstg.10fw.co.jp/',
      // prod
      // target: 'https://web-p2cstg.10fw.co.jp/',
      ws: false,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    },
  },
};
