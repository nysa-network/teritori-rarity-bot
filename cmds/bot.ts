import * as fs from "fs";
import yargs from "yargs";

export const command = "bot <cmd>";

export const describe = "bot commands";

export const builder = async function (argv: any) {
  return argv.commandDir("bot", {
    extensions: ["js", "ts"],
  });
};

export const handler = async function (argv: yargs.ArgumentsCamelCase) {};
