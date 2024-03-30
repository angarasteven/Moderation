// commands/userwarnings.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const UserWarns = require('../../models/userWarns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userwarnings')
    .setDescription('Check the number of warnings a user has')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to check warnings for')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const guildId = interaction.guildId;
    const userId = target.id;

    // Retrieve the warnings for the user
    const userWarns = await UserWarns.findOne({ userId, guildId });

    // If the user has no warnings, send a fun message
    if (!userWarns || userWarns.warns.length === 0) {
      await interaction.reply({
        content: `🎉 Hooray! ${target.username} is as clean as a whistle! No warnings! Keep up the good vibes! 🌟`,
        ephemeral: true
      });
      return;
    }

    // If the user has warnings, compile the details
    const warningDetails = userWarns.warns.map((warn, index) => 
      `Warning ${index + 1}: Issued on ${warn.timestamp.toLocaleDateString()} - Reason: ${warn.reason || 'No specific reason provided.'}`
    ).join('\n');

    // Create an embed with the warning details
    const warningsEmbed = new EmbedBuilder()
      .setColor('#ffcc00')
      .setTitle(`🔍 Warning Report for ${target.username}`)
      .setDescription(`Uh-oh! Looks like someone's been naughty! Here's the scoop on ${target.username}'s warnings: 📜`)
      .addFields(
        { name: 'Total Warnings', value: `🚨 ${userWarns.warns.length} warning(s) on record!`, inline: false },
        { name: 'Details', value: warningDetails, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Remember, every day is a fresh start. Let\'s turn over a new leaf! 🍃' });

    // Send the embed to the channel
    await interaction.reply({ embeds: [warningsEmbed], ephemeral: false });
  },
};