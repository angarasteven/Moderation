// commands/lock.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const LockConfig = require('../../models/LockConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Manages channel locking settings and actions.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('channel')
        .setDescription('Locks a specified channel for the registered role.')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('The channel to lock (defaults to the current channel if not specified)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('setrole')
        .setDescription('Sets or updates the role used for locking channels.')
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('The role to configure for locking channels')
            .setRequired(true))),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'channel') {
      // Lock channel logic
      await lockChannel(interaction);
    } else if (interaction.options.getSubcommand() === 'setrole') {
      // Set role logic
      await setLockRole(interaction);
    }
  },
};

async function lockChannel(interaction) {
  // Check permissions
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await interaction.reply({
      content: `🚫 You don't have permission to lock channels!`,
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
      content: `🤔 No role is set up for locking channels yet. Use '/lock setrole' to set a role.`,
      ephemeral: true
    });
    return;
  }

  // Lock the channel
  await channel.permissionOverwrites.edit(config.lockRoleId, {
    SendMessages: false,
    AddReactions: false
  });

  await interaction.reply({
    content: `🔒 The channel ${channel.name} has been locked for the registered role.`,
    ephemeral: false
  });
}

async function setLockRole(interaction) {
  // Check permissions
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await interaction.reply({
      content: `🚫 You don't have permission to set the lock role!`,
      ephemeral: true
    });
    return;
  }

  const guildId = interaction.guildId;
  const role = interaction.options.getRole('role');

  // Update the configuration in MongoDB
  await LockConfig.findOneAndUpdate(
    { guildId },
    { lockRoleId: role.id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await interaction.reply({
    content: `✅ The role ${role.name} has been set for locking channels.`,
    ephemeral: false
  });
}