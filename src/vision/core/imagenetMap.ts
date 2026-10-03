const PLACES = new Set([
  "restaurant", "library", "bookshop", "bookstore", "barbershop", "bakery", "butcher shop", "confectionery",
  "grocery store", "shoe shop", "tobacco shop", "toyshop", "boathouse", "cinema", "home theater", "planetarium",
  "prison", "monastery", "church", "mosque", "palace", "patio", "greenhouse", "dock", "web site", "valley",
  "volcano", "seashore", "lakeside", "alp", "cliff", "coral reef", "geyser", "sandbar", "promontory", "beacon",
  "boathouse", "brass", "castle", "dome", "altar", "apiary", "bannister", "barn", "bell cote", "breakwater",
  "cliff dwelling", "fountain", "lumbermill", "maze", "megalith", "obelisk", "pier", "stupa", "suspension bridge",
  "steel arch bridge", "thatch", "triumphal arch", "viaduct", "water tower", "yurt", "mobile home", "shoji",
  "stage", "honeycomb", "window screen", "tile roof", "worm fence", "stone wall", "chainlink fence",
]);

const GENERAL: Record<string, string> = {
  tabby: "cat", "tiger cat": "cat", "persian cat": "cat", "siamese cat": "cat", "egyptian cat": "cat",
  quilt: "blanket", "studio couch": "sofa", "four-poster": "bed", "rocking chair": "chair", "folding chair": "chair",
  "barber chair": "chair", "dining table": "table", desk: "desk", "toilet seat": "toilet", washbasin: "sink",
  tub: "bathtub", "bath towel": "towel", "toilet tissue": "toilet paper", "shower curtain": "curtains",
  "window shade": "blinds", lampshade: "lamp", "table lamp": "lamp", "band aid": "band-aid", crutch: "crutches",
  "medicine chest": "cabinet", "running shoe": "shoes", loafer: "shoes", clog: "shoes", sandal: "sandals",
  "cowboy boot": "boots", jersey: "shirt", sweatshirt: "hoodie", cardigan: "sweater", jean: "jeans",
  miniskirt: "skirt", "trench coat": "coat", "fur coat": "coat", "lab coat": "coat", "pajama": "pajamas",
  sunglass: "sunglasses", sunglasses: "sunglasses", "coffee mug": "mug", "beer glass": "glass", goblet: "wine glass",
  "pop bottle": "bottle", "beer bottle": "beer", "wine bottle": "wine", "water jug": "jug", "mixing bowl": "bowl",
  "soup bowl": "bowl", "wooden spoon": "spoon", "frying pan": "pan", wok: "pan", "dutch oven": "pot",
  caldron: "pot", "crock pot": "pot", "espresso maker": "coffee maker", refrigerator: "fridge",
  "computer keyboard": "keyboard", mouse: "computer mouse", joystick: "game controller", "hand-held computer": "phone",
  "cellular telephone": "phone", "dial telephone": "landline phone", "pay-phone": "landline phone",
  "remote control": "remote", notebook: "laptop", "desktop computer": "computer", screen: "monitor",
  television: "tv", modem: "router", ipod: "music player", "face powder": "makeup", "hair spray": "hairspray",
  "granny smith": "apple", "head cabbage": "cabbage", ear: "corn", "french loaf": "bread", cheeseburger: "hamburger",
  hotdog: "hot dog", espresso: "coffee", "red wine": "wine", eggnog: "milk", "ice lolly": "ice cream",
  "plastic bag": "shopping bag", "paper towel": "paper towel", "pill bottle": "pill bottle", "water bottle": "water bottle",
  "teddy": "teddy bear", "rubber eraser": "eraser", "ballpoint": "pen", "fountain pen": "pen", "quill": "pen",
  "binder": "binder", "packet": "package", carton: "box", crate: "box", "ashcan": "trash can",
  "vacuum": "vacuum cleaner", "swab": "mop", "broom": "broom", "dishrag": "cleaning cloth", "iron": "iron",
  "wall clock": "clock", "analog clock": "clock", "digital clock": "clock", "digital watch": "watch",
  "stopwatch": "watch", "wallet": "wallet", "purse": "purse", "backpack": "backpack", "mailbag": "bag",
  "pot": "plant", "vase": "vase", "candle": "candle", "pillow": "pillow", "sleeping bag": "sleeping bag",
  "miniature poodle": "dog", "toy poodle": "dog", "standard poodle": "dog",
};

const DOG = /terrier|retriever|spaniel|hound|shepherd|poodle|collie|setter|pointer|mastiff|bulldog|schnauzer|pinscher|sheepdog|corgi|husky|malamute|chihuahua|\bpug\b|beagle|dachshund|labrador|boxer|dalmatian|pomeranian|samoyed|\bchow\b|great dane|saint bernard|newfoundland|papillon|maltese|shih-tzu|pekinese|basenji|whippet|greyhound|borzoi|vizsla|weimaraner|bloodhound|basset|kelpie|briard|komondor|kuvasz|schipperke|groenendael|malinois|bouvier|rottweiler|doberman|appenzeller|entlebucher|leonberg|keeshond|griffon|affenpinscher|eskimo dog|dingo|pembroke|cardigan welsh|lhasa|tibetan|japanese spaniel|blenheim|redbone|coonhound|foxhound|otterhound|saluki|deerhound|wolfhound|elkhound|ridgeback|kerry blue|bedlington|border collie|old english|shetland|kelpie|great pyrenees|bernese|brabancon/;

export function everydayLabel(imagenet: string): string | null {
  const l = imagenet.trim().toLowerCase();
  if (PLACES.has(l)) return null;
  if (GENERAL[l]) return GENERAL[l];
  if (DOG.test(l)) return "dog";
  return l;
}

export function cleanGuesses<T extends { label: string; score: number }>(guesses: T[]): T[] {
  const best = new Map<string, T>();
  for (const g of guesses) {
    const label = everydayLabel(g.label);
    if (!label) continue;
    const prev = best.get(label);
    if (prev) best.set(label, { ...prev, score: prev.score + g.score });
    else best.set(label, { ...g, label });
  }
  return [...best.values()].sort((a, b) => b.score - a.score);
}
