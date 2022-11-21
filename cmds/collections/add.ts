import * as fs from "fs";

import yargs from "yargs";
import { CosmWasmClient } from "cosmwasm";
import * as cliProgress from "cli-progress"
import { Collection } from "../../pkg/collections/Collection";
import { Toripunks } from "../../pkg/collections/Toripunks";

export const command = "add";

export const describe =
    "add a collections into the `collections/` directory";

export const builder = {
    rpc_endpoint: {
        type: String,
        env: "RPC_ENDPOINT",
        default: "https://teritori-rpc.nysa.network:443/",
        require: true,
    },
    contract: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    }
};

export const handler = async function (argv: yargs.ArgumentsCamelCase) {
    const { rpc_endpoint, contract, name, countNone } = argv

    const client = await CosmWasmClient.connect(rpc_endpoint);

    const collections = {
        "toripunks": Toripunks
    }

    let collection: Collection;

    if (collections[name]) {
        collection = await new collections[name](client, name, contract)
    } else {
        collection = new Collection(name)
    }

    await collection.Import(client, contract)

    client.disconnect()
}
