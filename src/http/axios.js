import axios from 'axios'
import config from './config'
import router from '../router'
import Cookies from "js-cookie"
import { Loading } from 'element-ui'
let loadinginstace

export default function $axios(options) {
    return new Promise((resolve, reject) => {
        const instance = axios.create({
            baseURL: config.baseUrl,
            headers: config.headers,
            timeout: config.timeout,
            // withCredentials: config.withCredentials
        })
        instance.interceptors.request.use(
            config => {
                loadinginstace = Loading.service({
                    fullscreen: true,
                    text: '请稍等...',
                    background: "rgba(0, 0, 0, 0.8)"
                })
                let obj = {}
                if (config.data && !config.isList) {
                    for (let key in config.data) {
                        if (config.data[key] != null) {
                            obj[key] = config.data[key]
                        }
                    }
                    config.data = obj
                }
                if (config.params) {
                    for (let key in config.params) {
                        if (config.params[key] != null) {
                            obj[key] = config.params[key]
                        }
                    }
                    config.params = obj
                }
                let token = Cookies.get('token')
                if (token) {
                    config.headers.Authorization = token
                } else if (!config.isExternal) {
                    router.push('/login')
                }
                return config
            },

            error => {
                if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
                    console.log('timeout请求超时')
                }
                const errorInfo = error.response
                if (errorInfo) {
                    error = errorInfo.data
                    const errorStatus = errorInfo.status
                    router.push({
                        path: `/error/${errorStatus}`
                    })
                }
                return Promise.reject(error)
            }
        )

        instance.interceptors.response.use(
            response => {
                let data;
                if (response.data == undefined) {
                    data = JSON.parse(response.request.responseText)
                } else {
                    data = response.data
                }
                if (data.code == 402 || data.code == 401) {
                    console.log('请求后跳转')
                    Cookies.remove("token")
                    router.push('/login')
                }
                // 无用方法
                switch (data.rc) {
                    case 1:
                        break;
                    case 0:
                        store.commit('changeState')
                    default:
                }
                loadinginstace.close();
                return data
            },
            err => {
                loadinginstace.close();
                if (err && err.response) {
                    switch (err.response.status) {
                        case 400:
                            err.message = '请求错误'
                            break
                        case 401:
                            err.message = '未授权，请登录'
                            break
                        case 402:
                            err.message = '当前登陆失效，请重新登录'
                            break
                        case 403:
                            err.message = '拒绝访问'
                            break
                        case 404:
                            err.message = `请求地址出错: ${err.response.config.url}`
                            break
                        case 408:
                            err.message = '请求超时'
                            break
                        case 500:
                            err.message = '服务器内部错误'
                            break
                        case 501:
                            err.message = '服务未实现'
                            break
                        case 502:
                            err.message = '网关错误'
                            break
                        case 503:
                            err.message = '服务不可用'
                            break
                        case 504:
                            err.message = '网关超时'
                            break
                        case 505:
                            err.message = 'HTTP版本不受支持'
                            break
                        default:
                    }
                }
                console.error(err)
                return Promise.reject(err)
            }
        )

        instance(options).then(res => {
            resolve(res)
            return false
        }).catch(error => {
            reject(error)
        })
    })
}