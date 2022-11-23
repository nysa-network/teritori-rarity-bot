import * as fs from "fs";

import { CosmWasmClient } from "cosmwasm";
import * as cliProgress from "cli-progress"
import { EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, CommandInteraction, Client } from "discord.js";


export default class Collection {
    public name: string;

    protected collection_dir: string;
    protected config: any;

    constructor(name: string) {
        this.name = name

        this.collection_dir = `./collections/${this.name}`
        if (fs.existsSync(`${this.collection_dir}/config.json`)) {
            this.config = JSON.parse(fs.readFileSync(`${this.collection_dir}/config.json`, 'utf-8')) || null
        }
    }

    async Import(cosmwasmClient: CosmWasmClient, contract: string) {
        this.config = await cosmwasmClient.queryContractSmart(contract, { config: {} });
        this.config.contract = contract

        if (!fs.existsSync(this.collection_dir)) {
            fs.mkdirSync(this.collection_dir);
        }
        fs.writeFileSync(`${this.collection_dir}/config.json`, JSON.stringify(this.config, null, 4))

        let { rarity, collections } = await this.parse(cosmwasmClient, contract)
        collections = await this.computeScore(rarity, collections)

        try {
            fs.writeFileSync(`${this.collection_dir}/collection.json`, JSON.stringify(collections, null, 4))
        } catch (err) {
            console.error("error", err)
        }
    }

    GetSlashCmdName(): string {
        return `rarity-${this.name}`
    }

    GetSlashCmd(): Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> {
        return new SlashCommandBuilder().setName(this.GetSlashCmdName())
            .setDescription("Check your NFT rarity")
            .addIntegerOption((option: SlashCommandIntegerOption) =>
                option.setName('id')
                    .setDescription('Select NFT number')
                    .setRequired(true))
    }

    async Run(client: Client, interaction: CommandInteraction) {
        const id = interaction.options.get("id", true)?.value as number

        const config = await this.get_config()

        if (id > parseInt(config.nft_max_supply)) {
            throw `Please select an nft between 1 and ${config.nft_max_supply}`
        }

        const nft = await this.get_collection_item(id) as any

        const fields = nft.info.extension.attributes
            .filter((x: any) => x.value !== 'None')
            .map((x: any) => ({
                name: x.trait_type,
                value: x.value,
                inline: true,
            }))

        const msg = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${(nft as any).info.extension.description} - #${id}`)
            .setURL(`https://app.teritori.com/nft/tori-${config.contract}-${id}`)
            .setDescription('Teritori Rarity checker')
            .setThumbnail(nft.info?.extension?.image?.replace("ipfs://", "https://nftstorage.link/ipfs/"))
            .addFields(
                { name: ':star: Score', value: nft.score.toString() },
                { name: ':top: Position', value: `${nft.position}/${config.nft_max_supply}` },
            )
            .addFields({ name: '\u200B', value: '\u200B' })
            .addFields(...fields)
            .setImage(nft.info?.extension?.image?.replace("ipfs://", "https://nftstorage.link/ipfs/"))
            .setFooter({ text: 'made with <3 by nysa.network', iconURL: 'https://avatars.githubusercontent.com/u/95248107?s=200&v=4' })
            .setTimestamp()

        const { position, score } = nft as any

        await interaction.reply({
            embeds: [msg]
        });
    }

    async parse(cosmwasmClient: CosmWasmClient, contract: string): Promise<{ collections: {}, rarity: {} }> {
        const MINTER_CONTRACT = this.config.nft_addr

        let rarity = {}
        let collections = {}

        const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

        let file_exist = false
        if (fs.existsSync(`${this.collection_dir}/collection.json`)) {
            collections = JSON.parse(fs.readFileSync(`${this.collection_dir}/collection.json`, 'utf-8'))
            file_exist = true
        } else {
            bar.start(this.config.nft_max_supply, 1);
        }


        for (let i = 1; i <= Number(this.config.nft_max_supply); i++) {
            let nft;

            if (!file_exist) {
                try {
                    nft = await cosmwasmClient.queryContractSmart(MINTER_CONTRACT, {
                        all_nft_info: {
                            include_expired: true,
                            token_id: i.toString()
                        }
                    });
                    bar.update(i)
                    collections[i] = nft
                } catch (err) {
                    bar.stop()
                    throw `[ERROR] failed to get NFT #${i}, err: ${err}`
                }

            } else {
                nft = collections[i.toString()]
            }

            for (const attr of nft.info.extension.attributes) {
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

        bar.stop()

        return {
            collections,
            rarity
        }
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
                if (attr.value === 'None' || !rarity[attr.trait_type][attr.value]) {
                    continue
                }

                score += rarity[attr.trait_type][attr.value].score
            }
            collections[id.toString()].id = id
            collections[id.toString()].score = score * 1000
        }

        collections = this.orderByScore(collections)
        return collections
    }

    protected orderByScore(collections: any): any {
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
        }

        return collections
    }

    protected get_config() {
        const config = JSON.parse(fs.readFileSync(`${this.collection_dir}/config.json`, 'utf-8'))
        return config
    }

    public get_collection_item(id: Number) {
        const collections = JSON.parse(fs.readFileSync(`${this.collection_dir}/collection.json`, 'utf-8'))

        const nft = Object.values(collections)
            .find((x: any) => x.id === id.toString())

        return nft
    }

}
