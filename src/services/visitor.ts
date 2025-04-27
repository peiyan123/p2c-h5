import request from '@/utils/request';

interface Reject {
  visitorId: any;
  blackStatus: boolean;
}
interface VisitorType {
  vistorId?: string | number;
  nickName?: string;
  remark?: string;
  visitorType?: string;
  visitorTypeId?: string;
  autoAnswer?: boolean;
  autoResPattern?: string;
}

interface VisitorDetailType {
  visitorId?: string | number;
}

interface AvatarsType {
  picLargeResource: string;
  picSmallResource: string;
}

export async function getVisitor(options?: {}) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/room/visitor`, {
    method: 'GET',
    ...(options || {}),
  }).then((res: any) => {
    return res;
  });
}

export async function getVisitorDetail(
  params: VisitorDetailType,
  options?: {},
) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/room/visitor/detail`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  }).then((res: any) => {
    return res;
  });
}

export async function rejectSetting(body: Reject, options?: {}) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/room/rejection/setting`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  }).then((res: any) => {
    return res;
  });
}

export async function getRejectionList() {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/room/rejection`, {
    method: 'GET',
  }).then((res: any) => {
    return res;
  });
}

export async function getVisitorType() {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/room/visitor_type`, {
    method: 'GET',
  }).then((res: any) => {
    return res;
  });
}

export async function editVisitor(body: VisitorType, options?: {}) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/room/visitor/detail/update`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  }).then((res: any) => {
    return res;
  });
}

export async function uploadAvatars(body: AvatarsType, options?: {}) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/update_user_image`, {
    method: 'POST',
    data: body,
    timeout: 120 * 1000,
    ...(options || {}),
  }).then((res: any) => {
    return res;
  });
}
