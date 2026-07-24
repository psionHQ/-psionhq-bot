import { Telegraf } from "telegraf";
import { BOT_TOKEN } from "./config/env";

export const bot = new Telegraf(BOT_TOKEN);