const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

// Assuming you have a Map to track messages
const messageCache = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('A magical spell to make messages disappear into the void 🧙‍♂️')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('How many messages shall we banish? Choose wisely... (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const amount = interaction.options.getInteger('amount');

        // Get current time and the cutoff time which is 1 minute ago
        const currentTime = Date.now();
        const cutoffTime = currentTime - ms('1m');

        // Filter out messages that are older than 1 minute
        const eligibleMessages = [...messageCache.values()].filter(msg => {
            return msg.timestamp > cutoffTime;
        }).slice(0, amount);

        // Bulk delete messages
        try {
            await interaction.channel.bulkDelete(eligibleMessages.map(msg => msg.id), true);
            await interaction.editReply({
                content: `🧹✨ Poof! ${eligibleMessages.length} message(s) have vanished into thin air!`,
            });

            // Remove deleted messages from the cache
            eligibleMessages.forEach(msg => messageCache.delete(msg.id));
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: 'Alas! My powers have failed me this time... 😖 The arcane energies are disrupted, and the messages remain. Perhaps we shall try again once the cosmic alignment is more favorable? 🌌',
            });
        }
    },
};



    