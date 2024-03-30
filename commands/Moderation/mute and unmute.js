const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms'); // Ensure this is installed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moderation')
        .setDescription('Moderation tools including muting and unmuting users 🛠️')
        .addSubcommand(subcommand =>
            subcommand.setName('mute')
                .setDescription('Puts someone in the virtual naughty corner 🤫')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The chatterbox to silence')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('duration')
                        .setDescription('How long they should be muted for (e.g., 10s, 5m, 1h, 2d)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Why are they being muted? Spill the tea ☕')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('unmute')
                .setDescription('Frees someone from the virtual naughty corner 😇')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The previously silenced chatterbox')
                        .setRequired(true))),
    async execute(interaction) {
        // Ensure the command is used in a guild
        if (!interaction.guild) {
            return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        }

        // Check if the bot has the necessary permissions
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: 'I need the permission to moderate members to do that! 🚫', ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id);
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'mute') {
            const duration = interaction.options.getString('duration');
            const reason = interaction.options.getString('reason') || 'No reason provided. Probably for being too awesome 😎';
            const time = ms(duration);

            if (!time) {
                return interaction.reply({ content: 'Please provide a valid time format (e.g., 10s, 5m, 1h, 2d).', ephemeral: true });
            }

            if (member.isCommunicationDisabled()) {
                return interaction.reply({ content: `${member.displayName} is already muted. Let's not overdo it, shall we? 🤷`, ephemeral: true });
            }

            try {
                await member.timeout(time, reason);
                interaction.reply({ content: `🔇 ${member.displayName} has been muted for ${ms(time, { long: true })}! Reason: ${reason}`, ephemeral: false });
            } catch (error) {
                console.error(error);
                interaction.reply({ content: `Failed to mute ${member.displayName}. Do I have the right permissions?`, ephemeral: true });
            }
        } else if (subcommand === 'unmute') {
            if (!member.isCommunicationDisabled()) {
                return interaction.reply({ content: `${member.displayName} is not muted. No action needed! 🎉`, ephemeral: true });
            }

            try {
                await member.timeout(null);
                interaction.reply({ content: `🎉 ${member.displayName} has been unmuted! Welcome back to the world of the chatty!`, ephemeral: false });
            } catch (error) {
                console.error(error);
                interaction.reply({ content: `Failed to unmute ${member.displayName}. Do I have the right permissions?`, ephemeral: true });
            }
        }
    },
};
