import * as fs from "fs";
import yargs from "yargs";

export const command = "collections <cmd>";

export const describe = "collections commands";

export const builder = async function (argv: any) {
  return argv.commandDir("collections", {
    extensions: ["js", "ts"],
  });
};

export const handler = async function (argv: yargs.ArgumentsCamelCase) {};
