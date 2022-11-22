import Collection from "./Collection";

export default class Toripunks extends Collection {
    name: string = "toripunks"

    constructor() {
        super("toripunks")
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
                if (attr.trait_type === "1:1") {
                    score += 100_000
                } else if (attr.trait_type === "Exclusive" && attr.value === "Yes") {
                    score += 10_000
                }
            }
            collections[id.toString()].id = id
            collections[id.toString()].score = score
        }

        collections = this.orderByScore(collections)
        return collections
    }
}
