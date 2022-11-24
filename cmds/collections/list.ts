import * as fs from "fs";

import yargs from "yargs";
import { CosmWasmClient } from "cosmwasm";
import * as cliProgress from "cli-progress"
import { Collection, CollectionList } from "../../pkg/collections";

export const command = "list <collection>";

export const describe = "list a collection";

export const builder = {
    limit: {
        type: Number,
        default: undefined
    },
    out: {
        type: String,
        alias: "o",
        default: "json"
    }
};

export const handler = async function (argv: yargs.ArgumentsCamelCase) {
    const { collection, limit, out } = argv

    const cmd = CollectionList.find((x: Collection) => x.name === collection)
    if (!cmd) {
        throw `Error: Collection ${collection} not found`
    }

    const nft_collection = cmd?.get_collection()

    let ordered_collection = Object.values(nft_collection)
        .sort((a: any, b: any) => {
            if (a.score < b.score) return 1
            if (a.score > b.score) return -1
            return 0
        })
        .map((x: any, index: number) => ({
            id: x.id,
            position: index + 1
        }))

    if (limit) {
        ordered_collection = ordered_collection.slice(0, limit)
    }

    if (out === "json") {
        console.log(JSON.stringify(ordered_collection, null, 4))
    } else if (out === "csv") {
        console.log(Object.keys(ordered_collection[0]).join(","))
        for (let o of ordered_collection) {
            console.log(Object.values(o).join(","))
        }
    } else {
        console.log(JSON.stringify(ordered_collection, null, 4))
    }
}
