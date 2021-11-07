const Router = require('koa-router')
const searchController = require('../controllers/searchController')

const search = new Router()
search.get('/search', async (ctx) => {
    try {
        const { q, p } = ctx.request.query
        const page = p ? parseInt(p) : undefined
        ctx.body = await searchController.searchByWords(q, page)
    } catch (e) {
        console.error(e)
    }
})

module.exports = search
