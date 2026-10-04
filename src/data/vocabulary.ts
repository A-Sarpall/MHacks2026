export interface VocabEntry {
  label: string;
  prompt: string;
  category: string;
}

type Raw = string | [label: string, prompt: string];

const RAW: Record<string, Raw[]> = {
  "people & body": [
    "person", "baby", "child", ["hand", "a person's hand"], ["foot", "a person's foot"], ["arm", "a person's arm"],
    ["leg", "a person's leg"], ["knee", "a person's knee"], ["head", "a person's head"], ["face", "a person's face"],
    ["eye", "a person's eye"], ["ear", "a person's ear"], ["mouth", "a person's mouth"], ["teeth", "a person's teeth"],
    ["finger", "a person's finger"], ["back", "a person's back"], ["stomach", "a person's belly"], ["hair", "a person's hair"],
    ["shoulder", "a person's shoulder"], ["neck", "a person's neck"],
  ],
  "pets & animals": [
    "dog", "cat", "bird", "fish", ["fish tank", "a fish tank aquarium"], "rabbit", "hamster", "horse", "cow",
    "squirrel", "duck", ["pet bowl", "a pet food bowl"], ["dog leash", "a dog leash"], ["pet bed", "a pet bed"],
    ["bird feeder", "a bird feeder"],
  ],
  fruit: [
    "apple", "banana", "orange", "grapes", "strawberry", "blueberries", "pear", "peach", "plum", "cherries",
    "watermelon", "melon", "pineapple", "mango", "kiwi", "lemon", "lime", "avocado", "grapefruit", "raspberries",
    "coconut", ["fruit bowl", "a bowl of fruit"],
  ],
  vegetables: [
    "tomato", "carrot", "potato", "onion", "garlic", "broccoli", "cauliflower", "lettuce", "cucumber", "bell pepper",
    "corn", "mushroom", "celery", "peas", "green beans", "zucchini", "spinach", "cabbage", "sweet potato", "pumpkin",
    "asparagus",
  ],
  "food & meals": [
    "bread", ["toast", "a slice of toast"], "sandwich", "soup", "salad", "pizza", "pasta", "rice", "noodles",
    ["eggs", "eggs"], ["cereal", "a bowl of cereal"], ["oatmeal", "a bowl of oatmeal"], "pancakes", "waffle",
    "cheese", "butter", "yogurt", ["chicken", "cooked chicken"], ["meat", "a piece of cooked meat"], ["fish", "a cooked fish fillet on a plate"],
    "hamburger", "hot dog", "sausage", "bacon", "taco", "burrito", "sushi", "cake", "cupcake", "cookie", "donut",
    "muffin", "bagel", "croissant", "pie", ["ice cream", "a bowl of ice cream"], ["chocolate", "a bar of chocolate"],
    "candy", ["chips", "a bag of potato chips"], "crackers", "popcorn", "nuts", ["peanut butter", "a jar of peanut butter"],
    ["jam", "a jar of jam"], "honey", ["ketchup", "a bottle of ketchup"], ["mustard", "a bottle of mustard"],
    ["salt", "a salt shaker"], ["pepper", "a pepper grinder"], ["sugar", "a bowl of sugar"], ["snack bar", "a granola bar"],
    ["baby food", "a jar of baby food"], ["leftovers", "a food container with leftovers"], ["meal", "a plate of food"],
  ],
  drinks: [
    ["water", "a glass of water"], ["coffee", "a cup of coffee"], ["tea", "a cup of tea"], ["milk", "a glass of milk"],
    ["juice", "a glass of juice"], ["orange juice", "a carton of orange juice"], ["soda", "a can of soda"],
    ["beer", "a bottle of beer"], ["wine", "a glass of wine"], ["smoothie", "a smoothie"], ["hot chocolate", "a mug of hot chocolate"],
    ["water bottle", "a reusable water bottle"], ["can", "a drink can"],
    ["juice box", "a juice box"], ["sports drink", "a bottle of sports drink"], ["protein shake", "a protein shake bottle"],
    ["tea bag", "a tea bag"],
  ],
  "kitchen & dining": [
    "cup", "mug", "glass", ["wine glass", "a wine glass"], "plate", "bowl", "fork", "knife", "spoon", "chopsticks",
    ["straw", "a drinking straw"], "napkin", ["placemat", "a placemat"], "tray", ["pot", "a cooking pot"],
    ["pan", "a frying pan"], "kettle", "teapot", ["coffee maker", "a coffee machine"], "toaster", "microwave",
    ["oven", "a kitchen oven"], ["stove", "a kitchen stove"], "fridge", "freezer", "dishwasher", ["sink", "a kitchen sink"],
    ["tap", "a water faucet"], "blender", ["mixer", "a kitchen stand mixer"], ["cutting board", "a chopping board"],
    "spatula", ["ladle", "a soup ladle"], ["whisk", "a kitchen whisk"], ["tongs", "kitchen tongs"],
    ["can opener", "a can opener"], ["bottle opener", "a bottle opener"], ["peeler", "a vegetable peeler"],
    ["grater", "a cheese grater"], "colander", ["measuring cup", "a measuring cup"], ["oven mitt", "an oven mitt"],
    ["dish towel", "a kitchen dish towel"], ["dish soap", "a bottle of dish soap"], ["sponge", "a kitchen sponge"],
    ["lunch box", "a lunch box"], ["food container", "a plastic food container"], ["jar", "a glass jar"],
    ["thermos", "a thermos flask"], ["travel mug", "a travel coffee mug"], ["sippy cup", "a sippy cup"],
    ["baby bottle", "a baby bottle"], ["aluminum foil", "a roll of aluminum foil"], ["plastic wrap", "a roll of plastic wrap"],
    ["paper towel", "a roll of paper towels"], ["trash can", "a trash can"], ["recycling bin", "a recycling bin"],
    ["kitchen timer", "a kitchen timer"], ["rolling pin", "a rolling pin"], ["baking tray", "a baking tray"],
    ["dining table", "a dining table"], ["high chair", "a baby high chair"],
  ],
  "bathroom & hygiene": [
    "toothbrush", "toothpaste", ["electric toothbrush", "an electric toothbrush"], ["dental floss", "dental floss"],
    ["mouthwash", "a bottle of mouthwash"], ["denture case", "a denture case"], ["dentures", "false teeth dentures"],
    "soap", ["hand soap", "a hand soap pump bottle"], "shampoo", "conditioner", ["body wash", "a bottle of body wash"],
    "towel", ["hand towel", "a hand towel"], ["washcloth", "a washcloth"], ["bath mat", "a bath mat"],
    ["toilet", "a toilet"], ["toilet paper", "a roll of toilet paper"], ["bathtub", "a bathtub"], ["shower", "a shower"],
    ["shower head", "a shower head"], ["bathroom sink", "a bathroom sink"], ["mirror", "a mirror"], "comb",
    ["hairbrush", "a hairbrush"], ["hair dryer", "a hair dryer"], ["razor", "a razor"], ["electric shaver", "an electric shaver"],
    ["shaving cream", "a can of shaving cream"], "deodorant", ["lotion", "a bottle of lotion"], ["sunscreen", "a bottle of sunscreen"],
    ["lip balm", "a lip balm"], ["makeup", "makeup cosmetics"], ["lipstick", "a lipstick"], ["perfume", "a perfume bottle"],
    ["nail clippers", "nail clippers"], ["tweezers", "tweezers"], ["cotton swabs", "cotton swabs"], ["tissues", "a box of tissues"],
    ["diaper", "a diaper"], ["wipes", "a pack of wet wipes"], ["incontinence pad", "an incontinence pad"],
    ["bath sponge", "a bath sponge"], ["shower cap", "a shower cap"], ["laundry hamper", "a laundry hamper"],
  ],
  "health & medical": [
    ["pills", "some pills"], ["pill bottle", "a prescription pill bottle"], ["pill organizer", "a weekly pill organizer box"],
    ["medicine", "a box of medicine"], ["liquid medicine", "a bottle of liquid medicine with a dosing cup"],
    ["inhaler", "an asthma inhaler"], ["nebulizer", "a nebulizer machine"], ["insulin pen", "an insulin pen"],
    ["glucose meter", "a blood glucose meter"], ["blood pressure monitor", "a blood pressure cuff monitor"],
    "thermometer", ["pulse oximeter", "a fingertip pulse oximeter"], ["syringe", "a syringe"], ["bandage", "a bandage"],
    ["band-aid", "an adhesive bandage"], ["ice pack", "an ice pack"], ["heating pad", "a heating pad"],
    ["eye drops", "a bottle of eye drops"], ["hearing aid", "a hearing aid"], ["hearing aid batteries", "hearing aid batteries"],
    ["glasses case", "a glasses case"], ["contact lens case", "a contact lens case"], ["walker", "a walking frame walker"],
    ["rollator", "a rollator walker with wheels and a seat"], ["cane", "a walking cane"], ["crutches", "a pair of crutches"],
    ["wheelchair", "a wheelchair"], ["shower chair", "a shower chair"], ["grab bar", "a bathroom grab bar"],
    ["raised toilet seat", "a raised toilet seat"], ["commode", "a bedside commode chair"], ["bedpan", "a bedpan"],
    ["urinal bottle", "a urinal bottle"], ["hospital bed", "a hospital bed"], ["bed rail", "a bed safety rail"],
    ["oxygen tank", "an oxygen tank"], ["oxygen tubing", "nasal oxygen tubing"], ["CPAP machine", "a CPAP machine with mask"],
    ["knee brace", "a knee brace"], ["wrist brace", "a wrist brace"], ["arm sling", "an arm sling"],
    ["neck brace", "a neck brace"], ["compression socks", "compression socks"], ["reacher grabber", "a reacher grabber tool"],
    ["sock aid", "a sock aid"], ["long shoehorn", "a long shoehorn"], ["weighted utensils", "weighted adaptive utensils"],
    ["plate guard", "a plate with a plate guard"], ["medical alert button", "a medical alert pendant button"],
    ["first aid kit", "a first aid kit"], ["face mask", "a medical face mask"], ["gloves", "disposable medical gloves"],
    ["hand sanitizer", "a bottle of hand sanitizer"], ["cast", "a plaster cast on an arm"], ["stethoscope", "a stethoscope"],
    ["communication board", "a communication board with pictures"], ["tablet stand", "a tablet stand"],
  ],
  "clothes & accessories": [
    "shirt", ["t-shirt", "a t-shirt"], "sweater", ["hoodie", "a hoodie sweatshirt"], "jacket", "coat", ["raincoat", "a raincoat"],
    "pants", "jeans", "shorts", "skirt", "dress", ["pajamas", "pajamas"], ["bathrobe", "a bathrobe"], ["underwear", "underwear"],
    "bra", "socks", "shoes", ["sneakers", "sneakers"], "boots", "slippers", "sandals", "hat", ["cap", "a baseball cap"],
    ["beanie", "a knit beanie hat"], "scarf", "gloves", ["mittens", "mittens"], "belt", "tie", ["suit", "a suit jacket"],
    ["vest", "a vest"], ["apron", "an apron"], ["uniform", "a uniform"], ["swimsuit", "a swimsuit"],
    ["glasses", "a pair of glasses"], ["sunglasses", "a pair of sunglasses"], ["reading glasses", "reading glasses"],
    "watch", ["ring", "a finger ring"], "necklace", "bracelet", "earrings", ["purse", "a purse"], ["handbag", "a handbag"],
    "backpack", "wallet", ["umbrella", "an umbrella"], ["hair clip", "a hair clip"], ["hair tie", "a hair tie"],
    ["shoelaces", "shoelaces"], ["hanger", "a clothes hanger"],
  ],
  "personal items": [
    ["phone", "a smartphone"], ["phone charger", "a phone charger cable"], ["charging cable", "a USB charging cable"],
    ["power bank", "a portable power bank"], ["keys", "a set of keys"], ["key ring", "a keychain"], ["ID card", "an ID card"],
    ["credit card", "a credit card"], ["money", "paper money cash"], ["coins", "coins"], ["tablet", "a tablet computer"],
    ["e-reader", "an e-reader"], ["headphones", "headphones"], ["earbuds", "wireless earbuds"], ["smartwatch", "a smartwatch"],
    ["photo", "a printed photograph"], ["photo frame", "a photo frame"], ["letter", "a letter in an envelope"],
    ["envelope", "an envelope"], ["package", "a cardboard package"], ["shopping bag", "a shopping bag"], ["tote bag", "a tote bag"],
    ["suitcase", "a suitcase"], ["hand cream", "a tube of hand cream"],
    ["rosary", "a rosary"], ["prayer book", "a prayer book"],
  ],
  "furniture & home": [
    "chair", ["armchair", "an armchair"], ["recliner", "a recliner chair"], ["sofa", "a sofa couch"], ["bed", "a bed"],
    "pillow", ["cushion", "a cushion"], "blanket", ["sheets", "bed sheets"], ["duvet", "a duvet comforter"],
    ["mattress", "a mattress"], "table", ["coffee table", "a coffee table"], ["side table", "a bedside table"], "desk",
    "stool", "bench", ["shelf", "a shelf"], ["bookshelf", "a bookshelf"], ["dresser", "a chest of drawers"],
    ["wardrobe", "a wardrobe closet"], ["drawer", "a drawer"], ["cabinet", "a cabinet"], "door", ["door handle", "a door handle"],
    "window", ["curtains", "curtains"], ["blinds", "window blinds"], ["rug", "a rug"], ["carpet", "carpet floor"],
    "lamp", ["ceiling light", "a ceiling light"], ["light switch", "a light switch"], ["power outlet", "a wall power outlet"],
    ["extension cord", "an extension cord"], ["clock", "a wall clock"], ["alarm clock", "an alarm clock"], ["calendar", "a wall calendar"],
    ["plant", "a potted plant"], ["flowers", "flowers in a vase"], "vase", ["candle", "a candle"], ["picture", "a framed picture on a wall"],
    ["stairs", "stairs"], ["stair lift", "a stair lift chair"], ["ramp", "a wheelchair ramp"], ["radiator", "a radiator"],
    ["fan", "an electric fan"], ["heater", "a space heater"], ["air conditioner", "an air conditioner"],
    ["thermostat", "a thermostat"], ["smoke alarm", "a smoke alarm"], ["doorbell", "a doorbell"], ["mailbox", "a mailbox"],
    ["coat rack", "a coat rack"], ["shoe rack", "a shoe rack"], ["baby crib", "a baby crib"], ["laundry basket", "a laundry basket"],
    ["basket", "a basket"], ["box", "a cardboard box"], ["storage bin", "a plastic storage bin"],
  ],
  "electronics & media": [
    ["tv", "a television"], ["remote", "a TV remote control"], ["laptop", "a laptop computer"], ["computer", "a desktop computer"],
    ["computer mouse", "a computer mouse"], ["keyboard", "a computer keyboard"], ["monitor", "a computer monitor"],
    ["printer", "a printer"], ["speaker", "a speaker"], ["smart speaker", "a smart speaker"], ["radio", "a radio"],
    ["game controller", "a video game controller"], ["game console", "a video game console"], ["camera", "a camera"],
    ["landline phone", "a landline telephone"], ["cordless phone", "a cordless home phone"], ["router", "a wifi router"],
    ["batteries", "batteries"], ["flashlight", "a flashlight"], ["light bulb", "a light bulb"], ["record player", "a record player"],
    ["CD", "a CD disc"], ["DVD", "a DVD case"], ["webcam", "a webcam"], ["microphone", "a microphone"],
    ["baby monitor", "a baby monitor"], ["calculator", "a calculator"],
  ],
  "cleaning & laundry": [
    "broom", "mop", "bucket", ["dustpan", "a dustpan"], ["vacuum cleaner", "a vacuum cleaner"], ["duster", "a feather duster"],
    ["spray bottle", "a cleaning spray bottle"], ["cleaning cloth", "a cleaning cloth"], ["rubber gloves", "rubber cleaning gloves"],
    ["laundry detergent", "a bottle of laundry detergent"], ["washing machine", "a washing machine"], ["dryer", "a clothes dryer"],
    ["iron", "a clothes iron"], ["ironing board", "an ironing board"], ["clothespins", "clothespins"], ["drying rack", "a clothes drying rack"],
    ["trash bag", "a trash bag"], ["scrub brush", "a scrub brush"], ["toilet brush", "a toilet brush"], ["plunger", "a plunger"],
  ],
  "tools & household": [
    "hammer", "screwdriver", "wrench", "pliers", "scissors", ["tape", "a roll of tape"], ["tape measure", "a tape measure"],
    ["ladder", "a ladder"], ["step stool", "a step stool"], ["drill", "a power drill"], ["saw", "a hand saw"], ["nails", "nails"],
    ["screws", "screws"], ["toolbox", "a toolbox"], ["glue", "a glue bottle"], ["rope", "a rope"], ["padlock", "a padlock"],
    ["sewing kit", "a sewing kit"], ["needle and thread", "a needle and thread"], ["knitting", "knitting needles and yarn"],
    ["yarn", "a ball of yarn"], ["fire extinguisher", "a fire extinguisher"], ["matches", "a box of matches"], ["lighter", "a lighter"],
  ],
  "office & reading": [
    "book", ["notebook", "a notebook"], ["paper", "a sheet of paper"], ["newspaper", "a newspaper"], ["magazine", "a magazine"],
    ["pen", "a pen"], ["pencil", "a pencil"], ["marker", "a marker pen"], ["crayons", "crayons"], ["highlighter", "a highlighter"],
    ["eraser", "an eraser"], ["ruler", "a ruler"], ["stapler", "a stapler"], ["paper clip", "a paper clip"],
    ["sticky notes", "sticky notes"], ["folder", "a folder"], ["binder", "a ring binder"], ["clipboard", "a clipboard"],
    ["whiteboard", "a whiteboard"], ["planner", "a planner diary"], ["bookmark", "a bookmark"], ["magnifying glass", "a magnifying glass"],
    ["bill", "a paper bill"], ["mail", "a pile of mail"], ["map", "a map"], ["Bible", "a Bible"], ["puzzle book", "a crossword puzzle book"],
  ],
  "leisure & play": [
    ["ball", "a ball"], ["soccer ball", "a soccer ball"], ["basketball", "a basketball"], ["tennis ball", "a tennis ball"],
    ["baseball bat", "a baseball bat"], ["tennis racket", "a tennis racket"], ["golf club", "a golf club"], ["bicycle", "a bicycle"],
    ["skateboard", "a skateboard"], ["playing cards", "playing cards"], ["board game", "a board game"], ["chess", "a chess board"],
    ["dice", "dice"], ["jigsaw puzzle", "a jigsaw puzzle"], ["toy", "a toy"], ["teddy bear", "a teddy bear"], ["doll", "a doll"],
    ["toy car", "a toy car"], ["building blocks", "toy building blocks"], ["balloon", "a balloon"], ["kite", "a kite"],
    ["guitar", "a guitar"], ["piano", "a piano"], ["music keyboard", "an electronic music keyboard"], ["violin", "a violin"],
    ["drum", "a drum"], ["harmonica", "a harmonica"], ["paintbrush", "a paintbrush"], ["paint", "paint"], ["coloring book", "a coloring book"],
    ["tripod", "a camera tripod"], ["yoga mat", "a yoga mat"], ["dumbbell", "a dumbbell"], ["exercise bike", "an exercise bike"],
    ["treadmill", "a treadmill"], ["swimming goggles", "swimming goggles"], ["fishing rod", "a fishing rod"],
    ["gift", "a wrapped gift"], ["birthday cake", "a birthday cake"], ["Christmas tree", "a Christmas tree"],
  ],
  "outdoors & travel": [
    ["car", "a car"], ["bus", "a bus"], ["truck", "a truck"], ["van", "a van"], ["taxi", "a taxi"], ["train", "a train"],
    ["airplane", "an airplane"], ["boat", "a boat"], ["motorcycle", "a motorcycle"], ["scooter", "a mobility scooter"],
    ["stroller", "a baby stroller"], ["car seat", "a baby car seat"], ["seat belt", "a seat belt"], ["steering wheel", "a steering wheel"],
    ["parking sign", "a parking sign"], ["traffic light", "a traffic light"], ["stop sign", "a stop sign"], ["bus stop", "a bus stop sign"],
    ["bench", "a park bench"], ["tree", "a tree"], ["flower", "a flower"], ["grass", "grass lawn"], ["garden", "a vegetable garden"],
    ["watering can", "a watering can"], ["garden hose", "a garden hose"], ["shovel", "a shovel"], ["rake", "a rake"],
    ["lawn mower", "a lawn mower"], ["wheelbarrow", "a wheelbarrow"], ["flower pot", "a flower pot"], ["fence", "a fence"],
    ["gate", "a garden gate"], ["front door", "a front door of a house"], ["garage door", "a garage door"], ["sun", "the sun in the sky"],
    ["rain", "rain falling"], ["snow", "snow on the ground"], ["sky", "the sky with clouds"], ["sunhat", "a sun hat"],
    ["picnic basket", "a picnic basket"], ["tent", "a tent"], ["cooler", "a picnic cooler box"], ["grill", "a barbecue grill"],
    ["shopping cart", "a shopping cart"], ["ticket", "a ticket"], ["passport", "a passport"],
  ],
};

export const PARENT_LABELS: Record<string, string> = {
  "travel mug": "mug",
  "sippy cup": "cup",
  "wine glass": "glass",
  "prayer book": "book",
  Bible: "book",
  "puzzle book": "book",
  "coloring book": "book",
  "reading glasses": "glasses",
  sneakers: "shoes",
  "electric toothbrush": "toothbrush",
  "key ring": "keys",
  "landline phone": "phone",
  "cordless phone": "phone",
  smartwatch: "watch",
  "charging cable": "phone charger",
  coins: "money",
  "hand soap": "soap",
  "hand towel": "towel",
  "dish towel": "towel",
  "bathroom sink": "sink",
  "shower head": "shower",
  "electric shaver": "razor",
  armchair: "chair",
  "coffee table": "table",
  "side table": "table",
  "dining table": "table",
  "alarm clock": "clock",
  "smart speaker": "speaker",
  "front door": "door",
  flower: "flowers",
  handbag: "purse",
  cap: "hat",
  beanie: "hat",
  sunhat: "hat",
  raincoat: "coat",
  "t-shirt": "shirt",
  jeans: "pants",
  "soccer ball": "ball",
  basketball: "ball",
  "tennis ball": "ball",
  "birthday cake": "cake",
  "orange juice": "juice",
  "juice box": "juice",
  rollator: "walker",
};

export const GENERIC_WORDS: Record<string, string> = {
  "people & body": "person",
  "pets & animals": "animal",
  fruit: "fruit",
  vegetables: "vegetable",
  "food & meals": "food",
  drinks: "drink",
  "clothes & accessories": "clothes",
  "furniture & home": "furniture",
  "electronics & media": "electronics",
  "tools & household": "tool",
};

export const PROMPT_TEMPLATES = [
  "a photo of {}.",
  "a close-up photo of {}.",
  "a photo of {} at home.",
  "{}",
];

function withArticle(label: string): string {
  if (label.endsWith("s") && !/(ss|us|glass)$/.test(label)) return label;
  return /^[aeiou]/i.test(label) ? `an ${label}` : `a ${label}`;
}

export const VOCABULARY: VocabEntry[] = Object.entries(RAW).flatMap(([category, items]) =>
  items.map((item) =>
    typeof item === "string"
      ? { label: item, prompt: withArticle(item), category }
      : { label: item[0], prompt: item[1], category }
  )
);

export const VOCAB_CATEGORIES = Object.keys(RAW);

export function promptsFor(entry: VocabEntry): string[] {
  return PROMPT_TEMPLATES.map((t) => t.replace("{}", entry.prompt));
}
