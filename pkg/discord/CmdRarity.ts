import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, SlashCommandStringOption, SlashCommandIntegerOption, CommandInteraction, Client } from "discord.js";

import { get_collection, get_config } from "../collections/utils";

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
}; 
