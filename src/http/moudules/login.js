import axios from '../axios'

// 登录接口
export const loginFn = (data) => {
    return axios({
        url: '/login/admin',
        method: 'post',
        data
    })
}

//退出接口
export const logoutFn = () => {
    return axios({
        url: '/login/logout',
        method: 'get'
    })
}