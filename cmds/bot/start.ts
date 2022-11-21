import * as fs from "fs";

import yargs from "yargs";
import { CosmWasmClient } from "cosmwasm";

import { CmdRarity } from "../../pkg/discord/CmdRarity";
import { Collection } from "../../pkg/collections/Collection"

import { REST, Routes, Client, SlashCommandBuilder, GatewayIntentBits, EmbedBuilder } from "discord.js";

export const command = "start";

export const describe = "start discord bot server";

export const builder = {
    discord_token: {
        type: String,
        env: "DISCORD_TOKEN",
        default: process.env.DISCORD_TOKEN,
        require: true,
    },
    discord_client_id: {
        type: String,
        env: "DISCORD_CLIENT_ID",
        default: process.env.DISCORD_CLIENT_ID,
        require: true,
    }
};

export const handler = async function (argv: yargs.ArgumentsCamelCase) {
    const { discord_token, discord_client_id } = argv

    const rest = new REST({ version: '10' }).setToken(discord_token);
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    const collections = [
        new Collection("riot"),
        new Collection("toripunks"),
    ]

    const error_resp = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`This collection does not exist`)
        .addFields(
            ...collections.map((x: Collection) => ({
                name: x.name,
                value: "\u200B"
            }))
        )

    // Commands
    await rest.put(Routes.applicationCommands(discord_client_id), {
        body: [
            CmdRarity.cmd,
            ...collections.map((x) => x.GetSlashCmd())
        ]
    }).catch((err) => console.error(err));

    // Handlers
    client.on('ready', () => {
        console.log(`Logged in as ${client?.user?.tag}!`);
    })

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }
        let cmd;

        if (interaction.commandName === 'rarity') {
            const collection_name = interaction.options.get("collection", true)?.value
            cmd = collections.find((x: Collection) => x.name === collection_name)
        } else {
            cmd = collections.find((x: Collection) => x.GetSlashCmdName() === interaction.commandName)
        }

        if (!cmd) {
            await interaction.reply({
                embeds: [error_resp],
            })
            return
        }

        try {
            await cmd.Run(client, interaction)
        } catch (err) {
            console.log(`[ERROR] ${interaction.commandName}: `, interaction.options, err)
            await interaction.reply(err)
            return
        }
    });

    client.login(discord_token);
}
