import Discord from 'discord.js';
import { calculateWin, getTextChannel, log, userLose, userTimeout, userWin } from './utils';

// load dotenv file into process.env
require('dotenv').config();

const client = new Discord.Client();

const gulagUsers: { [index: string]: boolean } = {};

client.on('ready', () => {
  log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('The Gulag', { type: 'WATCHING' });
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const oldChannel = oldState.channel;
  const guild = newState.guild;
  const channel = newState.channel;
  const user = newState.member;

  if (!channel || !user) { return; }

  if (gulagUsers[user.id] && channel.name !== 'Gulag') {
    user.edit({ channel: guild.channels.cache.find(channel => channel.name === 'Gulag')});
  }

  if (channel.name === 'Gulag' && !gulagUsers[user.id]) {
    gulagUsers[user.id] = true;

    log(`${user.user.tag} entered the Gulag`);

    // get the correct text channel to send updates to
    const channel = getTextChannel(guild);

    if (user.id === '99305418186031104') { // Cazif
      if (Math.random() < 0.69) { // 69% chance that Cazif triggers the easter egg
        log(`${user.user.tag} triggered the Cazif likes men easter egg!`);
        channel.send(`${user} likes men. Men don't like ${user}. Neither does the Gulag.`);
        return setTimeout(() => {
          delete gulagUsers[user.id];
          return user.edit({ channel: null }, 'lost in the Gulag');
        }, 4000);
      }
    }

    if (user.id === '226444355978657796') { // docilememer
      if (Math.random() < 0.15) {
        log(`${user.user.tag} triggered the goblin easter egg!`);
        channel.send(`${user}? We don't take kindly to goblins in the Gulag!`);
        return setTimeout(() => {
          delete gulagUsers[user.id];
          return user.edit({ channel: null }, 'lost in the Gulag');
        }, 4000);
      }
    }

    // send a message telling everyone the user is now in the Gulag and can only exit if they win a game of rock, paper, scissors
    channel.send(`${user} has been banished to the Gulag! They will need to win a game of Rock, Paper, Scissors to gain their freedom!`)
      .then(() => channel.send(`${user}, type \`rock\`, \`paper\`, or \`scissors\` to play! Choose wisely though, one wrong move and you're dead.`))
      .then((msg) => {
        // listen for messages from the user
        const filter = m => m.author.id === user.id;
        const collector = msg.channel.createMessageCollector(filter, { time: 15000 });

        collector.on('collect', m => {
          delete gulagUsers[user.id];
          collector.stop();

          const valid = ['rock', 'paper', 'scissors'];
          const chosen = m.content.trim().toLowerCase()

          if (!valid.includes(chosen)) {
            const ignore = Math.random() >= 0.95; // 5% chance to get lucky and win anyway
            if (ignore && oldChannel) {
              return userWin(
                user,
                channel,
                oldChannel,
                `${user} didn't pick a valid option, but that was pretty funny... you got lucky this time, fucko.`,
                `${user.user.tag} picked an invalid option but got lucky and won anyway.`,
              );
            }
            return userLose(
              user,
              channel,
              `${user} didn't pick a valid option, and has been shot in the fucking face.`,
              `${user.user.tag} picked invalid option... disconnecting`,
            );
          }

          // bot can only choose from the options that the user did not choose.
          const botChoices = valid.filter(s => s !== chosen);
          const botIndex = Math.floor(Math.random() * Math.floor(2));

          channel.send(`${user} chose \`${chosen}\` and I chose \`${botChoices[botIndex]}\`.`);

          const win = calculateWin(chosen, botChoices[botIndex]);

          if (win) {
            if (!oldChannel) {
              return userLose(
                user,
                channel,
                `${user} won, but I accidentally shot them in the fucking face anyway.`,
                `${user.user.tag} won the Gulag with no previous channel... disconnecting`,
              );
            }
            userWin(user, channel, oldChannel);
          } else {
            userLose(user, channel);
          }
        });

        collector.on('end', () => {
          if (gulagUsers[user.id]) {
            delete gulagUsers[user.id];
            userTimeout(user, channel);
          }
        });
      });
  }
});

client.login(process.env.TOKEN);
