# LTRP.LT rolių botas — instrukcijos

Botas siunčia žinutę su mygtukais. Paspaudus mygtuką, vartotojas gauna (arba netenka) rolės.

---

## 1 ŽINGSNIS — Pasiruoškite rolių ID

1. Discord programoje: **Settings (⚙️) → Advanced → Developer Mode** → įjunkite.
2. Serverio nustatymuose (arba tiesiog sąraše kairėje) raskite rolę, kurią norite dalinti.
3. Spauskite **dešiniu pelės klavišu ant rolės → "Copy Role ID"**.
4. Atidarykite `config.js` failą ir įklijuokite ID vietoj `PASKITE_ROLES_ID_CIA`.
   Galite pridėti tiek rolių/mygtukų, kiek reikia — tiesiog kopijuokite bloką.

## 2 ŽINGSNIS — Sutvarkykite boto teises Discord serveryje

Kad botas galėtų priskirti roles, jo **paties rolė** serverio rolių sąraše
(**Server Settings → Roles**) turi būti **AUKŠČIAU** už tas roles, kurias jis dalins.
Tiesiog nutempkite boto rolę į viršų sąraše.

## 3 ŽINGSNIS — Patikrinkite kvietimo nuorodą

Developer Portal → **OAuth2 → URL Generator**:
- Scopes: pažymėkite `bot` ir `applications.commands`
- Permissions: pažymėkite bent **Manage Roles**, **Send Messages**, **Embed Links**, **Use Slash Commands**
- Jei botas jau buvo pridėtas be šių teisių — sugeneruokite nuorodą iš naujo ir vėl pakvieskite (Discord atnaujins teises, nereikia trinti boto).

## 4 ŽINGSNIS — Paleidimas per Railway (rekomenduojama, 24/7, nemokamai)

1. Eikite į [railway.app](https://railway.app) ir prisijunkite (galima per Discord/GitHub paskyrą).
2. Spauskite **New Project → Empty Project**.
3. Šiame projekte spauskite **"+ New" → "Empty Service"**, po to skiltyje **Settings**
   raskite **"Deploy from local directory"** arba lengviausia: įkelkite šį aplanką į
   GitHub repozitoriją ir Railway'uje pasirinkite **"Deploy from GitHub repo"**.
4. Skiltyje **Variables** pridėkite:
   - `DISCORD_TOKEN` = jūsų boto tokenas
   - `CLIENT_ID` = `1536485103243493468`
   - `GUILD_ID` = jūsų serverio ID (pagal 1 žingsnio instrukciją, tik server ID vietoj role ID)
5. Skiltyje **Settings → Start Command** įrašykite: `npm start`
6. Railway automatiškai paleis botą. Žurnaluose (**Deployments → View Logs**) turėtumėte pamatyti:
   `✅ Botas prisijungė kaip ...`

## 5 ŽINGSNIS — Paleidimas savo serveryje

Jei serveryje jau turite naudotojo vardą Discord su boto paskyra:

```bash
npm install
cp .env.example .env
# įrašykite Token, CLIENT_ID, GUILD_ID į .env failą
npm start
```

## 6 ŽINGSNIS — Naudojimas

Bet kuriame kanale, kur botas turi teises, parašykite:

```
/rolemenu
```

Pasirodys žinutė su mygtukais — paspaudus mygtuką, vartotojas iškart gauna (arba netenka) rolės.

---

## TICKET SISTEMA

Botas taip pat turi ticket (pagalbos bilietų) sistemą.

### Papildomi Variables Railway'uje

Be `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, pridėkite dar:

| Kintamasis | Ką įrašyti |
|---|---|
| `TICKET_CATEGORY_ID` | Kategorijos, kurioje kursis ticket kanalai, ID |
| `SUPPORT_ROLE_ID` | Rolės (pvz. "Staff"), kuri matys ticket'us, ID |
| `LOG_CHANNEL_ID` | Kanalo, kur bus siunčiami uždarytų ticket'ų transkriptai, ID |
| `MIGRATION_CATEGORY_ID` | (nebūtina) atskira kategorija migracijos bilietams |

Visus ID gaunate taip pat, kaip aprašyta 1 žingsnyje aukščiau (Kūrėjo režimas → dešiniu pelės klavišu → "Kopijuoti ID"), tik vietoj rolės spauskite ant kategorijos ar kanalo.

### Boto teisės

Developer Portal → OAuth2 → URL Generator scope'uose/permissions papildomai reikės:
**Manage Channels** (kad botas galėtų kurti/trinti ticket kanalus).

Jei botas jau pridėtas be šios teisės — sugeneruokite nuorodą iš naujo su šia teise pažymėta ir pakvieskite dar kartą (nereikia trinti boto, Discord tik atnaujins teises).

### Naudojimas

Administratorius kanale parašo:

```
/setupticket
```
→ išsiunčia žinutę su kategorijų sąrašu (dropdown meniu), iš kurio vartotojai renkasi ir sukuria sau ticket kanalą.

```
/setupmigracija
```
→ išsiunčia žinutę su mygtuku "Pradėti migraciją" naujiems žaidėjams.

Kiekviename sukurtame ticket/migracijos kanale bus mygtukas **"🔒 Uždaryti Bilietą"** — paspaudus jį, kanalas ištrinamas, o pokalbio transkriptas (.txt failas) išsiunčiamas į `LOG_CHANNEL_ID` nurodytą kanalą.

### Dažniausios ticket sistemos klaidos

| Problema | Sprendimas |
|---|---|
| "Klaida: Railway Variables nepilnai užpildyti" | Patikrinkite, ar `TICKET_CATEGORY_ID` ir `SUPPORT_ROLE_ID` įrašyti Railway Variables |
| "Bilietų kategorija nerasta" | ID priklauso ne tam serveriui — nukopijuokite iš naujo tame serveryje, kur naudojate komandą |
| Botas negali sukurti kanalo | Įsitikinkite, kad pridėjote **Manage Channels** teisę (žr. aukščiau) |

---

### Dažniausios klaidos

| Problema | Sprendimas |
|---|---|
| `/rolemenu` nerodo pasiūlymo rašant | Su `GUILD_ID` turėtų atsirasti iškart; be jo — palaukite iki 1 val. |
| Paspaudus mygtuką rašo "Nepavyko priskirti rolės" | Boto rolė serverio sąraše turi būti aukščiau už dalinamą rolę (žr. 2 žingsnį) |
| Botas rodosi offline | Patikrinkite, ar `DISCORD_TOKEN` teisingas ir ar Railway/serveris tikrai veikia (žr. logs) |
