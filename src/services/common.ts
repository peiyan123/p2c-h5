import request from '@/utils/request';
interface ReportData {
  apnsToken?: string;
  gcmToken?: string;
  voipToken?: string;
  appVersion?: string;
  osVersion?: string;
  osType?: string;
}

export async function getAutoMessageList() {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/autoAnswer`, {
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

export async function pushToken(body: ReportData) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/regist_push_token`, {
    method: 'POST',
    data: body,
  }).then((res: any) => {
    return res;
  });
}

export async function getUser() {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/user`, {
    method: 'GET',
  });
}

export async function updateMode(mode: boolean) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/staybhdmode`, {
    method: 'POST',
    params: { stayBhdMode: mode },
  });
}
