import Express from "express"
import cors from "cors"
import { join } from "path"
import {badRequestHandler, unauthorizedHandler, notfoundHandler, genericErrorHandler} from "./errors.js"
import productsRouter from "./api/products/index.js"

const publicPath = join(process.cwd(), "./public")
export const port = 3420

const server = Express()
server.use(Express.static(publicPath))
server.use(cors())
server.use(Express.json())

server.use("/products", productsRouter)

server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notfoundHandler)
server.use(genericErrorHandler)

server.listen(port, () => {
    console.log(`Server started at Port: ${port}`)
})