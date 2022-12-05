import Collection from "./Collection";

export default class YieldGorillas extends Collection {
    name: string = "yield-gorillas"

    constructor() {
        super("yield-gorillas")
    }

    async computeScore(rarity: any, collections: any): Promise<any> {
        // Compute attributes rarity and score
        for (let [trait, values] of Object.entries(rarity)) {
            for (let [val, _] of Object.entries(values as any)) {
                rarity[trait][val].score = 1 / rarity[trait][val].count / this.config.nft_max_supply
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

                if (attr.trait_type === "Skin") {
                    if (["Legend"].includes(attr.value)) {
                        score += 1500
                    } else if (["Bull"].includes(attr.value)) {
                        score += 1000
                    } else if (["Mooned"].includes(attr.value)) {
                        score += 500
                    } else if (["Bear", "Pump"].includes(attr.value)) {
                        score += 250
                    } else if (["Neat", "Elemental"].includes(attr.value)) {
                        score += 100
                    }
                }
            }
            collections[id.toString()].id = id
            collections[id.toString()].score = score
        }

        collections = this.orderByScore(collections)
        return collections
    }
}
