// commands/unwarn.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const UserWarns = require('../../models/userWarns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Remove the most recent warning from a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to remove the warning from')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for removing the warning')
        .setRequired(false)), // Optional reason for the unwarn
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'A mysterious benefactor decided to give you a second chance. 🕵️‍♂️';
    const guildId = interaction.guildId;
    const userId = target.id;

    // Retrieve the warnings for the user
    const userWarns = await UserWarns.findOne({ userId, guildId });

    // If the user has no warnings, send a message
    if (!userWarns || userWarns.warns.length === 0) {
      await interaction.reply({
        content: `🧐 Well, this is awkward. It seems like ${target.username} is an angel! No warnings to remove. They're probably off somewhere, spreading joy and happiness. 🌟`,
        ephemeral: true
      });
      return;
    }

    // Remove the most recent warning
    userWarns.warns.pop();
    await userWarns.save();

    // Notify the user who got unwarned
    const userNotificationEmbed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`🎉 Good News, ${target.username}!`)
      .setDescription(`Guess what? One of your warnings has just been removed! Looks like someone's been on their best behavior, or maybe you just caught a break. Either way, keep it up! 🚀`)
      .addFields(
        { name: 'Reason for Removal', value: reason, inline: false },
        { name: 'Current Warning Count', value: `You now have 🚨 ${userWarns.warns.length} warning(s). Keep those numbers low, and let's aim for zero! 🎯`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Remember, greatness is within your grasp! 🌈' });

    try {
      await target.send({ embeds: [userNotificationEmbed] });
    } catch (error) {
      console.error("Could not send DM to user. They might have DMs disabled.", error);
    }

    // Create an embed for the channel
    const unwarnEmbed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`✅ Warning Removed for ${target.username}`)
      .setDescription(`A little birdie told me that ${target.username} has had a warning removed from their record. 🐦 Who says second chances don't exist?`)
      .addFields(
        { name: 'Remaining Warnings', value: `🚨 ${userWarns.warns.length} warning(s) left on record. Let's keep the good vibes rolling!`, inline: false },
        { name: 'Reason for Removal', value: reason, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Here\'s to making every day better than the last! 🌅' });

    // Send the embed to the channel
    await interaction.reply({ embeds: [unwarnEmbed], ephemeral: false });
  },
};