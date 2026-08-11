const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

// ============================================
// TICKET KATEGORIJOS — čia galite redaguoti sąrašą
// ============================================
const TICKET_CATEGORIES = [
  { label: "Report Ticket", emoji: "⛔", description: "Jeigu norite pranešti apie nusižengimą." },
  { label: "Kompensacijos", emoji: "⛏️", description: "Jeigu praradote daiktą ar turite klausimų." },
  { label: "Automobilių edit", emoji: "🚗", description: "Jeigu jums reikalinga automobilio korekcija." },
  { label: "Atsiblokavimas", emoji: "🔒", description: "Jeigu manote, kad esate neteisingai užblokuotas." },
  { label: "Klaidos", emoji: "⚠️", description: "Jeigu radote klaidą serverio veikime." },
  { label: "Roleplay užklausos", emoji: "🎭", description: "Jeigu turite susigalvoję roleplay istoriją." },
  { label: "Darbo Keitimas", emoji: "💼", description: "Jeigu norite pereiti iš gaujos į policijos departamentą." },
  { label: "Pagalba", emoji: "❓", description: "Jeigu turite klausimų ar problemų." },
  { label: "Administracijos papeikimai", emoji: "🛡️", description: "Jeigu norite papeikti administracijos narį." },
  { label: "Parama", emoji: "⚒️", description: "Jeigu norite paremti serverį." },
  { label: "Patvirtinimas", emoji: "📝", description: "Jeigu norite atlikti vartotojo patvirtinimą." },
  { label: "Pirkimas", emoji: "🛒", description: "Užsakymai ir pirkimai." },
  { label: "Partneris", emoji: "🤝", description: "Jei norite partnerystės su serveriu." },
];

const TICKET_SETUP_DESCRIPTION = `
**Report Ticket**
⛔ Jeigu norite pranešti apie nusižengimą, naudokite šią komandą.

**Kompensacijos**
⛏️ Jeigu praradote daiktą ar turite klausimų dėl kompensacijų, naudokite šią komandą.

**Automobilių edit**
🚗 Jeigu jums reikalinga automobilio korekcija tuomet pasirinkite šią kategoriją.

**Atsiblokavimas**
🔒 Jeigu manote, kad esate neteisingai užblokuotas, naudokite šią kategoriją.

**Klaidos**
⚠️ Jeigu radote klaidą serverio veikime, naudokite šią kategoriją.

**Roleplay užklausos**
🎭 Jeigu turite susigalvoję roleplay istoriją ar norite pridėti naują funkciją.

**Darbo Keitimas**
💼 Jeigu norite pereiti iš gaujos į policijos departamentą ar atvirkščiai, naudokite šią kategoriją.

**Pagalba**
❓ Jeigu turite klausimų ar problemų, naudokite šią kategoriją.

**Administracijos papeikimai**
🛡️ Jeigu norite papeikti administracijos narį, naudokite šią kategoriją.

**Parama**
⚒️ Jeigu norite paremti serverį, naudokite šią kategoriją.

**Patvirtinimas**
📝 Jeigu norite atlikti vartotojo patvirtinimą, naudokite šią kategoriją.

**Pirkimas**
🛒 Užsakymai ir pirkimai.

**Partneris**
🤝 Jei norite partnerystės su serveriu.

🚩 **Svarbu**
Atidarius bilietą prašome pateikti visus įrodymus, detaliai aprašyti dėl ko kreipiatės – taip suteiksime pagalbą greičiau ir efektyviau.
`;

const MIGRATION_DESCRIPTION = `
Žaidi kitur? Migruok į LTRP ir gauk naujoko paketą.

• Iki 15K in-game valiutos.
• Keli papildomi būtini daiktai startui mūsų serveryje.
• Jeigu turėjai importinį automobilį kitame serveryje, pas mus gausi 50 Eur vertės automobilį.

Užpildyk migraciją, pateik visus reikalingus įrodymus ir administracija sutikrins informaciją bei pateiks atsakymą.
`;

// ============================================
// UI ELEMENTAI (select menu / mygtukai)
// ============================================
function buildTicketDropdownRow() {
  const select = new StringSelectMenuBuilder()
    .setCustomId("ticket_category_select")
    .setPlaceholder("Pasirinkite kategoriją")
    .addOptions(
      TICKET_CATEGORIES.map((c) => ({
        label: c.label,
        description: c.description.slice(0, 100),
        emoji: c.emoji,
      }))
    );
  return new ActionRowBuilder().addComponents(select);
}

function buildMigrationButtonRow() {
  const button = new ButtonBuilder()
    .setCustomId("start_migration_btn")
    .setLabel("Pradėti migraciją")
    .setStyle(ButtonStyle.Danger)
    .setEmoji("🚀");
  return new ActionRowBuilder().addComponents(button);
}

function buildTicketControlRow() {
  const button = new ButtonBuilder()
    .setCustomId("close_ticket_btn")
    .setLabel("Uždaryti Bilietą")
    .setStyle(ButtonStyle.Danger)
    .setEmoji("🔒");
  return new ActionRowBuilder().addComponents(button);
}

function buildTicketSetupEmbed(client) {
  const embed = new EmbedBuilder()
    .setTitle("pagalbos-ticket")
    .setDescription(TICKET_SETUP_DESCRIPTION)
    .setColor(0x2b2d31)
    .setFooter({ text: "Pasirinkite kategoriją žemiau" });
  const avatarUrl = client.user.displayAvatarURL();
  if (avatarUrl) {
    embed.setThumbnail(avatarUrl);
    embed.setImage(avatarUrl);
  }
  return embed;
}

function buildMigrationSetupEmbed() {
  return new EmbedBuilder()
    .setTitle("Migracija")
    .setDescription(MIGRATION_DESCRIPTION)
    .setColor(0xed4245)
    .setImage("https://i.imgur.com/vGkaHDx.jpg");
}

// ============================================
// PAGALBINĖ FUNKCIJA — patikrina .env kintamuosius
// ============================================
function getTicketConfig(guild, useMigrationCategory = false) {
  const categoryEnv = useMigrationCategory
    ? process.env.MIGRATION_CATEGORY_ID || process.env.TICKET_CATEGORY_ID
    : process.env.TICKET_CATEGORY_ID;
  const supportRoleEnv = process.env.SUPPORT_ROLE_ID;

  if (!categoryEnv || !supportRoleEnv) {
    return { error: "Klaida: Railway Variables nepilnai užpildyti (TICKET_CATEGORY_ID / SUPPORT_ROLE_ID)." };
  }

  const category = guild.channels.cache.get(categoryEnv);
  const supportRole = guild.roles.cache.get(supportRoleEnv);

  if (!category || category.type !== ChannelType.GuildCategory) {
    return { error: "Klaida: Bilietų kategorija nerasta šiame serveryje. Patikrinkite TICKET_CATEGORY_ID." };
  }
  if (!supportRole) {
    return { error: "Klaida: Pagalbos rolė nerasta šiame serveryje. Patikrinkite SUPPORT_ROLE_ID." };
  }

  return { category, supportRole };
}

// ============================================
// TICKET / MIGRACIJOS KANALO SUKŪRIMAS
// ============================================
async function createSupportChannel({ interaction, namePrefix, category, supportRole, embed }) {
  const channelName = `${namePrefix}-${interaction.user.username}`.toLowerCase().slice(0, 90);

  const channel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites: [
      { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
        ],
      },
      {
        id: supportRole.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
        ],
      },
    ],
  });

  await channel.send({
    content: `${interaction.user} | ${supportRole}`,
    embeds: [embed],
    components: [buildTicketControlRow()],
  });

  return channel;
}

// ============================================
// INTERAKCIJŲ APDOROJIMAS
// ============================================
async function handleTicketCategorySelect(interaction) {
  const selectedCategory = interaction.values[0];
  const { category, supportRole, error } = getTicketConfig(interaction.guild, false);

  if (error) {
    await interaction.reply({ content: error, ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`Sveiki atvykę į bilietą, ${interaction.member.displayName}!`)
    .setDescription(
      `**Kategorija:** ${selectedCategory}\n\nPrašome detaliai aprašyti savo problemą ir pateikti visus reikiamus įrodymus.\nAdministracija greitai su jumis susisieks.\n\nNorėdami uždaryti šį bilietą, paspauskite mygtuką žemiau.`
    )
    .setColor(0x57f287);

  try {
    const channel = await createSupportChannel({
      interaction,
      namePrefix: "ticket",
      category,
      supportRole,
      embed,
    });
    await interaction.reply({ content: `Bilietas sėkmingai sukurtas: ${channel}`, ephemeral: true });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: `Nepavyko sukurti kanalo: ${err.message}`, ephemeral: true });
  }
}

async function handleMigrationButton(interaction) {
  const { category, supportRole, error } = getTicketConfig(interaction.guild, true);

  if (error) {
    await interaction.reply({ content: error, ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`Migracijos užklausa – ${interaction.member.displayName}`)
    .setDescription(
      "Prašome pateikti:\n• Iš kokio serverio migruojate\n• Įrodymus (nuotraukas/ekrano nuotraukas) apie turėtą in-game valiutą ir daiktus\n• Jei turėjote importinį automobilį – įrodymus apie jo įsigijimą\n\nAdministracija sutikrins informaciją ir pateiks atsakymą.\n\nNorėdami uždaryti šį bilietą, paspauskite mygtuką žemiau."
    )
    .setColor(0xed4245);

  try {
    const channel = await createSupportChannel({
      interaction,
      namePrefix: "migracija",
      category,
      supportRole,
      embed,
    });
    await interaction.reply({ content: `Migracijos bilietas sėkmingai sukurtas: ${channel}`, ephemeral: true });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: `Nepavyko sukurti kanalo: ${err.message}`, ephemeral: true });
  }
}

async function handleCloseTicket(interaction) {
  const name = interaction.channel.name;
  if (!name.startsWith("ticket-") && !name.startsWith("migracija-")) {
    await interaction.reply({ content: "Šis mygtukas veikia tik bilieto kanale.", ephemeral: true });
    return;
  }

  await interaction.reply({ content: "Bilietas bus uždarytas..." });

  // Paprastas transkriptas (tekstinis) prieš ištrinant kanalą
  try {
    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const sorted = [...messages.values()].reverse();
        const transcriptText = sorted
          .map((m) => `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content}`)
          .join("\n");

        const buffer = Buffer.from(transcriptText || "(tuščias pokalbis)", "utf-8");
        const embed = new EmbedBuilder()
          .setTitle("Bilietas Uždarytas")
          .setDescription(
            `**Kanalas:** ${interaction.channel.name}\n**Uždarė:** ${interaction.user}\n**Data:** ${new Date().toLocaleString("lt-LT")}`
          )
          .setColor(0xed4245);

        await logChannel.send({
          embeds: [embed],
          files: [{ attachment: buffer, name: `${interaction.channel.name}.txt` }],
        });
      }
    }
  } catch (err) {
    console.error("Klaida generuojant transkriptą:", err);
  }

  setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
}

module.exports = {
  buildTicketDropdownRow,
  buildMigrationButtonRow,
  buildTicketControlRow,
  buildTicketSetupEmbed,
  buildMigrationSetupEmbed,
  handleTicketCategorySelect,
  handleMigrationButton,
  handleCloseTicket,
};
