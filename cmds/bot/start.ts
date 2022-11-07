import * as fs from "fs";

import yargs from "yargs";
import { CosmWasmClient } from "cosmwasm";

import { CmdRarity } from "../../pkg/discord/CmdRarity";
import { CmdRarityRiot } from "../../pkg/discord/CmdRarityRiot"

import { REST, Routes, Client, SlashCommandBuilder, GatewayIntentBits } from "discord.js";

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

    // Commands
    await rest.put(Routes.applicationCommands(discord_client_id), {
        body: [
            CmdRarity.cmd,
            CmdRarityRiot.cmd,
        ]
    })
        .catch((err) => console.error(err));

    // Handlers
    client.on('ready', () => {
        console.log(`Logged in as ${client?.user?.tag}!`);
    })

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        if (interaction.commandName === 'rarity') {
            await CmdRarity.run(client, interaction)
        }
    });

    client.login(discord_token);
}
