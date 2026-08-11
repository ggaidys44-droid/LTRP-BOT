// ============================================
// ČIA REDAGUOKITE ROLES, KURIAS BOTAS DALINS
// ============================================
// Kiekvienam mygtukui reikia:
//   label   -> tekstas ant mygtuko
//   roleId  -> rolės ID (žr. instrukcijas README.md faile, kaip gauti)
//   style   -> mygtuko spalva: "Primary" (mėlynas), "Success" (žalias),
//              "Danger" (raudonas), "Secondary" (pilkas)
//   emoji   -> (nebūtina) emoji ant mygtuko, pvz. "🎮"

module.exports = {
  roles: [
    {
      label: "Rolė 1",
      roleId: "PASKITE_ROLES_ID_CIA",
      style: "Primary",
      emoji: "🎮",
    },
    {
      label: "Rolė 2",
      roleId: "PASKITE_ROLES_ID_CIA",
      style: "Success",
      emoji: "🎨",
    },
  ],

  // Žinutės, kuri rodys mygtukus, tekstas ir antraštė
  embed: {
    title: "Pasirinkite savo roles",
    description: "Paspauskite mygtuką žemiau, kad gautumėte arba atsisakytumėte rolės.",
    color: 0x5865f2, // Discord mėlyna spalva (hex)
  },
};
