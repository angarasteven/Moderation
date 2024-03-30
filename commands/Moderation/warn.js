// commands/warn.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const UserWarns = require('../../models/userWarns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for the warning')
        .setRequired(false)), // Optional reason for the warning
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No specific reason provided.';
    const guildId = interaction.guildId;
    const userId = target.id;

    // Find or create a warning entry for the user, adding the reason for the warning
    const userWarns = await UserWarns.findOneAndUpdate(
      { userId, guildId },
      { $push: { warns: { warnNumber: 1, reason: reason } } }, // Include the reason
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const warnCount = userWarns.warns.length;
    let consequenceText = '';
    let actionTaken = false;

    // Determine the consequence based on the number of warnings
    switch (warnCount) {
      case 1:
        consequenceText = "No punishment, but I'm watching you! 👀";
        break;
      case 2:
        consequenceText = "Timeout for 1 minute. Take a moment to chill! ❄️";
        await interaction.guild.members.cache.get(userId)?.timeout(60000, `Warning 2: ${reason}`);
        actionTaken = true;
        break;
      case 3:
        consequenceText = "Timeout for 5 minutes. Go grab some water, hydrate! 💧";
        await interaction.guild.members.cache.get(userId)?.timeout(300000, `Warning 3: ${reason}`);
        actionTaken = true;
        break;
      case 4:
        consequenceText = "Timeout for 1 hour. Maybe it's time for a short break? 🕒";
        await interaction.guild.members.cache.get(userId)?.timeout(3600000, `Warning 4: ${reason}`);
        actionTaken = true;
        break;
      case 5:
        consequenceText = "Ban for 5 days. See you in a bit, think about what you've done! 🚪🚶";
        await interaction.guild.members.ban(userId, { days: 5, reason: `Warning 5: ${reason}` });
        actionTaken = true;
        break;
      default:
        consequenceText = "You've been warned more than 5 times... I'm out of punishments! 🤷";
    }

    // Create an embed for the DM to the user
    const userEmbed = new EmbedBuilder()
      .setColor('#ffcc00')
      .setTitle('Warning Issued! 🚨')
      .setDescription(`Hey ${target.username}, you've just been issued a warning!`)
      .addFields(
        { name: 'Warning Count', value: `This is warning number ${warnCount}! 😱`, inline: false },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Consequence', value: consequenceText, inline: false }
      )
      .setTimestamp();

    // Send the embed to the user via DM
    try {
      await target.send({ embeds: [userEmbed] });
    } catch (error) {
      console.error("Could not send DM to user. They might have DMs disabled.", error);
    }

    // Create a different embed for the channel
    const channelEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Moderation Action Taken')
      .setDescription(`A warning has been issued to ${target.username}.`)
      .addFields(
        { name: 'Current Warning Count', value: `${warnCount.toString()}`, inline: true },
        { name: 'Action Taken', value: actionTaken ? consequenceText : "No action taken.", inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    // Send the embed to the channel
    await interaction.reply({ embeds: [channelEmbed], ephemeral: false });
  },
};