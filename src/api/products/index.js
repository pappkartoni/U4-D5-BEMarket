import Express from "express";
import fs from "fs"
import createHttpError from "http-errors"
import multer from "multer";
import {dirname, extname, join} from "path"
import {fileURLToPath} from "url"
import {v4 as uuidv4} from "uuid"
import { checkProductSchema, checkProductUpdateSchema, checkReviewSchema, checkReviewUpdateSchema, triggerBadRequest } from "../validate.js"
import { getProducts, setProducts, getReviews, setReviews, saveProductImage} from "../../lib/tools.js";
import { port } from "../../server.js";

const productsRouter = Express.Router()

// Product Part

productsRouter.post("/", checkProductSchema, triggerBadRequest, async (req, res, next) => {
    try {
        const newProduct = {...req.body, id: uuidv4(), createdAt: new Date(), updatedAt: new Date()}
        const products = await getProducts()
        products.push(newProduct)
        await setProducts(products)
        res.status(201).send({message: "successfully created product", id: newProduct.id})
    } catch (error) {
        next(error)
    }
})

productsRouter.get("/", async (req, res, next) => {
    try {
        const products = await getProducts()
        if (req.query && req.query.category) {
            const filtered = products.filter(p => p.category.toLowerCase() === req.query.category.toLowerCase())
            res.send(filtered)
        } else {
            res.send(products)
        }
    } catch (error) {
        next(error)
    }
})
productsRouter.get("/:productId", async (req, res, next) => {
    try {
        const products = await getProducts()
        const found = products.find(p => p.id === req.params.productId)
        if (found) {
            res.send(found)
        } else {
            next(createHttpError(404, `no product found with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.put("/:productId", checkProductUpdateSchema, triggerBadRequest, async (req, res, next) => {
    try {
        const products = await getProducts()
        const i = products.findIndex(p => p.id === req.params.productId)
        if (i !== -1) {
            const updated = {...products[i], ...req.body, updatedAt: new Date()}
            products[i] = updated
            await setProducts(products)
            res.send(updated)
        } else {
            next(createHttpError(404, `no product found with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.delete("/:productId", async (req, res, next) => {
    try {
        const products = await getProducts()
        const remaining = products.filter(p => p.id !== req.params.productId)
        if (products.length !== remaining.length) {
            await setProducts(remaining)
            res.status(204).send({message: `successfully deleted product with id ${req.params.productId}`})
        } else {
            next(createHttpError(404, `no product found with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.post("/:productId/upload", multer().single("image"), async (req, res, next) => {
    try {
        const products = await getProducts()
        const i = products.findIndex(p => p.id === req.params.productId)
        if (i !== -1) {
            if (req.file) {
                const filename = req.params.productId + extname(req.file.originalname)
                await saveProductImage(filename, req.file.buffer)
                products[i] = {...products[i], imageUrl: `http://localhost:${port}/immg/products/${filename}`, updatedAt: new Date()}
                await setProducts(products)
                res.send({message: `image uploaded for ${req.params.productId}`})
            } else {
                next(createHttpError(400, `no image provided`))
            }
        } else {
            next(createHttpError(404, `no product found with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

// Review Part

productsRouter.post("/:productId/reviews", checkReviewSchema, triggerBadRequest, async (req, res, next) => {
    try {
        const products = await getProducts()
        const i = products.findIndex(p => p.id === req.params.productId)
        if (i !== -1 ) {
            const newReview = {...req.body, productId: req.params.productId, id: uuidv4(), createdAt: new Date(), updatedAt: new Date()}
            const reviews = await getReviews()
            reviews.push(newReview)
            await setReviews(reviews)
            res.status(201).send({message: "successfully created review", id: newReview.id})
        } else {
            next(createHttpError(404, `no product found with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.get("/:productId/reviews", async (req, res, next) => {
    try {
        const products = await getProducts()
        const i = products.findIndex(p => p.id === req.params.productId)
        if (i !== -1 ) {
            const reviews = (await getReviews()).filter(r => r.productId === req.params.productId)
            res.send(reviews)
        } else {
            next(createHttpError(404, `no product found with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
    try {
        const products = await getProducts()
        const i = products.findIndex(p => p.id === req.params.productId)
        if (i !== -1 ) {
            const reviews = (await getReviews()).filter(r => r.productId === req.params.productId)
            const found = reviews.find(r => r.id === req.params.reviewId)
            if (found) {
                res.send(found)
            } else {
                next(createHttpError(404, `no review found with id ${req.params.reviewId} belonging to product with id ${req.params.productId}`))
            }
        } else {
            next(createHttpError(404, `no product found with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.put("/:productId/reviews/:reviewId", checkReviewUpdateSchema, triggerBadRequest, async (req, res, next) => {
    try {
        const products = await getProducts()
        const i = products.findIndex(p => p.id === req.params.productId)
        if (i !== -1 ) {
            const reviews = await getReviews()
            const j = reviews.findIndex(r => r.id === req.params.reviewId)
            if (j !== -1) {
                if (reviews[j].productId === req.params.productId) {
                    const updated = {...reviews[j], ...req.body, updatedAt: new Date()}
                    reviews[j] = updated
                    await setReviews(reviews)
                    res.send(updated)
                } else {
                    next(createHttpError(404, `review with id ${req.params.reviewId} does not belong to product with id ${req.params.productId}`))
                }
            } else {
                next(createHttpError(404, `no review found with id ${req.params.reviewId}`))
            }
        } else {
            next(createHttpError(404, `no product found with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.delete("/:productId/reviews/:reviewId", async (req, res, next) => {
    try {
        const products = await getProducts()
        const i = products.findIndex(p => p.id === req.params.productId)
        if (i !== -1 ) {
            const reviews = await getReviews()
            const j = reviews.findIndex(r => r.id === req.params.reviewId)
            if (j !== -1) {
                if (reviews[j].productId === req.params.productId) {
                    const remaining = reviews.filter(r => r.id !== req.params.reviewId)
                    await setReviews(remaining)
                    res.status(204).send()
                } else {
                    next(createHttpError(404, `review with id ${req.params.reviewId} does not belong to product with id ${req.params.productId}`))
                }
            } else {
                next(createHttpError(404, `no review found with id ${req.params.reviewId}`))
            }
        } else {
            next(createHttpError(404, `no product found with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

export default productsRouter