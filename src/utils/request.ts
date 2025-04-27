/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { history } from 'umi';
import { Toast } from 'antd-mobile';
import { clearLocalStorage } from '@/utils/common';
import { get } from 'lodash';
import { ErrorShowType } from '@@/plugin-request/request';

const baseUri = process.env.NODE_ENV === 'production' ? '' : '/api';

interface CodeMessage {
  [key: number]: string;
}

const codeMessage: CodeMessage = {
  // 200: '服务器成功返回请求的数据。',
  200: 'リクエストが成功しました。',
  // 201: '新建或修改数据成功。',
  201: 'リクエストが成功し、新たなリソースが作成されました。',
  // 202: '一个请求已经进入后台排队（异步任务）。',
  202: 'リクエストが受理されたが、まだ実行されていないです。',
  // 204: '删除数据成功。',
  204: 'リクエストに対して送信するコンテンツはないが、ヘッダーは有用です。',
  // 400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  400: '構文が無効であるためサーバーがリクエストを理解できないです。',
  // 401: '用户没有权限（令牌、用户名、密码错误）。',
  401: 'クライアントはリクエストされたレスポンスを得るためには認証を受けなければならないです。',
  // 403: '用户得到授权，但是访问是被禁止的。',
  403: 'クライアントにコンテンツのアクセス権がなく、サーバーが適切なレスポンスの返信を拒否します。',
  // 404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  404: 'サーバーがリクエストされたリソースを発見できないです。',
  // 406: '请求的格式不可得。',
  406: 'ユーザーエージェントから与えられた条件に合うコンテンツが見つからないです。',
  // 410: '请求的资源被永久删除，且不会再得到的。',
  410: 'リクエストされたコンテンツがサーバーから永久に削除され、転送先アドレスがないです。',
  // 422: '当创建一个对象时，发生一个验证错误。',
  422: 'リクエストは適正だが、意味が誤っているために従うことができないです。',
  // 500: '服务器发生错误，请检查服务器。',
  500: 'タイムアウトまたはネットワークに異常があります。',
  // 502: '网关错误。',
  502: 'ゲートウェイとして動作するサーバーが無効なレスポンスを受け取りました。',
  // 503: '服务不可用，服务器暂时过载或维护。',
  503: 'サーバーはリクエストを処理する準備ができていないです。',
  // 504: '网关超时。',
  504: 'ゲートウェイとして動作するサーバーが時間内にレスポンスを得られないです。',
  // Pending 手机端
};
/**
 * 异常处理程序
 */

const errorHandler = (error: any) => {
  const { response } = error;
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    Toast.show({
      content: errorText,
      position: 'top',
    });
  } else if (!response) {
    Toast.show({
      content: `タイムアウトまたはネットワークに異常があります。`,
      position: 'top',
    });
  }
  // return response;
};
/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler, // 默认错误处理
  prefix: baseUri,
  timeout: 50 * 1000,
});
// request拦截器, 改变url 或 options
request.interceptors.request.use(
  (url, options) => {
    const headers = localStorage.getItem('Authorization')
      ? {
          Authorization: `${localStorage.getItem('Authorization')}`,
        }
      : {
          Authorization: '',
        };
    return {
      url,
      options: {
        ...options,
        headers: {
          ...headers,
          ...(options.skip
            ? {}
            : {
                'Content-Type': 'application/json;charset=UTF-8',
              }),
        },
      },
    };
  },
  { global: false },
);

// 克隆响应对象做解析处理
request.interceptors.response.use(async (response: any, options: any) => {
  const showType = get(options, 'showType');

  try {
    const data = await response.clone().json();

    if (
      showType === ErrorShowType.SILENT &&
      data?.error ===
        'the last 4 digits of the parent phone number are incorrect'
    )
      return { ...response, success: true, showType };

    if (data && (data.error === 'authFailed' || data.error === 'invalidUser')) {
      Toast.show({
        content:
          'ログインの有効期限が切れています。もう一度ログインしてください。',
        position: 'top',
      });
      clearLocalStorage();
      history.push('/welcome');
      return;
    }
    if (data && data.error === 'unregistered') {
      // Toast.show({
      //   content: '携帯番号を契約していません。正しい携帯番号をご入力ください。',
      //   position: 'top',
      // });
      return data;
    }
    if (data && data.error === 'unable checkin') {
      Toast.show({
        content:
          '入居日以前はログインできません。ご入居した後でログインしてください。',
        position: 'top',
      });
      return;
    }
    if (data && data.error === 'Verification code error') {
      Toast.show({
        content:
          '入力した認証コードが異なります。認証コードを再度入力してください。',
        position: 'top',
        duration: 3000,
      });
      return;
    }
    if (data && data.error === 'Verification code expired') {
      Toast.show({
        content: '認証コードの有効期限が切れました。',
        // content: '入力した認証コードが異なります。認証コードを再度入力してください。',
        position: 'top',
      });
      return;
    }
    if (
      data &&
      data.error ===
        'the last 4 digits of the parent phone number are incorrect'
    ) {
      Toast.show({
        // content: '認証コードの有効期限が切れました。',
        content:
          '入力した招待者番号が異なります。招待者の携帯番号下４桁を入力してください。',
        position: 'top',
      });
      return;
    }
    if (data && data.error === 'this sub account is already in use') {
      Toast.show({
        // content: '認証コードの有効期限が切れました。',
        content: 'この電話番号はすでに使用されていますので、招待できません。',
        position: 'top',
      });
      return;
    }
    if (data && data.error === 'image check fail') {
      Toast.show({
        content:
          'ファイル種別が不正です。PNG または JPEG または JPG 形式の画像を使用してください。',
        position: 'top',
      });
      return;
    }
    if (data && data.error === 'resident limit') {
      Toast.show({
        content: '居住者は最大4人まで設定できます。',
        position: 'top',
      });
      return;
    }
    if (data && data.error === 'this visitor is identified by others already') {
      Toast.show({
        content:
          '来訪者は既に他のアカウントで”あなた”を設定されているため、”あなた”が設定できません。',
        position: 'top',
      });
      return;
    }
    /*     if (data && data.error) {
      Toast.show({
        content: data.error,
        position: 'top',
      });
      return;
    } */
  } catch (error) {}
  return response;
});

export default request;
