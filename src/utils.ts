import Discord, { ChannelType, Guild, NonThreadGuildBasedChannel, TextChannel, VoiceChannel } from 'discord.js';
import { format } from 'date-fns';
import Long from 'long';

export const log = (text) => {
  console.log(`${format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS O')}: ${text}`);
}

// code adapted from https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/frequently-asked-questions.md
export const getTextChannel = async (guild: Guild) => {
  const gulagChannel = await findChannel({ guild, name: ['gulag', 'gulag-text'], type: ChannelType.GuildText });
  if (gulagChannel != null && isTextChannel(gulagChannel)) return gulagChannel;

  // 'original' default channel
  const defaultChannel = await findChannel({ guild, id: guild.id, type: ChannelType.GuildText });
  if (defaultChannel != null && isTextChannel(defaultChannel)) return defaultChannel;

  // 'general' channel
  const generalChannel = await findChannel({ guild, name: 'general', type: ChannelType.GuildText });
  if (generalChannel != null && isTextChannel(generalChannel)) return generalChannel;

  // first channel that the bot has send messages permission in
  const allChannels = await guild.channels.fetch();

  // ensure we only look at text channels
  const textChannels = allChannels.filter(isTextChannel);

  // filter out channels where the bot can't send messages
  const permsChannels = textChannels.filter(c => c?.permissionsFor(guild.client.user)?.has('SendMessages'));

  // sort by position or ID if positions are the same
  const sortedChannels = permsChannels.sort((a, b) => a.position - b.position || Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())

  // finally, we only care about the first channel in the list.
  return sortedChannels.first();
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
  return user.edit({ channel: voiceChannel, reason: 'won in the Gulag' });
}

export const userLose = (user: Discord.GuildMember, textChannel: Discord.TextChannel, message?: string, logMessage?: string) => {
  log(logMessage || `${user.user.tag} lost the Gulag`);
  textChannel.send(message || `${user} lost, and has been shot in the fucking face.`);
  return user.edit({ channel: null, reason: 'lost in the Gulag' });
}

export const userTimeout = (user: Discord.GuildMember, textChannel: Discord.TextChannel, message?: string, logMessage?: string) => {
  log(logMessage || `${user.user.tag} timed out of the Gulag`);
  textChannel.send(message || `${user} ran out of time and was shot in the fucking face.`);
  return user.edit({ channel: null, reason: 'timed out of the Gulag' });
}

export const KnownUsers = {
  Cazif: '99305418186031104',
  docilememer: '226444355978657796'
} as const;

export const isVoiceChannel = (channel: NonThreadGuildBasedChannel | null): channel is VoiceChannel => {
  return (channel as VoiceChannel)?.type === ChannelType.GuildVoice;
};

export const isTextChannel = (channel: NonThreadGuildBasedChannel | null): channel is TextChannel => {
  return (channel as TextChannel)?.type === ChannelType.GuildText;
};

interface FindChannelOptions {
  guild: Guild;
  id?: string;
  name?: string | string[];
  type?: ChannelType;
}

export const findChannel = async ({guild, id, name, type}: FindChannelOptions) => {
  const channels = await guild.channels.fetch();

  return channels.find(channel => {
    // no channel at all
    if (channel == null) return false;

    if (name != null) {
      // an array of channel names was passed in
      if (Array.isArray(name)) {
        // if no name matches, this is not our channel
        if (!name.includes(channel.name)) return false;
      } else {
        // no array to check, only the one name matters
        if (name !== channel.name) return false;
      }
    }

    // if an id was passed in, check that it matches
    if (id != null) {
      if (id !== channel.id) return false;
    }

    // if a type was passed in, check that it matches
    if (type != null) {
      return type === channel.type;
    }

    return true;
  });
};
