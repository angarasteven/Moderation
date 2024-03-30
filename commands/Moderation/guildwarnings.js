// commands/guildwarnings.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserWarns = require('../../models/userWarns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guildwarnings')
    .setDescription('Displays all users with warnings in this guild.'),
  async execute(interaction) {
    const guildId = interaction.guildId;

    // Fetch all warnings for the guild
    const warnings = await UserWarns.find({ guildId });

    if (!warnings.length) {
      await interaction.reply({
        content: `🎉 Wow! It looks like this guild is a utopia! No warnings found. Keep up the good vibes, folks! 🌈`,
        ephemeral: true
      });
      return;
    }

    // Construct the warning details
    const warningDetails = warnings.map(warn => 
      `- ${warn.userId}: 🚨 ${warn.warns.length} warning(s)`
    ).join('\n');

    // Create an embed with the warning details
    const warningsEmbed = new EmbedBuilder()
      .setColor('#ffcc00')
      .setTitle(`🔍 Guild Warning Report: ${interaction.guild.name}`)
      .setDescription(`Uh-oh! Looks like not everyone's been on their best behavior. Here's the lowdown on who's been naughty: 😈`)
      .addFields(
        { name: 'Warning Summary', value: warningDetails, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Let\'s aim for a cleaner slate! Remember, every day is a new beginning. 🌅' });

    // Send the embed to the channel
    await interaction.reply({ embeds: [warningsEmbed], ephemeral: false });
  },
};