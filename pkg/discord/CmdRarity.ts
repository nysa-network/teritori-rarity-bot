import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, SlashCommandStringOption, SlashCommandIntegerOption, CommandInteraction, Client } from "discord.js";

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
