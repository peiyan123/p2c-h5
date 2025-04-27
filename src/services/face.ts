import request from '@/utils/request';

export async function uploadFace(data: {
  faceType: number;
  file: File;
  avatar: File;
}) {
  const userId = localStorage.getItem('userId');
  const formdata = new FormData();
  formdata.append('faceType', `${data.faceType}`);
  formdata.append('file', data.file);
  formdata.append('avatar', data.avatar);

  return request(`/v1/app_user/${userId}/visitor_face`, {
    method: 'POST',
    data: formdata,
    requestType: 'form',
    skip: true,
  });
}

export async function listFaces() {
  const userId = localStorage.getItem('userId');

  return request(`/v1/app_user/${userId}/visitor_facerecords`, {
    method: 'GET',
  }).then((res) => {
    return {
      data: res,
      success: true,
    };
  });
}
