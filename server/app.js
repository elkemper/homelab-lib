const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const KoaLogger = require('koa-logger')
const Router = require('koa-router')
const books = require('../routes/booksRoute')
const search = require('../routes/searchRoute')
const config = require('../config')

const app = new Koa()

const PORT = config.port

app.use(KoaLogger())
app.use(bodyParser())

const router = new Router()
router.get('/', async (ctx) => {
    try {
        ctx.body = {
            success: true,
        }
    } catch (e) {
        console.error(e)
    }
})

app.use(router.routes())
app.use(books.routes())
app.use(search.routes())

const server = app
    .listen(PORT, async () => {
        console.log(`Server listening on port: ${PORT}`)
    })
    .on('error', (e) => {
        console.log(e)
    })
