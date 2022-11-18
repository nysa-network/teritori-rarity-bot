import * as fs from "fs";

import yargs from "yargs";
import { CosmWasmClient } from "cosmwasm";
import * as cliProgress from "cli-progress"

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
    'count-none': {
        type: Boolean,
        require: true,
        default: false
    }
};

export const handler = async function (argv: yargs.ArgumentsCamelCase) {
    const { rpc_endpoint, contract, countNone } = argv
    const client = await CosmWasmClient.connect(rpc_endpoint);

    let config = await client.queryContractSmart(contract, { config: {} });
    config.contract = contract

    const COLLECTION_DIR = `collections/${config.nft_symbol}`

    if (!fs.existsSync(COLLECTION_DIR)) {
        fs.mkdirSync(COLLECTION_DIR);
    }
    fs.writeFileSync(`${COLLECTION_DIR}/config.json`, JSON.stringify(config, null, 4))


    const MINTER_CONTRACT = config.nft_addr

    let rarity = {}
    let collections = {}

    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    let file_exist = false
    if (fs.existsSync(`${COLLECTION_DIR}/collection.json`)) {
        collections = JSON.parse(fs.readFileSync(`${COLLECTION_DIR}/collection.json`, 'utf-8'))
        file_exist = true
    } else {
        bar.start(config.nft_max_supply, 1);
    }


    for (let i = 1; i <= Number(config.nft_max_supply); i++) {
        let nft;

        if (!file_exist) {
            nft = await client.queryContractSmart(MINTER_CONTRACT, {
                all_nft_info: {
                    include_expired: true,
                    token_id: i.toString()
                }
            });
            bar.update(i)
            collections[i] = nft
        } else {
            nft = collections[i.toString()]
        }

        for (const attr of nft.info.extension.attributes) {
            if (!countNone && attr.value === 'None') {
                continue
            }
            if (!rarity[attr.trait_type]) {
                rarity[attr.trait_type] = {}
            }
            if (!rarity[attr.trait_type][attr.value]) {
                rarity[attr.trait_type][attr.value] = {
                    count: 0,
                }
            }
            rarity[attr.trait_type][attr.value].count += 1
        }
    }

    // Compute attributes rarity and score
    for (let [trait, values] of Object.entries(rarity)) {
        for (let [val, _] of Object.entries(values as any)) {
            rarity[trait][val].score = 1 / rarity[trait][val].count / config.nft_max_supply
        }
    }

    // Set scores on nft
    for (let [id, nft] of Object.entries(collections)) {
        let score = 0
        for (const attr of (nft as any).info.extension.attributes) {
            if (!rarity[attr.trait_type][attr.value]) {
                continue
            }

            score += rarity[attr.trait_type][attr.value].score
        }
        collections[id.toString()].id = id
        collections[id.toString()].score = score * 1000
    }

    // Sort by rarity (score)
    const ordered_collections = Object.values(collections)
        .map((x: any) => ({
            id: x.id,
            score: x.score,
        }))
        .sort((a: any, b: any) => {
            if (a.score < b.score) return 1
            if (a.score > b.score) return -1
            return 0
        })


    for (let [i, nft] of Array.from(ordered_collections.entries())) {
        collections[nft.id].position = i + 1
        if (i < 5) {
            console.log(nft)
        }
    }

    // console.log(collections)
    fs.writeFileSync(`${COLLECTION_DIR}/collection.json`, JSON.stringify(collections, null, 4))
    bar.stop()

    client.disconnect()
}
