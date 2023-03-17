import Express from "express";
import createHttpError from "http-errors"
import multer from "multer";
import q2m from "query-to-mongo"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import {ProductsModel} from "../models.js"

const productsRouter = Express.Router()

const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
        cloudinary,
        params: {
            folder: "u4-marketplace/products",
        },
    }),
}).single("image")

// ------------------------------------------------------
// -------------------- Product Part --------------------
// ------------------------------------------------------

productsRouter.post("/", async (req, res, next) => {
    try {
        const product = new ProductsModel(req.body)
        const { _id } = await product.save()
        res.status(201).send({ _id })
    } catch (error) {
        next(error)
    }
})

productsRouter.get("/", async (req, res, next) => {
    try {
        const q = q2m(req.query)
        const products = await ProductsModel.find(q.criteria, q.options.fields)
            .limit(q.options.limit)
            .skip(q.options.skip)
            .sort(q.options.sort)
            .populate({path: "reviews", select: "comment rate"})
        const total = await ProductsModel.countDocuments(q.criteria)

        res.send({
            links: q.links(process.env.BE_URL + "/products", total),
            total,
            numberOfPages: Math.ceil(total / q.options.limit),
            products
        })
    } catch (error) {
        next(error)
    }
})
productsRouter.get("/:productId", async (req, res, next) => {
    try {
        const product = await ProductsModel.findById(req.params.productId).populate({path: "reviews", select: "comment rate"})
        if (product) {
            res.send(product)
        } else {
            next(createHttpError(404, `No product with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.put("/:productId", async (req, res, next) => {
    try {
        const product = await ProductsModel.findByIdAndUpdate(
            req.params.productId,
            req.body,
            {new: true, runValidators: true}
        )

        if (product) {
            res.send(product)
        } else {
            next(createHttpError(404, `No product with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.delete("/:productId", async (req, res, next) => {
    try {
        const product = await ProductsModel.findByIdAndDelete(req.params.productId)
        if (product) {
            res.status(204).send()
        } else {
            next(createHttpError(404, `No product with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.post("/:productId/upload", cloudinaryUploader, async (req, res, next) => {
    try {
        const product = await ProductsModel.findByIdAndUpdate(
            req.params.productId,
            {imageUrl: req.file.path},
            {new: true, runValidators: true}
        )
        if (product) {
            res.send(product)
        } else {
            next(createHttpError(404, `No product with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

// -----------------------------------------------------
// -------------------- Review Part --------------------
// -----------------------------------------------------

productsRouter.post("/:productId/reviews", async (req, res, next) => {
    try {
        const review = req.body
        const product = await ProductsModel.findByIdAndUpdate(
            req.params.productId,
            { $push: {reviews: review}},
            { new: true, runValidators: true }
        )
        if (product) {
            res.status(201).send({_id: product.reviews[product.reviews.length - 1]._id})
        } else {
            next(createHttpError(404, `No product with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.get("/:productId/reviews", async (req, res, next) => {
    try {
        const product = await ProductsModel.findById(req.params.productId)
        if (product) {
            res.send(product.reviews)
        } else {
            next(createHttpError(404, `No product with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
    try {
        const product = await ProductsModel.findById(req.params.productId)
        if (product) {
            const review = product.reviews.find(c => c._id.toString() === req.params.reviewId)
            if (review) {
                res.send(review)
            } else {
                next(createHttpError(404, `No review with id ${req.params.reviewId}`))
            }
        } else {
            next(createHttpError(404, `No product with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
    try {
        const product = await ProductsModel.findById(req.params.productId)
        if (product) {
            const i = product.reviews.findIndex(c => c._id.toString() === req.params.reviewId)
            if (i !== -1) {
                product.reviews[i] = {...product.reviews[i].toObject(), ...req.body}
                await product.save()
                res.send(product.reviews[i])
            } else {
                next(createHttpError(404, `No review with id ${req.params.reviewId}`))
            }
        } else {
            next(createHttpError(404, `No product with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

productsRouter.delete("/:productId/reviews/:reviewId", async (req, res, next) => {
    try {
        const product = await ProductsModel.findByIdAndUpdate(
            req.params.productId,
            { $pull: { reviews: { _id: req.params.reviewId } } },
            { new: true, runValidators: true}
        )
        if (product) {
            res.status(204).send()
        } else {
            next(createHttpError(404, `No product with id ${req.params.productId}`))
        }
    } catch (error) {
        next(error)
    }
})

export default productsRouter