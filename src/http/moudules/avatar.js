import axios from '../axios'

export const changeAvatar = (data) => {
    return axios({
        url: '/minio/changeAvatar',
        method: 'post',
        data
    })
}