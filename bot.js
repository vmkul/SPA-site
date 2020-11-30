'use strict';

const { Telegraf } = require('telegraf');
const Telegram = require('telegraf/telegram');
const telegram = new Telegram(process.env.TOKEN);
const bot = new Telegraf(process.env.TOKEN);

const users = [];

bot.command('subscribe', async ctx => {
  const chat = await ctx.getChat();
  if (!users.includes(chat.id)) {
    users.push(chat.id);
    await ctx.reply('You subscribed to get orders!');
  } else {
    await ctx.reply('You already subscribed!');
  }
});

const sendOrderInfo = order => {
  users.forEach(async id => {
    await telegram.sendMessage(id, order);
  });
};

bot.launch().catch(e => {
  console.error(e);
  process.exit(1);
});

module.exports = sendOrderInfo;
