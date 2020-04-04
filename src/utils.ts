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

export const getVoiceChannels: (guild: Discord.Guild) => Discord.TextChannel = (guild) => {
  // voice channels
  return guild.channels.cache
   .filter(c => c.type === 'voice');
}


//Figures out if Rasputin makes an appearance with a special event
//This is where should add more random events
export function Rasputin (user: Discord.GuildMember, voiceChannel: Discord.VoiceChannel, guild: Discord.Guild, gulagUsers, channel ) {

  if (user.id === '99305418186031104') { // Cazif
    if (Math.random() < 0.69) { // 69% chance that Cazif triggers the easter egg
      delete gulagUsers[user.id];
      log(`${user.user.tag} triggered the Cazif likes men easter egg!`);
      channel.send(`${user} likes men. Men don't like ${user}. Neither does the Gulag.`);
      user.edit({ channel: null }, 'lost in the Gulag');
      return true;
    }
  }
  else if (Math.random() < 0.05) { //deathnote
    log(`The gulag is empty except for a shadowy figure, Rasputin appears for ${user.user.tag}`);
    channel.send(`The gulag is empty except for a shadowy figure - Rasputin appears for ${user.user.tag}! He says "YOU HAVE A CHAOTIC AURA. WRITE A NAME IN MY DEATHNOTE AND BE SPARED"`)
    .then(() => channel.send(`${user}, type someone's name exactly to kill them with Rasputin's Death Note.`))
      .then((msg) => {
        // listen for messages from the user
        const filter = m => m.author.id === user.id;
        const collector = msg.channel.createMessageCollector(filter, { time: 15000 });

        collector.on('collect', m => {
          delete gulagUsers[user.id];
          collector.stop();
          const chosen = m.content.trim();
          for (let member: Discord.GuildMember in guild.members) {
            if (member.nickname === chosen) {
              member.edit({ channel: null }, ' falls down the stairs.');
              user.edit({ channel: voiceChannel });
            }
          }
        });
        
        collector.on('end', () => {
          if (gulagUsers[user.id]) {
            delete gulagUsers[user.id];
            userTimeout(user, channel);
          }
        });  
            
      });
      return true;
  }






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
