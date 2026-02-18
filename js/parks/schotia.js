const PARK_SCHOTIA = {
  id: "schotia",
  name: "Schotia Private Game Reserve",
  subtitle: "Big 5 — Afternoon & Night Safari",
  icon: "🦁",
  species: [
    // ══ BIG 5 ══
    { id: "lion", r: "Common", t: "Schotia's lions are frequently seen on the evening drive. The smaller reserve means very reliable sightings." },
    { id: "african-elephant", r: "Common", t: "Move between Schotia and greater Addo area. Best seen near waterholes in the afternoon." },
    { id: "white-rhinoceros", r: "Uncommon", t: "Schotia has white rhino (not black like Addo). Favor open grassland. Rangers know their grazing spots." },
    { id: "cape-buffalo", r: "Common", t: "Relatively small, habituated herds. Often found in dense bush near water at dusk." },
    { id: "leopard", r: "Rare", t: "Present but seldom seen — thick valley bushveld provides excellent cover. Night drive with spotlights offers best chance." },
    // ══ LARGE MAMMALS ══
    { id: "hippopotamus", r: "Common", t: "A Schotia highlight — excellent viewing at the dam near the lodge from elevated vantage points." },
    { id: "south-african-giraffe", r: "Common", t: "Signature Schotia species — Addo has no giraffe. Seen on virtually every drive, browsing acacia and spekboomveld." },
    { id: "burchells-zebra", r: "Common", t: "Abundant throughout. Often in mixed herds with wildebeest. Very relaxed around vehicles." },
    { id: "blue-wildebeest", r: "Common", t: "Good numbers on open grasslands, often alongside zebra. Not present in Addo proper." },
    { id: "warthog", r: "Common", t: "Seen on every daytime drive. Very relaxed, often trotting with tails up. Piglets common in spring." },
    // ══ ANTELOPE ══
    { id: "greater-kudu", r: "Common", t: "Abundant in the valley bushveld. Males with large spiralling horns frequently spotted browsing at thicket edges." },
    { id: "eland", r: "Uncommon", t: "Present but shyer than other species. Morning drive offers better chances in cooler hours." },
    { id: "gemsbok", r: "Uncommon", t: "Less common than at Addo. Favors drier, open sections of the reserve." },
    { id: "red-hartebeest", r: "Common", t: "Found on open plains in herds of 5-15. Watch for their distinctive rocking-horse gallop." },
    { id: "springbok", r: "Common", t: "Abundant on open grassland. Often seen pronking in cooler morning hours." },
    { id: "impala", r: "Common", t: "Very abundant — seen on every drive. Alarm calls often betray lion or leopard presence nearby." },
    { id: "bushbuck", r: "Common", t: "Frequently seen in thicker bush and riverine areas. More easily spotted in early morning." },
    { id: "common-duiker", r: "Uncommon", t: "Solitary and shy. Best seen on the night drive when they freeze in the spotlight." },
    { id: "steenbok", r: "Uncommon", t: "Small and easily overlooked. Often seen as pairs — one of the few monogamous antelope." },
    { id: "waterbuck", r: "Uncommon", t: "Found near dams and water features. Recognizable by the white ring on the rump. Not present at Addo." },
    { id: "nyala", r: "Uncommon", t: "Present in thicker bush areas. Males strikingly different from females. Best seen near water in late afternoon." },
    // ══ PREDATORS ══
    { id: "spotted-hyena", r: "Uncommon", t: "Sometimes heard calling at night during boma dinner. Night drive provides the best viewing opportunity." },
    { id: "brown-hyena", r: "Rare", t: "Occasionally spotted on night drives. Much rarer than spotted hyena — a real Eastern Cape specialty." },
    { id: "black-backed-jackal", r: "Common", t: "Frequently seen at dusk and on night drives. Bold around the boma area, great close-up sightings." },
    { id: "bat-eared-fox", r: "Uncommon", t: "Found in drier, open grassland areas. Primarily nocturnal — the night drive spotlight often picks them up." },
    { id: "african-wildcat", r: "Rare", t: "Occasionally seen on the night drive. Longer legs and reddish-brown ear backing distinguish from domestic cats." },
    { id: "caracal", r: "Rare", t: "Present but strictly nocturnal. Sightings are a major event — count yourself very lucky." },
    { id: "honey-badger", r: "Rare", t: "Seldom seen due to wide-ranging, mostly nocturnal habits. Sightings are rare but do occur." },
    { id: "small-grey-mongoose", r: "Common", t: "Commonly seen darting across roads during daytime drives." },
    { id: "small-spotted-genet", r: "Uncommon", t: "Nocturnal. Sometimes spotted near the lodge and boma area at night." },
    // ══ PRIMATES ══
    { id: "vervet-monkey", r: "Common", t: "Abundant around the lodge and boma area. Entertaining but keep belongings secured during dinner." },
    { id: "chacma-baboon", r: "Common", t: "Troops regularly encountered on game drives. Watch for interactions between troops and predators." },
    // ══ SMALL MAMMALS & NOCTURNAL ══
    { id: "aardvark-antbear", r: "Rare", t: "One of Schotia's most prized nocturnal sightings. Winter months (Jun-Aug) improve odds on the night drive." },
    { id: "porcupine", r: "Uncommon", t: "Seen regularly on the night drive. Quills are unmistakable in the spotlight." },
    { id: "rock-hyrax-dassie", r: "Common", t: "Often seen basking on rocks near the lodge in the afternoon sun." },
    { id: "scrub-hare", r: "Common", t: "Commonly seen on the night drive, freezing in the spotlight." },
    // ══ BIRDS — RAPTORS ══
    { id: "martial-eagle", r: "Uncommon", t: "Schotia's open areas provide good raptor viewing. Ask your ranger to scan treetops and thermals." },
    { id: "secretary-bird", r: "Uncommon", t: "Seen striding across the open plains. A charismatic species declining across Africa." },
    { id: "african-fish-eagle", r: "Uncommon", t: "Found near the reserve's dams. Iconic call often heard during drives near water." },
    { id: "jackal-buzzard", r: "Common", t: "Commonly seen soaring over the reserve. Endemic to southern Africa." },
    { id: "pale-chanting-goshawk", r: "Common", t: "Often perched on roadside poles and fence posts scanning for prey." },
    // ══ BIRDS — GROUND BIRDS ══
    { id: "common-ostrich", r: "Common", t: "Frequently encountered on the open grasslands. Males with black plumage are particularly striking." },
    { id: "blue-crane", r: "Uncommon", t: "South Africa's national bird. Found in open grassland areas of the reserve." },
    { id: "helmeted-guineafowl", r: "Common", t: "Noisy flocks seen throughout the reserve. Often scatter across the road ahead of vehicles." },
    { id: "southern-ground-hornbill", r: "Rare", t: "Occasionally seen in groups walking through grassland. Critically endangered — a genuine highlight." },
    { id: "kori-bustard", r: "Uncommon", t: "World's heaviest flying bird. Sometimes seen on the open plains." },
    // ══ BIRDS — WATERBIRDS ══
    { id: "egyptian-goose", r: "Common", t: "Common around the dams and water features throughout the reserve." },
    { id: "grey-heron", r: "Common", t: "Patient hunter at the reserve's dams. Often seen standing motionless in shallow water." },
    { id: "hadada-ibis", r: "Common", t: "Loud 'ha-da-da' call heard at dawn and dusk around the lodge." },
    { id: "cattle-egret", r: "Common", t: "Almost always seen near buffalo and elephant herds, feeding on disturbed insects." },
    { id: "hamerkop", r: "Uncommon", t: "Found near dams. Look for their enormous domed nests in nearby trees." },
    { id: "blacksmith-lapwing", r: "Common", t: "Common near water. Metallic 'tink-tink' call is unmistakable." },
    // ══ BIRDS — PASSERINES & OTHER ══
    { id: "fork-tailed-drongo", r: "Common", t: "Expert mimic often seen following larger animals to catch disturbed insects." },
    { id: "cape-starling", r: "Common", t: "Glossy iridescent plumage. Common around the lodge and boma area." },
    { id: "bokmakierie", r: "Common", t: "Pairs duet together — listen for 'bok-makierie' calls in the bush." },
    { id: "african-hoopoe", r: "Common", t: "Unmistakable cinnamon bird with black-and-white wings. Probes ground for grubs." },
    { id: "crowned-hornbill", r: "Uncommon", t: "Found in wooded sections. Distinctive red bill and casque." },
    // ══ REPTILES ══
    { id: "leopard-tortoise", r: "Common", t: "Frequently seen crossing roads, especially after rain. One of the 'Little 5'." },
    { id: "white-throated-monitor", r: "Uncommon", t: "Found near the dams. Can be impressively large, basking on rocks in warmer months." },
    { id: "puff-adder", r: "Uncommon", t: "Occasionally seen on roads, especially in summer. Rely on camouflage, so watch your step." },
    { id: "southern-rock-agama", r: "Common", t: "Males with bright blue heads commonly seen basking on rocks around the lodge." },
  ]
};
PARKS.push(PARK_SCHOTIA);
