import mongoose from "mongoose";

const {Schema, model} = mongoose

const reviewSchema = new Schema(
    {
        comment: {type: String, required: true},
        rate: {type: Number, required: true, min: 0, max: 5}
    },
    {
        timestamps: true
    }
)

const productSchema = new Schema(
    {
        name: {type: String, required: true},
        description: {type: String, required: true},
        brand: {type: String, required: true},
        imageUrl: {default: "https://res.cloudinary.com/dhjtlovyg/image/upload/v1679047148/u4-marketplace/pic4261026_nyxwxf.jpg", type: String, required: true},
        price: {type: Number, required: true},
        category: {type: String, required: true},
        reviews: {default: [], type: [reviewSchema]}
    },
    {
        timestamps: true
    }
)

export const ProductsModel = model("Products", productSchema)