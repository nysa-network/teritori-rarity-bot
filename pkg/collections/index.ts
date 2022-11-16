
import * as fs from "fs"

export const get_config = async function (collection_name: String) {
    const config = JSON.parse(fs.readFileSync(`./collections/${collection_name}/config.json`, 'utf-8'))
    return config
}

export const get_collection = async function (collection_name: String, id: Number) {
    console.log(collection_name)
    const collections = JSON.parse(fs.readFileSync(`./collections/${collection_name}/collection.json`, 'utf-8'))

    const nft = Object.values(collections)
        .find((x: any) => x.id === id.toString())

    return nft
}
