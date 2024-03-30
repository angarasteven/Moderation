// commands/utility/help.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of available commands.'),
  async execute(interaction) {
    const commandsPath = path.join(__dirname, '..'); // Go up to the commands folder
    const commandFolders = fs.readdirSync(commandsPath).filter(file => fs.statSync(path.join(commandsPath, file)).isDirectory());

    const helpEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🛠️ Help Menu')
      .setDescription('Here are all the commands you can use:');

    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

      // Add a field to the embed for each subfolder
      helpEmbed.addFields({
        name: `${folder.charAt(0).toUpperCase() + folder.slice(1)} Commands 📁`,
        value: commandFiles.map(file => {
          // Remove the file extension to get the command name
          const commandName = file.replace('.js', '');
          // Use the command name as the value
          return `\`/${commandName}\``;
        }).join(', ') || 'No commands found in this category. 🤷‍♂️'
      });
    }

    // Send the embed to the user
    await interaction.reply({ embeds: [helpEmbed], ephemeral: false });
  },
};