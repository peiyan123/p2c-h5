import styles from '@/pages/visitor/history/index.less';
import { Button, NavBar, SpinLoading, Toast } from 'antd-mobile';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { uploadFace } from '@/services/face';
import { Cropper, CropperRef } from 'react-mobile-cropper';
import './cropper.css';
import { useRequest } from '@@/plugin-request/request';
import { AVATAR_STATUS } from '@/pages/visitor/history/components/Desc';
import camera from '@/assets/images/camera.png';
import checkIcon from '@/assets/images/check.png';
import { gt } from '@/utils';
import { isIOS } from 'react-device-detect';
import { setupWebViewJavascriptBridge } from '@/utils/common';
import { LeftOutline } from 'antd-mobile-icons';
const suffix = 'jpeg';
const MAX_SIZE = 10 * 1024 * 1024;

const BASE_WIDTH = window.innerWidth * 2;
const MAX_WIDTH = window.innerWidth * 4;
const MAX_HEIGHT = (window.innerWidth * 4 * 16) / 9;

const isDataURL = (str: string) => {
  const regex =
    /^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@/?%\s]*\s*$/i;
  return !!str.match(regex);
};

const ENABLE_NATIVE = false;

function resizeDataURL(
  datas: string,
  wantedWidth: number,
  wantedHeight: number,
) {
  return new Promise(async function (resolve, reject) {
    const img = document.createElement('img');

    img.onerror = reject;
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = wantedWidth;
      canvas.height = wantedHeight;

      // @ts-ignore
      ctx!.drawImage(this, 0, 0, wantedWidth, wantedHeight);
      const dataURI = canvas.toDataURL();
      resolve(dataURI);
    };

    img.src = datas;
  });
}

export const loadImageURL = (
  imageURL: string,
  crossOrigin?: string,
  callback?: any,
) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      console.log(
        image.width,
        image.height,
        BASE_WIDTH,
        (BASE_WIDTH * image.height) / image.width,
      );

      if (callback) {
        callback(
          imageURL,
          BASE_WIDTH,
          (BASE_WIDTH * image.height) / image.width,
        )
          .then((res: string) => {
            loadImageURL(res).then((r) => {
              resolve(r);
            });
          })
          .catch(() => {
            reject('');
          });
      } else {
        resolve(image);
      }
    };
    image.onerror = reject;
    if (!isDataURL(imageURL) && crossOrigin) {
      image.crossOrigin = crossOrigin;
    }
    image.src = imageURL;
  });

export const loadImageFile = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (!e?.target?.result) {
          throw new Error('No image data');
        }
        loadImageURL(e.target.result as string, undefined, resizeDataURL).then(
          (res) => {
            resolve(res);
          },
        );
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsDataURL(file);
  });
export const DefaultStep: React.FC<{
  desc: ReactNode;
  onChange: (v: number) => void;
}> = ({ desc, onChange }) => {
  const inputRef: any = useRef();
  const cropperRef = useRef<CropperRef>(null);
  const containerRef: any = useRef();
  const [src, setSrc] = useState<string>();
  // const [src, setSrc] = useState<string>('https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2Fd6db1c14-4ea7-4224-bd4d-6b71e7214d96%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=');
  const [visible, setVisible] = useState<boolean>(false);
  const [mask, setMask] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { run, loading } = useRequest(
    async (params: any) => {
      await uploadFace(params);
      setVisible(false);
      onChange(AVATAR_STATUS.PENDING);
    },
    { manual: true },
  );

  const readFile = async (file: any) => {
    try {
      const img = file.target.files[0];
      const types = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!types.includes(img.type)) {
        Toast.show(
          'ファイル種別が不正です。PNG または JPEG または JPG 形式の画像を使用してください。',
        );
      } else if (img.size > MAX_SIZE) {
        Toast.show('10MB以下の画像を選んでください。');
      } else {
        loadImageFile(img).then((res) => {
          console.log('width:', res.width, 'height: ', res.height);

          if (res.width < 360 && res.height < 640) {
            Toast.show(`解像度が360*640以上の画像をアップロードしてください。`);
          } else {
            setSrc(res.src);
            setVisible(true);
          }
        });
      }
      inputRef.current.value = null;
    } catch (e) {
      console.log('choose image exception: ', e);
    }
  };

  const toFile = (c: HTMLCanvasElement, name: string) => {
    return new Promise((resolve, reject) => {
      try {
        c.toBlob((blob) => {
          const file = new File([blob!], name, {
            type: `image/${suffix}`,
          });

          // const a = document.createElement('a');
          // a.download = `xxx.${suffix}`;
          // a.href = URL.createObjectURL(blob);
          // a.click();

          // setupWebViewJavascriptBridge(function (bridge: any) {
          //   bridge.callHandler(
          //     'js_call_native',
          //     {
          //       function_name: 'download_image',
          //       params: {image_url: URL.createObjectURL(blob)},
          //     },
          //     function (response: any) {
          //     },
          //   );
          // });

          resolve(file);
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  const imageDataToFile = function (imageData: ImageData) {
    let w = imageData.width;
    let h = imageData.height;
    let canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    let ctx = canvas.getContext('2d');
    ctx!.putImageData(imageData, 0, 0); // synchronous

    return toFile(canvas, `avatar.${suffix}`);
  };

  const onConfirm = async () => {
    const coordinates = cropperRef.current?.getCoordinates();
    cropperRef.current?.setCoordinates({
      width: Math.ceil(coordinates!.width),
      height: Math.ceil(coordinates!.height),
      left: Math.ceil(coordinates!.left),
      top: Math.ceil(coordinates!.top),
    });
    const c = cropperRef.current!.getCanvas({
      minHeight: 640,
      minWidth: 360,
      maxHeight: MAX_HEIGHT,
      maxWidth: MAX_WIDTH,
      fillColor: '#ffffff',
    });

    if (!c) {
      return;
    }

    const file = await toFile(c, `pic.${suffix}`);

    const ctx = c.getContext('2d');

    const fz = parseFloat(document.documentElement.style.fontSize);
    const rw = window.innerWidth - 0.625 * fz * 2;

    const rate = c.width / rw;
    const sx = rw * 0.2 - 0.625 * fz;
    const sy = rw * (16 / 9) * 0.2 - 1.25 * fz;
    const sw = rw * 0.6 + 1.25 * fz;
    const sh = rw * (16 / 9) * 0.37 + 1.25 * fz;
    const imageData = ctx!.getImageData(
      sx * rate,
      sy * rate,
      sw * rate,
      sh * rate,
    );
    const avatar = await imageDataToFile(imageData);

    run({
      faceType: 0,
      file,
      avatar,
    });
  };

  useEffect(() => {
    // IOS only
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.registerHandler('native_call_js', function (data: any) {
        const req = JSON.parse(data);
        setMask(true);
        if (req.function_name == 'take_picture_response') {
          loadImageURL(
            'data:image/png;base64,' + req.params.file,
            undefined,
            resizeDataURL,
          )
            .then((res) => {
              setSrc(res.src);
              setVisible(true);
            })
            .finally(() => {
              setMask(false);
            });
        }
      });
    });
  }, []);

  const handleClick = () => {
    gt('3.1.0')
      .then(() => {
        if (!ENABLE_NATIVE && isIOS) {
          setupWebViewJavascriptBridge(function (bridge: any) {
            bridge.callHandler(
              'js_call_native',
              {
                function_name: 'take_picture',
              },
              function (response: any) {},
            );
          });
        } else {
          inputRef.current?.click();
        }
      })
      .catch((e) => console.error(e));
  };

  return (
    <div className={styles.content} ref={containerRef}>
      {React.cloneElement(desc as any, { onClick: handleClick })}
      {mask ? (
        <SpinLoading
          color="primary"
          style={{
            margin: 'calc(30vh + 50px) auto',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
          }}
        />
      ) : null}
      <Button
        shape="rounded"
        color="primary"
        block
        className={styles.commonButton}
        onClick={handleClick}
      >
        <div className={styles.camera}>
          <img src={camera} />
          写真を撮影
        </div>
      </Button>

      {isIOS ? (
        <input
          type="file"
          accept="image/*"
          onChange={readFile}
          ref={inputRef}
          style={{ display: 'none' }}
          multiple={false}
          capture
        />
      ) : (
        <input
          type="file"
          accept="video/*"
          onChange={readFile}
          ref={inputRef}
          style={{ display: 'none' }}
          multiple={false}
          capture={false}
        />
      )}

      {visible ? (
        <div className={styles.pic}>
          <div className={`${styles.tips} ${isIOS ? '' : styles.tips1}`}>
            {isIOS ? <div className={styles.tipBlue} /> : null}
            <div className={styles.stepNav}>
              <div
                className={styles.backIcon}
                onClick={() => setVisible(false)}
              >
                <LeftOutline />
              </div>
              <div onClick={() => setVisible(false)}>キャンセル</div>
            </div>
            <div className={styles.tipText}>顔をガイドに合わせてください</div>
          </div>
          <Cropper
            ref={cropperRef}
            src={src}
            imageRestriction={'none' as any}
            stencilProps={{
              aspectRatio: 9 / 16,
              movable: true,
            }}
            className={'cropper'}
            navigation={false}
            maxWidth={MAX_WIDTH}
            maxHeight={MAX_HEIGHT}
          />
          <div className={styles.buttonBox}></div>

          <Button
            onClick={async () => {
              setConfirmLoading(true);
              try {
                await onConfirm();
              } catch (e) {
                console.error(e);
              } finally {
                setConfirmLoading(false);
              }
            }}
            loading={confirmLoading || loading}
            className={styles.confirmBtn}
          >
            <img src={checkIcon} />
            決定
          </Button>
        </div>
      ) : null}
    </div>
  );
};
