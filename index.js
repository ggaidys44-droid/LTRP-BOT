require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const config = require("./config.js");
const ticketSystem = require("./ticketSystem.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// ---------- Slash komandos registravimas ----------
const commands = [
  new SlashCommandBuilder()
    .setName("rolemenu")
    .setDescription("Išsiunčia žinutę su mygtukais rolėms gauti"),
  new SlashCommandBuilder()
    .setName("setupticket")
    .setDescription("Išsiunčia ticket sistemos žinutę (tik administratoriams)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder()
    .setName("setupmigracija")
    .setDescription("Išsiunčia migracijos žinutę (tik administratoriams)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
].map((c) => c.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  try {
    if (process.env.GUILD_ID) {
      // Greitas registravimas vienam serveriui (rekomenduojama testuojant)
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log("✅ Slash komandos užregistruotos serveryje (greitai matysis).");
    } else {
      // Globalus registravimas (užtrunka iki 1 val., kol pasirodo visur)
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });
      console.log("✅ Slash komandos užregistruotos globaliai (gali užtrukti iki 1 val.).");
    }
  } catch (err) {
    console.error("❌ Klaida registruojant komandas:", err);
  }
}

// ---------- Boto paruošimas ----------
client.once("clientReady", async () => {
  console.log(`✅ Botas prisijungė kaip ${client.user.tag}`);
  await registerCommands();
});

// ---------- Komandų ir mygtukų apdorojimas ----------
client.on("interactionCreate", async (interaction) => {
  // /rolemenu komanda
  if (interaction.isChatInputCommand() && interaction.commandName === "rolemenu") {
    const embed = new EmbedBuilder()
      .setTitle(config.embed.title)
      .setDescription(config.embed.description)
      .setColor(config.embed.color);

    const row = new ActionRowBuilder().addComponents(
      config.roles.map((r) =>
        new ButtonBuilder()
          .setCustomId(`role_${r.roleId}`)
          .setLabel(r.label)
          .setStyle(ButtonStyle[r.style] || ButtonStyle.Primary)
          .setEmoji(r.emoji || undefined)
      )
    );

    await interaction.reply({ embeds: [embed], components: [row] });
    return;
  }

  // /setupticket komanda
  if (interaction.isChatInputCommand() && interaction.commandName === "setupticket") {
    const embed = ticketSystem.buildTicketSetupEmbed(client);
    await interaction.reply({ embeds: [embed], components: [ticketSystem.buildTicketDropdownRow()] });
    return;
  }

  // /setupmigracija komanda
  if (interaction.isChatInputCommand() && interaction.commandName === "setupmigracija") {
    const embed = ticketSystem.buildMigrationSetupEmbed();
    await interaction.reply({ embeds: [embed], components: [ticketSystem.buildMigrationButtonRow()] });
    return;
  }

  // Ticket kategorijos pasirinkimas (select menu)
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_category_select") {
    await ticketSystem.handleTicketCategorySelect(interaction);
    return;
  }

  // Migracijos mygtukas
  if (interaction.isButton() && interaction.customId === "start_migration_btn") {
    await ticketSystem.handleMigrationButton(interaction);
    return;
  }

  // Ticket uždarymo mygtukas
  if (interaction.isButton() && interaction.customId === "close_ticket_btn") {
    await ticketSystem.handleCloseTicket(interaction);
    return;
  }

  // Mygtuko paspaudimas (rolių priskyrimas)
  if (interaction.isButton() && interaction.customId.startsWith("role_")) {
    const roleId = interaction.customId.replace("role_", "");
    const member = interaction.member;
    const role = interaction.guild.roles.cache.get(roleId);

    if (!role) {
      await interaction.reply({
        content: "⚠️ Šios rolės nepavyko rasti. Patikrinkite roleId config.js faile.",
        ephemeral: true,
      });
      return;
    }

    try {
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        await interaction.reply({
          content: `❌ Rolė **${role.name}** panaikinta.`,
          ephemeral: true,
        });
      } else {
        await member.roles.add(roleId);
        await interaction.reply({
          content: `✅ Rolė **${role.name}** priskirta!`,
          ephemeral: true,
        });
      }
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content:
          "⚠️ Nepavyko priskirti rolės. Patikrinkite, ar boto rolė serverio nustatymuose yra AUKŠČIAU už dalinamą rolę.",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
