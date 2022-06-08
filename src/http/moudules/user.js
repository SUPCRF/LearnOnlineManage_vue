import axios from '../axios'

export const userInfo = (data) => {
    return axios({
        url: '/common/userInfo',
        method: 'post',
        data
    })
}

//修改个人信息
export const adminModifyInfo = (data) => {
    return axios({
      url: '/admin-user/updateInfo',
      method: 'post',
      data
    })
  }

  //修改当前用户密码
export const modifyPwd = (data) => {
  return axios({
    url: '/personal/modifyPwd',
    method: 'put',
    data
  })
}
