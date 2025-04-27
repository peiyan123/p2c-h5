declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module 'postcss-pxtorem';

declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}

interface Window {
  WebViewJavascriptBridge: any;
  WVJBCallbacks: any[];
  vConsole: any;
  onWebViewJavascriptBridgeReady: any;
  __bridge: any;
}
