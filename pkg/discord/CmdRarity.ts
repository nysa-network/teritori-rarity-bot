import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, SlashCommandStringOption, SlashCommandIntegerOption, CommandInteraction, Client } from "discord.js";
import { Command } from "./Command";

import { get_collection, get_config } from "../collections";

export const CmdRarity: any = {
    name: "rarity",
    description: "Check your NFT rarity",
    cmd: new SlashCommandBuilder().setName("rarity")
        .setDescription("Check your NFT rarity")
        .addStringOption(
            (option: SlashCommandStringOption) =>
                option.setName('collection')
                    .setDescription('Select NFT collection')
                    .setRequired(true))
        .addIntegerOption((option: SlashCommandIntegerOption) =>
            option.setName('id')
                .setDescription('Select NFT number')
                .setRequired(true)),

    // Handler
    run: async (client: Client, interaction: CommandInteraction) => {
        const collection_name = interaction.options.get("collection", true)?.value
        const id = interaction.options.get("id", true)?.value

        const config = await get_config(collection_name as string)

        let nft;
        try {
            nft = await get_collection(collection_name as string, id as number) as any
        } catch (err) {
            await interaction.reply({
                content: "failed to get nft"
            })
            return
        }

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
        console.log(nft)

        await interaction.reply({
            embeds: [msg]
        });
    }
}; 
