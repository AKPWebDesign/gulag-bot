import Discord from 'discord.js';
import { format } from 'date-fns';
import Long from 'long';

export const log = (text) => {
  console.log(`${format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS O')}: ${text}`);
}

// code adapted from https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/frequently-asked-questions.md
export const getTextChannel: (guild: Discord.Guild) => Discord.TextChannel = (guild) => {
  // 'gulag' channel
  const gulagChannel = guild.channels.cache.find(channel => ['gulag', 'gulag-text'].includes(channel.name));
  if (gulagChannel) return gulagChannel as Discord.TextChannel;

  // 'original' default channel
  const defaultChannel = guild.channels.cache.has(guild.id) && guild.channels.cache.get(guild.id);
  if (defaultChannel) return defaultChannel as Discord.TextChannel;

  // 'general' channel
  const generalChannel = guild.channels.cache.find(channel => channel.name === 'general');
  if (generalChannel) return generalChannel as Discord.TextChannel;

  // first channel that the bot has send messages permission in
  return guild.channels.cache
   .filter(c => c.type === 'text' && c.permissionsFor(guild.client.user).has('SEND_MESSAGES'))
   .sort((a, b) => a.position - b.position || Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
   .first() as Discord.TextChannel;
}

export const calculateWin = (a, b) => {
  if (a === b) return true;

  switch(`${a}${b}`) {
    case 'rockscissors':
    case 'paperrock':
    case 'scissorspaper':
      return true;
    default:
      return false;
  }
}

export const userWin = (user: Discord.GuildMember, textChannel: Discord.TextChannel, voiceChannel: Discord.VoiceChannel, message?: string, logMessage?: string) => {
  log(logMessage || `${user.user.tag} won the Gulag`);
  textChannel.send(message || `${user} won! Welcome back to the land of the living. For now.`);
  return user.edit({ channel: voiceChannel }, 'won in the Gulag');
}

export const userLose = (user: Discord.GuildMember, textChannel: Discord.TextChannel, message?: string, logMessage?: string) => {
  log(logMessage || `${user.user.tag} lost the Gulag`);
  textChannel.send(message || `${user} lost, and has been shot in the fucking face.`);
  return user.edit({ channel: null }, 'lost in the Gulag');
}

export const userTimeout = (user: Discord.GuildMember, textChannel: Discord.TextChannel, message?: string, logMessage?: string) => {
  log(logMessage || `${user.user.tag} timed out of the Gulag`);
  textChannel.send(message || `${user} ran out of time and was shot in the fucking face.`);
  return user.edit({ channel: null }, 'timed out of the Gulag');
}
