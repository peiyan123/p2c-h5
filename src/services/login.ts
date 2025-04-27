import request from '@/utils/request';
interface Login {
  phoneNumber: string;
  code: string;
}

export async function getCode(params: { phoneNumber: string }) {
  return request('/v1/app_user/get_code', {
    method: 'GET',
    params: {
      ...params,
    },
  }).then((res: any) => {
    return res;
  });
}

export async function getInfo(userId: string) {
  return request(`/v1/app_user/${userId}/distributor/info`, {
    method: 'GET',
    params: {},
  }).then((res: any) => {
    return res;
  });
}

export async function login(body: Login, options?: {}) {
  return request('/v1/app_user/login', {
    method: 'POST',
    data: body,
    ...(options || {}),
  }).then((res: any) => {
    return res;
  });
}

export async function checkCode(body: Login) {
  return request('/v1/app_user/check_code', {
    method: 'POST',
    data: body,
  }).then((res: any) => {
    return res;
  });
}
