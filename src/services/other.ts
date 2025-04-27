import request from '@/utils/request';

export async function getAutores() {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/auto_res_rejection`, {
    method: 'GET',
  }).then((res: any) => {
    return res;
  });
}

export async function getMessageList() {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/message`, {
    method: 'GET',
  }).then((res: any) => {
    return res;
  });
}

export async function getAutoMessageList() {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/autoAnswer`, {
    method: 'GET',
  }).then((res: any) => {
    return res;
  });
}

export async function Harmony(body: any, options?: {}) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/not_harmony`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  }).then((res: any) => {
    return res;
  });
}

export async function Logout() {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/logout`, {
    method: 'POST',
  }).then((res: any) => {
    return res;
  });
}

export async function roomInfo() {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/room/roominfo`, {
    method: 'GET',
  });
}
