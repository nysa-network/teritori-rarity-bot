import * as fs from "fs";

import yargs from "yargs";
import { CosmWasmClient } from "cosmwasm";
import * as cliProgress from "cli-progress"
import { Collection, CollectionList } from "../../pkg/collections";

export const command = "show <collection> <id>";

export const describe = "show a collection item";

export const builder = {};

export const handler = async function (argv: yargs.ArgumentsCamelCase) {
    const { collection, id } = argv

    const cmd = CollectionList.find((x: Collection) => x.name === collection)
    if (!cmd) {
        throw `Error: Collection ${collection} not found`
    }
    const nft = cmd?.get_collection_item(id)

    console.log(JSON.stringify(nft, null, 4))
}
