// commands/unlock.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const LockConfig = require('../../models/LockConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlocks a specified channel for the registered role.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to unlock (defaults to the current channel if not specified)')
        .setRequired(false)),
  async execute(interaction) {
    // Check if the user has permission to manage roles
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({
        content: `🚫 You don't have the magical keys to unlock channels! You need the "Manage Roles" permission to perform this spell. 🗝️`,
        ephemeral: true
      });
      return;
    }

    const guildId = interaction.guildId;
    const specifiedChannel = interaction.options.getChannel('channel');
    const channel = specifiedChannel || interaction.channel;

    // Retrieve the configuration from MongoDB
    const config = await LockConfig.findOne({ guildId });

    if (!config || !config.lockRoleId) {
      await interaction.reply({
        content: `🤔 It seems like we don't have a role set up for unlocking channels. Maybe it's already as free as a bird? 🐦 Check '/lock setrole' to set a role.`,
        ephemeral: true
      });
      return;
    }

    // Unlock the channel for the specified role
    await channel.permissionOverwrites.edit(config.lockRoleId, {
      SendMessages: null,
      AddReactions: null
    }).then(() => {
      interaction.reply({
        content: `🔓 The channel ${channel.name} has been unlocked for the registered role. Let the chatter resume! May the discussions be ever in your favor. 🎉`,
        ephemeral: false
      });
    }).catch(error => {
      console.error('Error unlocking the channel:', error);
      interaction.reply({
        content: `😓 Something went wrong while trying to unlock the channel. Please try again or check my permissions.`,
        ephemeral: true
      });
    });
  },
};