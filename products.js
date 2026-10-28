/* ============================================================
   OUD ROYALE: BUTIKKDATA

   Dette er den eneste filen du trenger å endre for å oppdatere
   kontaktinfo, priser, tekster og duftnoter. Alle sidene henter
   innholdet sitt herfra.
   ============================================================ */

const SHOP = {
  navn: "Oud Royale",
  epost: "post@oudroyale.no", // hit sendes bestillinger og meldinger
  instagram: "",              // f.eks. "oudroyale" (uten @). Tom = vises ikke
  telefon: "",                // f.eks. "+47 900 00 000". Tom = vises ikke
  orgnr: "",                  // organisasjonsnummer. Tom = vises ikke
  valuta: "kr"
};

/* familie: oud | amber | musk | krydret | frisk
   styrke:  1 (diskret) til 5 (kraftig)
   bruk:    hverdag | kveld | fest (én eller flere) */

const PRODUCTS = [
  {
    id: "emir",
    navn: "Emir",
    familie: "amber",
    pris: 1499,
    ml: 50,
    styrke: 5,
    bruk: ["kveld", "fest"],
    kort: "Varm amber med safran og et dypt drag av oud.",
    tekst: "Emir er duften for kveldene som betyr noe. Den åpner varmt og krydret, og legger seg som et mykt teppe av amber og oud som blir sittende lenge.",
    noter: { topp: ["Safran", "Kanel"], hjerte: ["Rose", "Labdanum"], bunn: ["Amber", "Oud"] }
  },
  {
    id: "royal-sapphire",
    navn: "Royal Sapphire",
    familie: "frisk",
    pris: 1299,
    ml: 50,
    styrke: 2,
    bruk: ["hverdag"],
    kort: "Kjølig og ren, med en myk bunn av ambra og musk.",
    tekst: "Royal Sapphire er den lyseste duften i kolleksjonen. Frisk sitrus og lavendel i åpningen, og en ren, myk avslutning som passer like godt på kontoret som på middag.",
    noter: { topp: ["Bergamott", "Grapefrukt"], hjerte: ["Lavendel", "Iris"], bunn: ["Ambra", "Hvit musk"] }
  },
  {
    id: "sultan-noir",
    navn: "Sultan Noir",
    familie: "krydret",
    pris: 1349,
    ml: 50,
    styrke: 4,
    bruk: ["kveld"],
    kort: "Mørk og krydret, med kardemomme, røkelse og oud.",
    tekst: "Sultan Noir starter med kardemomme og stjerneanis, før røkelsen tar over. Bunnen av oud og vanilje gjør den mørk uten å bli tung.",
    noter: { topp: ["Kardemomme", "Stjerneanis"], hjerte: ["Røkelse", "Patchouli"], bunn: ["Oud", "Vanilje"] }
  },
  {
    id: "majestic-oud",
    navn: "Majestic Oud",
    familie: "oud",
    pris: 1399,
    ml: 50,
    styrke: 4,
    bruk: ["kveld", "fest"],
    kort: "Klassisk oud med rose, lagt på sandeltre.",
    tekst: "Majestic Oud er bygget rundt den klassiske kombinasjonen av oud og rose. Sandeltre og amber runder den av, så den føles rik og rolig på samme tid.",
    noter: { topp: ["Bergamott", "Rosa pepper"], hjerte: ["Oud", "Rose"], bunn: ["Sandeltre", "Amber"] }
  },
  {
    id: "amir-al-oudh",
    navn: "Amir Al Oudh",
    familie: "krydret",
    pris: 1449,
    ml: 50,
    styrke: 5,
    bruk: ["fest"],
    kort: "Safran og stjerneanis over oud og lær.",
    tekst: "Amir Al Oudh er den mest krydrede duften vi har. Safran og stjerneanis gir en tydelig åpning, og oud, amber og lær holder den varm i timevis.",
    noter: { topp: ["Safran", "Stjerneanis"], hjerte: ["Oud", "Kardemomme"], bunn: ["Amber", "Lær"] }
  },
  {
    id: "supreme-musk",
    navn: "Supreme Musk",
    familie: "musk",
    pris: 1199,
    ml: 50,
    styrke: 2,
    bruk: ["hverdag", "kveld"],
    kort: "Ren, myk musk som sitter tett på huden.",
    tekst: "Supreme Musk er den rolige i samlingen. Hvit musk og iris gir et rent inntrykk, og kashmirtre og sandeltre gjør den varm nok til å bæres hele året.",
    noter: { topp: ["Pære", "Rosa pepper"], hjerte: ["Hvit musk", "Iris"], bunn: ["Kashmirtre", "Sandeltre"] }
  },
  {
    id: "desert-falcon",
    navn: "Desert Falcon",
    familie: "krydret",
    pris: 1199,
    ml: 50,
    styrke: 3,
    bruk: ["hverdag", "kveld"],
    kort: "Tørr og treaktig, med pepper, sedertre og lær.",
    tekst: "Desert Falcon er tørr og rett fram. Sort pepper og safran i toppen, sedertre og lær i midten, og en lett bunn av amber og oud.",
    noter: { topp: ["Sort pepper", "Safran"], hjerte: ["Sedertre", "Lær"], bunn: ["Amber", "Oud"] }
  },
  {
    id: "oud-sultan",
    navn: "Oud Sultan",
    familie: "oud",
    pris: 1299,
    ml: 50,
    styrke: 5,
    bruk: ["kveld", "fest"],
    kort: "Røykfylt oud med sedertre og røkelse.",
    tekst: "Oud Sultan er for deg som vil ha oud uten omveier. Røykfylt og treaktig fra første spray, med røkelse og musk som holder den sammen.",
    noter: { topp: ["Sort pepper", "Einer"], hjerte: ["Oud", "Sedertre"], bunn: ["Røkelse", "Musk"] }
  },
  {
    id: "prince-of-arabia",
    navn: "Prince of Arabia",
    familie: "amber",
    pris: 1249,
    ml: 50,
    styrke: 3,
    bruk: ["hverdag", "kveld"],
    kort: "Myk amber med mandarin, jasmin og tonkabønne.",
    tekst: "Prince of Arabia er den lettest tilgjengelige amberduften vår. Mandarin og kardemomme åpner, og tonkabønne og sandeltre gir en rund, litt søt avslutning.",
    noter: { topp: ["Mandarin", "Kardemomme"], hjerte: ["Jasmin", "Tonkabønne"], bunn: ["Amber", "Sandeltre"] }
  },
  {
    id: "royal-oud",
    navn: "Royal Oud",
    familie: "oud",
    pris: 1399,
    ml: 50,
    styrke: 4,
    bruk: ["kveld", "fest"],
    kort: "Gyllen oud med safran, rose og vanilje.",
    tekst: "Royal Oud er varmere og rundere enn de andre oud-duftene. Safran og honning i åpningen, oud og rose i hjertet, og en gyllen bunn av amber og vanilje.",
    noter: { topp: ["Safran", "Honning"], hjerte: ["Oud", "Rose"], bunn: ["Amber", "Vanilje"] }
  }
];

/* Disse fire vises som «Utvalgte dufter» på forsiden */
const FEATURED = ["emir", "royal-sapphire", "sultan-noir", "majestic-oud"];

const FAMILIES = {
  oud: "Oud",
  amber: "Amber",
  musk: "Musk",
  krydret: "Krydret",
  frisk: "Frisk"
};
