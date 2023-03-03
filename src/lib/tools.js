import fs from "fs-extra"
import {fileURLToPath} from "url"
import { dirname, join } from "path"

const { readJSON, writeJSON, writeFile } = fs

const folderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
const publicFolderPath = join(process.cwd(), "./public/img")
const productsImagePath = join(publicFolderPath, "./products")

const productsPath = join(folderPath, "products.json")
const reviewsPath = join(folderPath, "reviews.json")


export const getProducts = () => readJSON(productsPath)
export const setProducts = products => writeJSON(productsPath, products)
export const saveProductImage = (fileName, fileContent) => writeFile(join(productsImagePath, fileName), fileContent)

export const getReviews = () => readJSON(reviewsPath)
export const setReviews = products => writeJSON(reviewsPath, products)