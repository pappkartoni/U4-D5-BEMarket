import { checkSchema, validationResult } from "express-validator"
import createHttpError from "http-errors"

const productSchema = {
    name: {
        in: ["body"],
        isString: {
          errorMessage: "name must be String",
        },
    },
    description: {
        in: ["body"],
        isString: {
          errorMessage: "description must be String",
        },
    },
    brand: {
        in: ["body"],
        isString: {
          errorMessage: "brand must be String",
        },
    },
    imageUrl: {
        in: ["body"],
        optional: { options: { nullable: true } },
        isURL: {
            errorMessage: "imageUrl must be valid url to image",
        },
    },
    price: {
        in: ["body"],
        isInt: {
          errorMessage: "price must be nonnegative Int", //this should probably be float
          options: {min: 0}
        },
    },
    category: {
        in: ["body"],
        isString: {
          errorMessage: "category must be String",
        },
    },
}

const reviewSchema = {
    comment: {
        in: ["body"],
        isString: {
          errorMessage: "comment must be String",
        },
    },
    rate: {
        in: ["body"],
        isInt: {
          errorMessage: "title must be String",
          options: {min: 1, max: 5}
        },
    },
/*     productId: {
        in: ["body"],
        isUUID: {
          errorMessage: "productId must be UUID",
        },
    }, */
}

export const checkProductSchema = checkSchema(productSchema)
export const checkReviewSchema = checkSchema(reviewSchema)

export const triggerBadRequest = (req, res, next) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) {
        next()
    } else {
        next(createHttpError(400, "Errors during validation", { errorsList: errors.array() }))
    }
}