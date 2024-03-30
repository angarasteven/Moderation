const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

// Initialize the Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Could not connect to MongoDB:', err);
});

// Commands collection
client.commands = new Map();

// Recursive function to read command files from subdirectories
function readCommands(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      console.log(`Loading commands from subfolder: ${file}`);
      readCommands(fullPath); // Recurse into subdirectories
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      client.commands.set(command.data.name, command);
      console.log(`✅ Loaded command: ${command.data.name}`);
    }
  }
}

// Initial call to read commands from the main directory and subdirectories
readCommands(path.join(__dirname, 'commands'));

// Registering slash commands globally
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    const commands = [];
    client.commands.forEach(command => commands.push(command.data.toJSON()));

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Event handling
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// Login to Discord with your app's token
client.login(process.env.TOKEN);
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error:', err);
});
// Setup web server using Express
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Web server running at http://localhost:${port}`);
});