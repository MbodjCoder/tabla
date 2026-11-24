// Carte type d'un grand restaurant de Dakar (Almadies) : produits de la mer, classiques sénégalais,
// quelques valeurs sûres internationales, jus locaux, cocktails et desserts.
// Modèle par défaut d'un nouvel établissement : prix indicatifs en FCFA, marqués « à vérifier ».
// Le français est la langue source ; les autres langues sont pré-traduites.
import type { LangueClient } from "@/lib/langues";

export type TraductionArticle = { nom: string; description?: string };
export type TraductionsArticle = Partial<
  Record<Exclude<LangueClient, "fr">, TraductionArticle>
>;

export type ArticleModele = {
  nom: string;
  description?: string;
  prix: number;
  photo: string; // image fournie avec le modèle (public/images/carte, crédits dans CREDITS.md)
  traductions: TraductionsArticle;
};

export type CategorieModele = {
  nom: string;
  horaires?: string;
  traductions: Partial<Record<Exclude<LangueClient, "fr">, { nom: string }>>;
  articles: ArticleModele[];
};

const photo = (fichier: string) => `/images/carte/${fichier}.webp`;

// ─────────────────────────────────────────────────────────────
// Plats
// ─────────────────────────────────────────────────────────────

const ENTREES: CategorieModele = {
  nom: "Entrées",
  traductions: {
    en: { nom: "Starters" },
    wo: { nom: "Njëkk" },
    es: { nom: "Entrantes" },
    it: { nom: "Antipasti" },
    de: { nom: "Vorspeisen" },
    pt: { nom: "Entradas" },
    ar: { nom: "المقبلات" },
  },
  articles: [
    {
      nom: "Huîtres du Saloum (×6)",
      description: "Sur glace, citron et vinaigre à l'échalote",
      prix: 7500,
      photo: photo("huitres"),
      traductions: {
        en: {
          nom: "Saloum oysters (×6)",
          description: "On ice, lemon and shallot vinegar",
        },
        wo: { nom: "Yoxos Saalum (×6)" },
        es: {
          nom: "Ostras del Saloum (×6)",
          description: "Sobre hielo, limón y vinagre de chalota",
        },
        it: {
          nom: "Ostriche del Saloum (×6)",
          description: "Su ghiaccio, limone e aceto allo scalogno",
        },
        de: {
          nom: "Saloum-Austern (×6)",
          description: "Auf Eis, Zitrone und Schalottenessig",
        },
        pt: {
          nom: "Ostras do Saloum (×6)",
          description: "Sobre gelo, limão e vinagre de chalota",
        },
        ar: {
          nom: "محار السالوم (×6)",
          description: "على الثلج، ليمون وخل بالكراث",
        },
      },
    },
    {
      nom: "Carpaccio de thiof",
      description: "Citron vert, gingembre, huile d'olive et piment doux",
      prix: 8000,
      photo: photo("carpaccio"),
      traductions: {
        en: {
          nom: "Thiof carpaccio",
          description: "Lime, ginger, olive oil and mild chilli",
        },
        wo: { nom: "Carpaccio thiof" },
        es: {
          nom: "Carpaccio de thiof",
          description: "Lima, jengibre, aceite de oliva y guindilla suave",
        },
        it: {
          nom: "Carpaccio di thiof",
          description: "Lime, zenzero, olio d'oliva e peperoncino dolce",
        },
        de: {
          nom: "Thiof-Carpaccio",
          description: "Limette, Ingwer, Olivenöl und milde Chili",
        },
        pt: {
          nom: "Carpaccio de thiof",
          description: "Lima, gengibre, azeite e malagueta suave",
        },
        ar: {
          nom: "كارباتشيو التيوف",
          description: "ليمون أخضر، زنجبيل، زيت زيتون وفلفل خفيف",
        },
      },
    },
    {
      nom: "Pastels de thiof",
      description: "Chaussons croustillants au poisson, sauce tomate pimentée",
      prix: 5000,
      photo: photo("pastels"),
      traductions: {
        en: {
          nom: "Thiof pastels",
          description: "Crispy fish turnovers, spicy tomato sauce",
        },
        wo: { nom: "Pastel thiof" },
        es: {
          nom: "Pastels de thiof",
          description:
            "Empanadillas crujientes de pescado, salsa de tomate picante",
        },
        it: {
          nom: "Pastels di thiof",
          description:
            "Fagottini croccanti di pesce, salsa di pomodoro piccante",
        },
        de: {
          nom: "Thiof-Pastels",
          description: "Knusprige Fischtaschen, scharfe Tomatensauce",
        },
        pt: {
          nom: "Pastéis de thiof",
          description: "Pastéis estaladiços de peixe, molho de tomate picante",
        },
        ar: {
          nom: "باستيل التيوف",
          description: "فطائر مقرمشة بالسمك، صلصة طماطم حارة",
        },
      },
    },
  ],
};

const MER: CategorieModele = {
  nom: "Poissons & fruits de mer",
  traductions: {
    en: { nom: "Fish & seafood" },
    wo: { nom: "Jën ak li ci géej" },
    es: { nom: "Pescados y mariscos" },
    it: { nom: "Pesce e frutti di mare" },
    de: { nom: "Fisch & Meeresfrüchte" },
    pt: { nom: "Peixe e marisco" },
    ar: { nom: "الأسماك والمأكولات البحرية" },
  },
  articles: [
    {
      nom: "Langouste grillée",
      description: "Beurre citronné, frites maison",
      prix: 25000,
      photo: photo("langouste"),
      traductions: {
        en: {
          nom: "Grilled spiny lobster",
          description: "Lemon butter, homemade fries",
        },
        wo: { nom: "Langust bu ñu lakk" },
        es: {
          nom: "Langosta a la parrilla",
          description: "Mantequilla al limón, patatas fritas caseras",
        },
        it: {
          nom: "Aragosta alla griglia",
          description: "Burro al limone, patatine fatte in casa",
        },
        de: {
          nom: "Gegrillte Languste",
          description: "Zitronenbutter, hausgemachte Pommes",
        },
        pt: {
          nom: "Lagosta grelhada",
          description: "Manteiga de limão, batatas fritas caseiras",
        },
        ar: {
          nom: "لوبستر مشوي",
          description: "زبدة بالليمون، بطاطا مقلية منزلية",
        },
      },
    },
    {
      nom: "Gambas grillées à l'ail",
      description: "Persil, citron, riz parfumé",
      prix: 15000,
      photo: photo("gambas"),
      traductions: {
        en: {
          nom: "Garlic grilled prawns",
          description: "Parsley, lemon, fragrant rice",
        },
        wo: { nom: "Sipax yu ñu lakk ak laaj" },
        es: {
          nom: "Gambas a la plancha con ajo",
          description: "Perejil, limón, arroz aromático",
        },
        it: {
          nom: "Gamberoni alla griglia all'aglio",
          description: "Prezzemolo, limone, riso profumato",
        },
        de: {
          nom: "Gegrillte Garnelen mit Knoblauch",
          description: "Petersilie, Zitrone, Duftreis",
        },
        pt: {
          nom: "Gambas grelhadas com alho",
          description: "Salsa, limão, arroz perfumado",
        },
        ar: {
          nom: "جمبري مشوي بالثوم",
          description: "بقدونس، ليمون، أرز معطر",
        },
      },
    },
    {
      nom: "Thiof grillé entier",
      description: "Pêche du jour, légumes croquants, sauce créole",
      prix: 14000,
      photo: photo("thiof"),
      traductions: {
        en: {
          nom: "Whole grilled thiof",
          description: "Catch of the day, crisp vegetables, Creole sauce",
        },
        wo: { nom: "Thiof bu ñu lakk" },
        es: {
          nom: "Thiof entero a la parrilla",
          description: "Pesca del día, verduras crujientes, salsa criolla",
        },
        it: {
          nom: "Thiof intero alla griglia",
          description: "Pescato del giorno, verdure croccanti, salsa creola",
        },
        de: {
          nom: "Ganzer gegrillter Thiof",
          description: "Tagesfang, knackiges Gemüse, kreolische Sauce",
        },
        pt: {
          nom: "Thiof inteiro grelhado",
          description: "Pesca do dia, legumes estaladiços, molho crioulo",
        },
        ar: {
          nom: "تيوف مشوي كامل",
          description: "صيد اليوم، خضار مقرمشة، صلصة كريولية",
        },
      },
    },
  ],
};

const SENEGALAIS: CategorieModele = {
  nom: "Plats sénégalais",
  horaires: "12h – 23h",
  traductions: {
    en: { nom: "Senegalese dishes" },
    wo: { nom: "Lekk yu Senegaal" },
    es: { nom: "Platos senegaleses" },
    it: { nom: "Piatti senegalesi" },
    de: { nom: "Senegalesische Gerichte" },
    pt: { nom: "Pratos senegaleses" },
    ar: { nom: "أطباق سنغالية" },
  },
  articles: [
    {
      nom: "Thiéboudienne royal",
      description: "Thiof, gambas, légumes du marché, riz rouge",
      prix: 9000,
      photo: photo("thieboudienne"),
      traductions: {
        en: {
          nom: "Royal thieboudienne",
          description: "Thiof, prawns, market vegetables, red rice",
        },
        wo: { nom: "Ceebu jën buur" },
        es: {
          nom: "Thieboudienne real",
          description: "Thiof, gambas, verduras del mercado, arroz rojo",
        },
        it: {
          nom: "Thieboudienne reale",
          description: "Thiof, gamberoni, verdure di mercato, riso rosso",
        },
        de: {
          nom: "Königliches Thieboudienne",
          description: "Thiof, Garnelen, Marktgemüse, roter Reis",
        },
        pt: {
          nom: "Thieboudienne real",
          description: "Thiof, gambas, legumes do mercado, arroz vermelho",
        },
        ar: {
          nom: "تشيبوجين ملكي",
          description: "تيوف، جمبري، خضار السوق، أرز أحمر",
        },
      },
    },
    {
      nom: "Yassa poulet fermier",
      description: "Oignons confits au citron, olives, riz blanc",
      prix: 8500,
      photo: photo("yassa"),
      traductions: {
        en: {
          nom: "Free-range chicken yassa",
          description: "Lemon-confit onions, olives, white rice",
        },
        wo: { nom: "Yaasa ginaar" },
        es: {
          nom: "Yassa de pollo de corral",
          description: "Cebollas confitadas al limón, aceitunas, arroz blanco",
        },
        it: {
          nom: "Yassa di pollo ruspante",
          description: "Cipolle confit al limone, olive, riso bianco",
        },
        de: {
          nom: "Yassa vom Freilandhuhn",
          description: "Zitronen-Zwiebelconfit, Oliven, weißer Reis",
        },
        pt: {
          nom: "Yassa de frango do campo",
          description: "Cebolas confitadas com limão, azeitonas, arroz branco",
        },
        ar: {
          nom: "ياسا الدجاج البلدي",
          description: "بصل مكرمل بالليمون، زيتون، أرز أبيض",
        },
      },
    },
    {
      nom: "Mafé d'agneau",
      description: "Sauce onctueuse à l'arachide, patate douce, riz",
      prix: 9500,
      photo: photo("mafe"),
      traductions: {
        en: {
          nom: "Lamb mafé",
          description: "Creamy peanut sauce, sweet potato, rice",
        },
        wo: { nom: "Mafe xar" },
        es: {
          nom: "Mafé de cordero",
          description: "Salsa cremosa de cacahuete, boniato, arroz",
        },
        it: {
          nom: "Mafé d'agnello",
          description: "Salsa cremosa di arachidi, patata dolce, riso",
        },
        de: {
          nom: "Lamm-Mafé",
          description: "Cremige Erdnusssauce, Süßkartoffel, Reis",
        },
        pt: {
          nom: "Mafé de borrego",
          description: "Molho cremoso de amendoim, batata-doce, arroz",
        },
        ar: {
          nom: "مافيه لحم الضأن",
          description: "صلصة الفول السوداني الكريمية، بطاطا حلوة، أرز",
        },
      },
    },
    {
      nom: "Dibi d'agneau",
      description: "Grillé au feu de bois, oignons, moutarde, pain",
      prix: 9000,
      photo: photo("dibi"),
      traductions: {
        en: {
          nom: "Lamb dibi",
          description: "Wood-fire grilled, onions, mustard, bread",
        },
        wo: { nom: "Dibi xar" },
        es: {
          nom: "Dibi de cordero",
          description: "A la brasa, cebolla, mostaza, pan",
        },
        it: {
          nom: "Dibi d'agnello",
          description: "Alla brace, cipolle, senape, pane",
        },
        de: {
          nom: "Lamm-Dibi",
          description: "Über Holzfeuer gegrillt, Zwiebeln, Senf, Brot",
        },
        pt: {
          nom: "Dibi de borrego",
          description: "Grelhado na brasa, cebola, mostarda, pão",
        },
        ar: {
          nom: "ديبي لحم الضأن",
          description: "مشوي على الحطب، بصل، خردل، خبز",
        },
      },
    },
  ],
};

const VIANDES: CategorieModele = {
  nom: "Viandes & grillades",
  traductions: {
    en: { nom: "Meat & grills" },
    wo: { nom: "Yàpp ak lakk" },
    es: { nom: "Carnes y parrilla" },
    it: { nom: "Carni e grigliate" },
    de: { nom: "Fleisch & Grill" },
    pt: { nom: "Carnes e grelhados" },
    ar: { nom: "اللحوم والمشويات" },
  },
  articles: [
    {
      nom: "Filet de bœuf",
      description: "Jus corsé, légumes rôtis, purée maison",
      prix: 16000,
      photo: photo("filet"),
      traductions: {
        en: {
          nom: "Beef tenderloin",
          description: "Rich jus, roasted vegetables, homemade mash",
        },
        wo: { nom: "Filet nag" },
        es: {
          nom: "Solomillo de ternera",
          description: "Jugo intenso, verduras asadas, puré casero",
        },
        it: {
          nom: "Filetto di manzo",
          description: "Fondo ristretto, verdure arrosto, purè fatto in casa",
        },
        de: {
          nom: "Rinderfilet",
          description: "Kräftige Jus, Ofengemüse, hausgemachtes Püree",
        },
        pt: {
          nom: "Lombo de vaca",
          description: "Molho intenso, legumes assados, puré caseiro",
        },
        ar: {
          nom: "فيليه لحم البقر",
          description: "صلصة مركزة، خضار مشوية، بوريه منزلي",
        },
      },
    },
    {
      nom: "Burger Teranga",
      description: "Bœuf, cheddar, oignons au yassa, frites maison",
      prix: 8000,
      photo: photo("burger"),
      traductions: {
        en: {
          nom: "Teranga burger",
          description: "Beef, cheddar, yassa onions, homemade fries",
        },
        wo: { nom: "Burger Teranga" },
        es: {
          nom: "Hamburguesa Teranga",
          description: "Ternera, cheddar, cebolla yassa, patatas caseras",
        },
        it: {
          nom: "Burger Teranga",
          description: "Manzo, cheddar, cipolle yassa, patatine fatte in casa",
        },
        de: {
          nom: "Teranga-Burger",
          description: "Rind, Cheddar, Yassa-Zwiebeln, hausgemachte Pommes",
        },
        pt: {
          nom: "Hambúrguer Teranga",
          description: "Vaca, cheddar, cebola yassa, batatas caseiras",
        },
        ar: {
          nom: "برغر تيرانغا",
          description: "لحم بقر، شيدر، بصل الياسا، بطاطا منزلية",
        },
      },
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// Boissons
// ─────────────────────────────────────────────────────────────

const JUS_LOCAUX: CategorieModele = {
  nom: "Jus locaux",
  traductions: {
    en: { nom: "Local juices" },
    wo: { nom: "Jus yu fii" },
    es: { nom: "Zumos locales" },
    it: { nom: "Succhi locali" },
    de: { nom: "Lokale Säfte" },
    pt: { nom: "Sumos locais" },
    ar: { nom: "عصائر محلية" },
  },
  articles: [
    {
      nom: "Bissap maison",
      description: "Fleurs d'hibiscus, menthe fraîche",
      prix: 2500,
      photo: photo("bissap"),
      traductions: {
        en: {
          nom: "Homemade bissap",
          description: "Hibiscus flowers, fresh mint",
        },
        wo: { nom: "Bissap" },
        es: {
          nom: "Bissap casero",
          description: "Flor de hibisco, menta fresca",
        },
        it: {
          nom: "Bissap della casa",
          description: "Fiori di ibisco, menta fresca",
        },
        de: {
          nom: "Hausgemachter Bissap",
          description: "Hibiskusblüten, frische Minze",
        },
        pt: {
          nom: "Bissap caseiro",
          description: "Flores de hibisco, hortelã fresca",
        },
        ar: { nom: "بيساب منزلي", description: "زهور الكركديه، نعناع طازج" },
      },
    },
    {
      nom: "Jus de bouye",
      description: "Pain de singe (fruit du baobab), onctueux",
      prix: 2500,
      photo: photo("bouye"),
      traductions: {
        en: { nom: "Bouye juice", description: "Creamy baobab fruit drink" },
        wo: { nom: "Bouye" },
        es: { nom: "Zumo de bouye", description: "Fruto del baobab, cremoso" },
        it: {
          nom: "Succo di bouye",
          description: "Frutto del baobab, cremoso",
        },
        de: { nom: "Bouye-Saft", description: "Cremiger Baobab-Fruchtsaft" },
        pt: {
          nom: "Sumo de bouye",
          description: "Fruto do embondeiro, cremoso",
        },
        ar: { nom: "عصير البوي", description: "ثمرة الباوباب، كريمي" },
      },
    },
    {
      nom: "Carotte-gingembre",
      description: "Pressé minute, citron vert",
      prix: 3000,
      photo: photo("carotte-gingembre"),
      traductions: {
        en: { nom: "Carrot & ginger", description: "Freshly pressed, lime" },
        wo: { nom: "Karot ak jinjeer" },
        es: {
          nom: "Zanahoria y jengibre",
          description: "Recién exprimido, lima",
        },
        it: {
          nom: "Carota e zenzero",
          description: "Spremuto al momento, lime",
        },
        de: { nom: "Karotte-Ingwer", description: "Frisch gepresst, Limette" },
        pt: {
          nom: "Cenoura e gengibre",
          description: "Espremido na hora, lima",
        },
        ar: { nom: "جزر وزنجبيل", description: "معصور طازجًا، ليمون أخضر" },
      },
    },
  ],
};

const COCKTAILS: CategorieModele = {
  nom: "Cocktails & boissons",
  traductions: {
    en: { nom: "Cocktails & drinks" },
    wo: { nom: "Koktéel ak naan" },
    es: { nom: "Cócteles y bebidas" },
    it: { nom: "Cocktail e bevande" },
    de: { nom: "Cocktails & Getränke" },
    pt: { nom: "Cocktails e bebidas" },
    ar: { nom: "الكوكتيلات والمشروبات" },
  },
  articles: [
    {
      nom: "Cocktail Almadies",
      description: "Sans alcool : mangue, passion, grenadine",
      prix: 5000,
      photo: photo("cocktail-almadies"),
      traductions: {
        en: {
          nom: "Almadies cocktail",
          description: "Alcohol-free: mango, passion fruit, grenadine",
        },
        wo: { nom: "Koktéel Almadies" },
        es: {
          nom: "Cóctel Almadies",
          description: "Sin alcohol: mango, maracuyá, granadina",
        },
        it: {
          nom: "Cocktail Almadies",
          description: "Analcolico: mango, maracuja, granatina",
        },
        de: {
          nom: "Almadies-Cocktail",
          description: "Alkoholfrei: Mango, Maracuja, Grenadine",
        },
        pt: {
          nom: "Cocktail Almadies",
          description: "Sem álcool: manga, maracujá, groselha",
        },
        ar: {
          nom: "كوكتيل ألماديز",
          description: "بدون كحول: مانجو، باشن فروت، رمان",
        },
      },
    },
    {
      nom: "Mojito bissap",
      description: "Rhum, bissap, menthe, citron vert",
      prix: 6500,
      photo: photo("mojito-bissap"),
      traductions: {
        en: { nom: "Bissap mojito", description: "Rum, bissap, mint, lime" },
        wo: { nom: "Mojito bissap" },
        es: {
          nom: "Mojito de bissap",
          description: "Ron, bissap, menta, lima",
        },
        it: {
          nom: "Mojito al bissap",
          description: "Rum, bissap, menta, lime",
        },
        de: {
          nom: "Bissap-Mojito",
          description: "Rum, Bissap, Minze, Limette",
        },
        pt: {
          nom: "Mojito de bissap",
          description: "Rum, bissap, hortelã, lima",
        },
        ar: {
          nom: "موهيتو البيساب",
          description: "رم، بيساب، نعناع، ليمون أخضر",
        },
      },
    },
    {
      nom: "Bière Gazelle",
      description: "Bière blonde du Sénégal, 63 cl",
      prix: 2500,
      photo: photo("biere"),
      traductions: {
        en: { nom: "Gazelle beer", description: "Senegalese lager, 63 cl" },
        wo: { nom: "Biir Gazelle" },
        es: { nom: "Cerveza Gazelle", description: "Rubia senegalesa, 63 cl" },
        it: { nom: "Birra Gazelle", description: "Bionda senegalese, 63 cl" },
        de: {
          nom: "Gazelle-Bier",
          description: "Senegalesisches Helles, 63 cl",
        },
        pt: { nom: "Cerveja Gazelle", description: "Loira do Senegal, 63 cl" },
        ar: { nom: "بيرة غازيل", description: "بيرة سنغالية خفيفة، 63 سل" },
      },
    },
    {
      nom: "Verre de vin",
      description: "Rouge ou blanc, sélection de la maison",
      prix: 5000,
      photo: photo("vin"),
      traductions: {
        en: {
          nom: "Glass of wine",
          description: "Red or white, house selection",
        },
        wo: { nom: "Kaas biiñ" },
        es: {
          nom: "Copa de vino",
          description: "Tinto o blanco, selección de la casa",
        },
        it: {
          nom: "Calice di vino",
          description: "Rosso o bianco, selezione della casa",
        },
        de: { nom: "Glas Wein", description: "Rot oder weiß, Hausauswahl" },
        pt: {
          nom: "Copo de vinho",
          description: "Tinto ou branco, seleção da casa",
        },
        ar: { nom: "كأس نبيذ", description: "أحمر أو أبيض، اختيار المنزل" },
      },
    },
    {
      nom: "Café Touba",
      description: "Café épicé au poivre de Guinée",
      prix: 1500,
      photo: photo("cafe-touba"),
      traductions: {
        en: {
          nom: "Touba coffee",
          description: "Coffee spiced with Guinea pepper",
        },
        wo: { nom: "Kafe Tuubaa" },
        es: {
          nom: "Café Touba",
          description: "Café especiado con pimienta de Guinea",
        },
        it: {
          nom: "Caffè Touba",
          description: "Caffè speziato al pepe di Guinea",
        },
        de: {
          nom: "Touba-Kaffee",
          description: "Mit Guineapfeffer gewürzter Kaffee",
        },
        pt: { nom: "Café Touba", description: "Café com pimenta-da-guiné" },
        ar: { nom: "قهوة طوبى", description: "قهوة متبلة بفلفل غينيا" },
      },
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// Desserts
// ─────────────────────────────────────────────────────────────

const DESSERTS: CategorieModele = {
  nom: "Desserts",
  traductions: {
    en: { nom: "Desserts" },
    wo: { nom: "Dessert yi" },
    es: { nom: "Postres" },
    it: { nom: "Dolci" },
    de: { nom: "Desserts" },
    pt: { nom: "Sobremesas" },
    ar: { nom: "الحلويات" },
  },
  articles: [
    {
      nom: "Fondant au chocolat",
      description: "Cœur coulant, servi tiède",
      prix: 5000,
      photo: photo("fondant"),
      traductions: {
        en: {
          nom: "Chocolate fondant",
          description: "Molten centre, served warm",
        },
        wo: { nom: "Fondant chocolat" },
        es: {
          nom: "Coulant de chocolate",
          description: "Corazón fundente, servido templado",
        },
        it: {
          nom: "Tortino al cioccolato",
          description: "Cuore fondente, servito tiepido",
        },
        de: {
          nom: "Schokoladenküchlein",
          description: "Flüssiger Kern, lauwarm serviert",
        },
        pt: {
          nom: "Petit gâteau de chocolate",
          description: "Coração cremoso, servido morno",
        },
        ar: { nom: "فوندان الشوكولاتة", description: "قلب سائل، يقدم دافئًا" },
      },
    },
    {
      nom: "Crème brûlée",
      description: "Vanille de Madagascar, sucre caramélisé",
      prix: 4500,
      photo: photo("creme-brulee"),
      traductions: {
        en: {
          nom: "Crème brûlée",
          description: "Madagascar vanilla, caramelised sugar",
        },
        wo: { nom: "Crème brûlée" },
        es: {
          nom: "Crema catalana",
          description: "Vainilla de Madagascar, azúcar caramelizado",
        },
        it: {
          nom: "Crème brûlée",
          description: "Vaniglia del Madagascar, zucchero caramellato",
        },
        de: {
          nom: "Crème brûlée",
          description: "Madagaskar-Vanille, karamellisierter Zucker",
        },
        pt: {
          nom: "Crème brûlée",
          description: "Baunilha de Madagáscar, açúcar caramelizado",
        },
        ar: { nom: "كريم بروليه", description: "فانيليا مدغشقر، سكر مكرمل" },
      },
    },
    {
      nom: "Tarte aux fruits frais",
      description: "Pâte sablée, crème vanille, fruits de saison",
      prix: 4500,
      photo: photo("tarte-fruits"),
      traductions: {
        en: {
          nom: "Fresh fruit tart",
          description: "Shortcrust, vanilla cream, seasonal fruit",
        },
        wo: { nom: "Tart doom" },
        es: {
          nom: "Tarta de frutas frescas",
          description: "Masa sablé, crema de vainilla, fruta de temporada",
        },
        it: {
          nom: "Crostata di frutta fresca",
          description: "Frolla, crema alla vaniglia, frutta di stagione",
        },
        de: {
          nom: "Frische Obsttarte",
          description: "Mürbeteig, Vanillecreme, Früchte der Saison",
        },
        pt: {
          nom: "Tarte de fruta fresca",
          description: "Massa areada, creme de baunilha, fruta da época",
        },
        ar: {
          nom: "تارت الفواكه الطازجة",
          description: "عجينة هشة، كريمة الفانيليا، فواكه الموسم",
        },
      },
    },
    {
      nom: "Salade de fruits tropicaux",
      description: "Mangue, ananas, papaye, sirop de gingembre",
      prix: 4000,
      photo: photo("salade-fruits"),
      traductions: {
        en: {
          nom: "Tropical fruit salad",
          description: "Mango, pineapple, papaya, ginger syrup",
        },
        wo: { nom: "Salaat doom" },
        es: {
          nom: "Macedonia tropical",
          description: "Mango, piña, papaya, sirope de jengibre",
        },
        it: {
          nom: "Macedonia tropicale",
          description: "Mango, ananas, papaya, sciroppo allo zenzero",
        },
        de: {
          nom: "Tropischer Obstsalat",
          description: "Mango, Ananas, Papaya, Ingwersirup",
        },
        pt: {
          nom: "Salada de frutas tropicais",
          description: "Manga, ananás, papaia, xarope de gengibre",
        },
        ar: {
          nom: "سلطة فواكه استوائية",
          description: "مانجو، أناناس، بابايا، شراب الزنجبيل",
        },
      },
    },
    {
      nom: "Glace coco",
      description: "Servie dans sa noix, perles de fruits",
      prix: 3500,
      photo: photo("glace-coco"),
      traductions: {
        en: {
          nom: "Coconut ice cream",
          description: "Served in the shell, fruit pearls",
        },
        wo: { nom: "Glaas koko" },
        es: {
          nom: "Helado de coco",
          description: "Servido en su cáscara, perlas de fruta",
        },
        it: {
          nom: "Gelato al cocco",
          description: "Servito nel guscio, perle di frutta",
        },
        de: {
          nom: "Kokoseis",
          description: "In der Nussschale serviert, Fruchtperlen",
        },
        pt: {
          nom: "Gelado de coco",
          description: "Servido na casca, pérolas de fruta",
        },
        ar: {
          nom: "آيس كريم جوز الهند",
          description: "يقدم في قشرته، لآلئ الفاكهة",
        },
      },
    },
    {
      nom: "Thiakry à la crème",
      description: "Semoule de mil, lait caillé vanillé, muscade",
      prix: 3500,
      photo: photo("thiakry"),
      traductions: {
        en: {
          nom: "Creamy thiakry",
          description: "Millet couscous, vanilla curd, nutmeg",
        },
        wo: { nom: "Cakri" },
        es: {
          nom: "Thiakry cremoso",
          description: "Sémola de mijo, cuajada de vainilla, nuez moscada",
        },
        it: {
          nom: "Thiakry cremoso",
          description: "Semola di miglio, cagliata alla vaniglia, noce moscata",
        },
        de: {
          nom: "Cremiges Thiakry",
          description: "Hirsegrieß, Vanille-Dickmilch, Muskat",
        },
        pt: {
          nom: "Thiakry cremoso",
          description:
            "Sêmola de milho-miúdo, coalhada de baunilha, noz-moscada",
        },
        ar: {
          nom: "تشاكري بالكريمة",
          description: "سميد الدخن، لبن رائب بالفانيليا، جوزة الطيب",
        },
      },
    },
  ],
};

/** Carte proposée à un nouvel établissement, à ajuster par le gérant. */
export function catalogueModele(): CategorieModele[] {
  // Les plus belles photos d'abord : la mer, puis les classiques sénégalais ; les entrées après
  return [MER, SENEGALAIS, VIANDES, ENTREES, JUS_LOCAUX, COCKTAILS, DESSERTS];
}
