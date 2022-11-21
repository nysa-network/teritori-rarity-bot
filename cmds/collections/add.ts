import * as fs from "fs";

import yargs from "yargs";
import { CosmWasmClient } from "cosmwasm";
import { CollectionList, Collection, Toripunks } from "../../pkg/collections";

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

    let collection = CollectionList.find((x: Collection) => x.name === name)
    if (!collection) {
        collection = new Collection(name)
    }

    await collection?.Import(client, contract)

    client.disconnect()
}
