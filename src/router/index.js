import Vue from 'vue'
import VueRouter from 'vue-router'
import AutoRouteGenerator from 'ea-router'
import Cookies from 'js-cookie'

import defaultLayout from '@/components/defaultLayout.vue'
import notFoundPage from '@/components/notFound.vue'

Vue.use(VueRouter)

let generator = new AutoRouteGenerator(
    require.context('@/views', true, /\.vue$/))

generator.setDefaultLayout(defaultLayout)
generator.setNotFoundPage(notFoundPage)

const routes = [{
    path: '/',
    redirect: '/login'
}, ...generator.generate()]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title + ' - 后台管理'
    } else {
        document.title = '后台管理'
    }
    let token = Cookies.get('token')
    if (to.path === '/login') {
        next()
    } else {
        if (!token) {
            next({
                path: '/login'
            })
        } else {
            next()
        }
    }
    next()
})

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

export default router