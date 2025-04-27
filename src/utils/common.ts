import moment from 'moment-timezone';

export const CallStatus = {
  '0': '通話',
  '1': 'メッセージ応答',
  '2': '応答拒否',
  '3': '自動応答',
  '4': 'サイレントモード',
  '5': '着信拒否',
  '6': '応答せず',
  '7': 'キャンセル',
};

/* お知らせ未送信 */
export const utc2jstFormat = function (date: Date) {
  moment.updateLocale('ja', {
    weekdays: [
      '日曜日',
      '月曜日',
      '火曜日',
      '水曜日',
      '木曜日',
      '金曜日',
      '土曜日',
    ],
    weekdaysShort: ['日', '月', '火', '水', '木', '金', '土'],
  });
  if (date) {
    return moment(date).format('MM月DD日 dddd');
  }
};

export const setupWebViewJavascriptBridge = (callback: (arg0: any) => any) => {
  if (window.WebViewJavascriptBridge) {
    return callback(window.WebViewJavascriptBridge);
  }
  if (window.WVJBCallbacks) {
    return window.WVJBCallbacks.push(callback);
  }
  window.WVJBCallbacks = [callback];
  var WVJBIframe = document.createElement('iframe');
  WVJBIframe.style.display = 'none';
  WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
  document.documentElement.appendChild(WVJBIframe);
  setTimeout(function () {
    document.documentElement.removeChild(WVJBIframe);
  }, 0);
};

export const connectWebViewJavascriptBridge = (callback: {
  (bridge: any): void;
  (arg0: any): void;
}) => {
  if (window.WebViewJavascriptBridge) {
    callback(window.WebViewJavascriptBridge);
  } else {
    document.addEventListener(
      'WebViewJavascriptBridgeReady',
      function () {
        // if (window.onWebViewJavascriptBridgeReady)
        //   window.onWebViewJavascriptBridgeReady(
        //     (window.__bridge = window.WebViewJavascriptBridge),
        //   );
        callback(window.WebViewJavascriptBridge);
      },
      false,
    );
  }
};

export const clearLocalStorage = () => {
  localStorage.removeItem('Authorization');
  localStorage.removeItem('userId');
  localStorage.removeItem('roomCode');
  localStorage.removeItem('mansionName');
  localStorage.removeItem('phone');
  localStorage.removeItem('checkinDate');
  localStorage.removeItem('isSubAccount');
  localStorage.removeItem('isAutoResRejection');
};

export const handleTypeColor = (type?: string, isBlack?: boolean) => {
  if (isBlack) return 'red';

  switch (type) {
    case 'あなた':
    case '居住者':
    case '家族·友人':
    case '家族友人':
      return 'orange';
    case '配送・デリバリー業者':
      return 'blue';
    case 'temporary':
      return 'white';
    default:
      return 'gray';
  }
};
