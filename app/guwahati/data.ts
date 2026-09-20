export type LocalItem = {
  name: string;
  description: string;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type Neighbourhood = {
  slug: string;
  name: string;
  coordinates: { latitude: number; longitude: number };
  placesRadiusMeters: number;
  intro: string;
  highlights: string[];
  bestFor: string;
  nearby: string;
  food: LocalItem[];
  hospitals: LocalItem[];
  attractions: LocalItem[];
  shopping: LocalItem[];
  transport: LocalItem[];
  faqs: FAQItem[];
};

export const NEIGHBOURHOODS: Neighbourhood[] = [
  {
    slug: "uzan-bazar",
    coordinates: { latitude: 26.1885, longitude: 91.7444 },
    placesRadiusMeters: 1800,
    name: "Uzan Bazar",
    intro: "Stay in one of central Guwahati's established riverfront neighbourhoods, close to the Brahmaputra, cultural attractions, local markets and everyday city conveniences.",
    highlights: ["Brahmaputra riverfront access", "Culture, cafés and local food", "Central Guwahati location"],
    bestFor: "travellers who want a central neighbourhood with a relaxed local feel and easy access to heritage and riverfront sights",
    nearby: "Dighalipukhuri, Panbazar, Ambari, Fancy Bazar and Guwahati city centre",
    food: [
      { name: "CAFE UZAN", description: "A café on MG Road in the Uzan Bazar/Latasil area, useful for a casual coffee or snack stop." },
      { name: "Breezeblock", description: "A restaurant in the Latasil–Uzan Bazar area for travellers looking for a sit-down meal nearby." },
      { name: "Uzan Bazar and Latasil eateries", description: "The surrounding streets have a mix of local restaurants, bakeries, tea stops and small cafés." },
    ],
    hospitals: [
      { name: "Wintrobe Hospital", description: "A hospital on GNB Road, Ambari, within the wider central Guwahati area." },
      { name: "Central Guwahati healthcare", description: "Uzan Bazar's central location gives access to clinics, pharmacies and hospitals across Ambari, Panbazar and nearby localities." },
    ],
    attractions: [
      { name: "Guwahati Planetarium", description: "Located on MG Road in Uzan Bazar and known for astronomy shows and science programmes." },
      { name: "Assam State Museum", description: "Near Dighalipukhuri, with collections covering the history, art and culture of Assam and Northeast India." },
      { name: "Dighalipukhuri", description: "A historic waterbody and central-city landmark close to the museum and Panbazar side of the city." },
      { name: "Umananda Island", description: "A Brahmaputra island and temple destination reached by boat/ferry from the central riverfront." },
    ],
    shopping: [
      { name: "Uzan Bazar Market", description: "A recognised municipal market for everyday local shopping and fresh produce." },
      { name: "Fancy Bazar", description: "A major traditional shopping district in central Guwahati, convenient from the Uzan Bazar side of the city." },
    ],
    transport: [
      { name: "Central city road access", description: "Uzan Bazar connects conveniently with Panbazar, Chandmari, Guwahati Club and the riverfront roads." },
      { name: "Railway access", description: "Guwahati Railway Station is in the nearby central-city area and can be reached by local road transport." },
      { name: "River transport", description: "Central ghats provide boat and ferry access for river journeys including trips towards Umananda Island." },
    ],
    faqs: [
      { question: "Is Uzan Bazar a convenient area for first-time visitors to Guwahati?", answer: "Yes. It is central and gives visitors practical access to the riverfront, museums, markets, Panbazar and other established parts of Guwahati." },
      { question: "What can I visit near Uzan Bazar?", answer: "Popular nearby options include Guwahati Planetarium, Assam State Museum, Dighalipukhuri and the central Brahmaputra riverfront." },
      { question: "Are food and daily-use shops available around Uzan Bazar?", answer: "Yes. The neighbourhood and nearby Latasil, Ambari and Panbazar areas have cafés, restaurants, markets, pharmacies and everyday shops." },
    ],
  },
  {
    slug: "paltan-bazar",
    coordinates: { latitude: 26.1813, longitude: 91.756 },
    placesRadiusMeters: 1800,
    name: "Paltan Bazar",
    intro: "Choose Paltan Bazar for a busy central location close to Guwahati Railway Station, intercity transport, markets, restaurants and many of the city's older commercial districts.",
    highlights: ["Railway station access", "Central transport links", "Restaurants, markets and shops"],
    bestFor: "short stays, train travellers, business visitors and travellers who value central transport connections",
    nearby: "Guwahati Railway Station, Panbazar, Fancy Bazar, Ulubari and Dighalipukhuri",
    food: [
      { name: "Paltan Bazar food streets", description: "The station-side streets contain numerous quick-service restaurants, vegetarian eateries, bakeries and tea shops." },
      { name: "Ulubari and Panbazar dining", description: "Neighbouring central areas expand the choice of cafés and restaurants within a short local journey." },
    ],
    hospitals: [
      { name: "ASG Eye Hospital Paltan Bazaar", description: "A specialist eye hospital serving Paltan Bazar and surrounding central Guwahati localities." },
      { name: "Central Guwahati hospitals", description: "Additional hospitals and clinics are available around Ulubari, Panbazar, Ambari and GS Road." },
    ],
    attractions: [
      { name: "Assam State Museum", description: "A major cultural museum near Dighalipukhuri, accessible from the Paltan Bazar and railway-station area." },
      { name: "Dighalipukhuri", description: "A well-known central landmark and historic waterbody near Panbazar and Ambari." },
      { name: "Umananda Island", description: "A river island and temple destination accessible by boat from the central Brahmaputra riverfront." },
      { name: "Guwahati Planetarium", description: "An astronomy and science attraction on MG Road in the nearby Uzan Bazar area." },
    ],
    shopping: [
      { name: "Paltan Bazar GMC Market", description: "A municipal market in Paltan Bazar for everyday shopping." },
      { name: "Fancy Bazar", description: "One of Guwahati's best-known traditional commercial districts for clothing, household goods and general shopping." },
    ],
    transport: [
      { name: "Guwahati Railway Station", description: "The neighbourhood's biggest transport advantage is its proximity to the city's main railway station." },
      { name: "City bus corridor", description: "Official city bus-stop routes include Paltan Bazar and the railway-station area on major east–west corridors." },
      { name: "Local taxis and app cabs", description: "Road transport is widely available for onward travel to GS Road, Maligaon, Six Mile and other parts of Guwahati." },
    ],
    faqs: [
      { question: "Is Paltan Bazar suitable for an overnight stay before a train?", answer: "It is one of the most practical central areas for travellers who want to stay close to Guwahati Railway Station." },
      { question: "Is Paltan Bazar good for sightseeing?", answer: "Its main advantage is connectivity. Central attractions such as Dighalipukhuri, Assam State Museum, the riverfront and Uzan Bazar are accessible from here." },
      { question: "Can I find markets and restaurants around Paltan Bazar?", answer: "Yes. Paltan Bazar is a busy commercial area with local eateries and shopping, while Fancy Bazar and Panbazar add many more options nearby." },
    ],
  },
  {
    slug: "ganeshguri",
    coordinates: { latitude: 26.1397, longitude: 91.7895 },
    placesRadiusMeters: 1800,
    name: "Ganeshguri",
    intro: "Stay around Ganeshguri for a practical base near Dispur and GS Road, with strong road connectivity, shopping, restaurants, healthcare and access to eastern Guwahati.",
    highlights: ["Dispur and GS Road access", "Shopping and dining", "Strong city connections"],
    bestFor: "business travellers, families, medical visitors and longer city stays",
    nearby: "Dispur, Christian Basti, Six Mile, Beltola and GS Road",
    food: [
      { name: "McDonald's Ganeshguri", description: "A familiar quick-service option on GS Road in the Ganeshguri/Dispur area." },
      { name: "GS Road dining", description: "The Ganeshguri–Christian Basti corridor has a broad mix of restaurants, cafés, bakeries and casual dining." },
    ],
    hospitals: [
      { name: "Dispur Hospital area", description: "Ganeshguri has access to healthcare services around the Dispur Hospital campus and nearby medical facilities." },
      { name: "GS Road healthcare corridor", description: "Hospitals, diagnostic centres, pharmacies and specialist clinics are distributed along GS Road and nearby Dispur." },
    ],
    attractions: [
      { name: "Assam State Zoo cum Botanical Garden", description: "A major family attraction in central-eastern Guwahati with wildlife, greenery and botanical areas." },
      { name: "Srimanta Sankardev Kalakshetra", description: "A major cultural complex in the Panjabari side of Guwahati showcasing Assamese heritage and performing arts." },
      { name: "Basistha Temple", description: "A historic temple destination in southeast Guwahati, suitable for a half-day local outing from the GS Road side." },
    ],
    shopping: [
      { name: "Ganeshguri GMC Market", description: "A recognised municipal market serving the locality." },
      { name: "GS Road retail", description: "Ganeshguri connects directly to one of Guwahati's busiest retail corridors, with malls, branded stores and everyday shopping." },
    ],
    transport: [
      { name: "Ganeshguri bus stops", description: "Official city bus routes include stops around Kar Bhawan and the Ganeshguri/Dispur corridor." },
      { name: "GS Road", description: "The main arterial road links Ganeshguri with central Guwahati, Six Mile, Khanapara and other eastern areas." },
      { name: "Local taxis and app cabs", description: "Useful for trips to the railway station, airport, hospitals and tourist attractions across the city." },
    ],
    faqs: [
      { question: "Why stay in Ganeshguri?", answer: "Ganeshguri is useful for travellers who need access to Dispur, GS Road, shopping, hospitals and the eastern side of Guwahati." },
      { question: "Is Ganeshguri convenient for families?", answer: "Yes. The area has everyday shopping, food options, healthcare and road connections, making it practical for family and longer stays." },
      { question: "What tourist places can I visit from Ganeshguri?", answer: "Assam State Zoo, Srimanta Sankardev Kalakshetra and Basistha Temple are useful options from this side of the city." },
    ],
  },
  {
    slug: "maligaon",
    coordinates: { latitude: 26.1608, longitude: 91.6879 },
    placesRadiusMeters: 1800,
    name: "Maligaon",
    intro: "Maligaon is a useful western Guwahati base near the railway corridor, Adabari and roads leading towards Kamakhya, Jalukbari, Pandu and the airport side of the city.",
    highlights: ["Railway connectivity", "Kamakhya-side access", "Western Guwahati transport links"],
    bestFor: "rail travellers, pilgrims visiting Kamakhya and visitors with plans in western Guwahati",
    nearby: "Jalukbari, Adabari, Pandu, Kamakhya and Bharalumukh",
    food: [
      { name: "Keshabbharali", description: "A café option around Maligaon Chariali." },
      { name: "Mast Punjabi Dhaba", description: "A Punjabi restaurant around Maligaon Chariali for a casual meal." },
      { name: "Maligaon Chariali eateries", description: "The commercial junction has local restaurants, tea stalls and quick-service food options." },
    ],
    hospitals: [
      { name: "Swagat Super Speciality Hospital", description: "A multi-speciality hospital at Gate No. 3, Maligaon, with emergency and diagnostic services." },
      { name: "Local clinics and pharmacies", description: "Maligaon's main commercial roads have additional clinics, pharmacies and diagnostic services for routine needs." },
    ],
    attractions: [
      { name: "Kamakhya Temple", description: "One of Guwahati's most important pilgrimage destinations, located on Nilachal Hill and especially convenient from western Guwahati." },
      { name: "Brahmaputra and Pandu side", description: "Western Guwahati provides access towards Pandu and river-facing parts of the city." },
      { name: "Central Guwahati attractions", description: "Fancy Bazar, the central riverfront and Umananda connections can be reached by travelling east from Maligaon." },
    ],
    shopping: [
      { name: "Maligaon Chariali", description: "A busy local commercial junction with everyday retail, pharmacies and services." },
      { name: "Adabari area", description: "A nearby transport and commercial zone with additional shopping and daily-use services." },
    ],
    transport: [
      { name: "Maligaon Chariali bus stop", description: "Official city bus routes include Maligaon Chariali on the major Adabari–Khanapara corridor." },
      { name: "Railway corridor", description: "Maligaon is closely associated with Guwahati's railway network and is convenient for the Kamakhya railway side." },
      { name: "Western road connections", description: "Road links run towards Jalukbari, the airport corridor, central Guwahati and GS Road." },
    ],
    faqs: [
      { question: "Is Maligaon a good area for visiting Kamakhya Temple?", answer: "Yes. Maligaon is on the western side of Guwahati and is a practical base for reaching the Kamakhya area." },
      { question: "Is Maligaon connected to central Guwahati?", answer: "Yes. Major city bus and road corridors connect Maligaon with Fancy Bazar, Paltan Bazar, Ganeshguri, Six Mile and other parts of the city." },
      { question: "Are hospitals and restaurants available in Maligaon?", answer: "Yes. The locality has restaurants and daily services, and Swagat Super Speciality Hospital is located in Maligaon." },
    ],
  },
  {
    slug: "chandmari",
    coordinates: { latitude: 26.1874, longitude: 91.7685 },
    placesRadiusMeters: 1800,
    name: "Chandmari",
    intro: "Chandmari is an established central Guwahati neighbourhood with educational institutions, local food, markets and convenient access towards Zoo Road, Uzan Bazar and the eastern side of the city.",
    highlights: ["Established central locality", "Local food and markets", "Access to Zoo Road and Uzan Bazar"],
    bestFor: "families, students' visitors, longer stays and travellers who prefer an established residential-commercial neighbourhood",
    nearby: "Silpukhuri, Zoo Road, Noonmati, Uzan Bazar and Guwahati Club",
    food: [
      { name: "KitChai", description: "A café and tea stop on RG Baruah Road opposite Gauhati Commerce College." },
      { name: "Bhuruka", description: "An Assamese restaurant on Maniram Dewan Road in the Chandmari area." },
      { name: "Chandmari local eateries", description: "The neighbourhood has many small restaurants, bakeries, tea shops and student-friendly food options." },
    ],
    hospitals: [
      { name: "Red Cross Hospital", description: "A general hospital on Navagiri Road in the Chandmari area." },
      { name: "Central Guwahati healthcare", description: "Additional hospitals and specialist clinics are accessible towards Zoo Road, Ambari and Ganeshguri." },
    ],
    attractions: [
      { name: "Navagraha Temple", description: "A historic temple dedicated to the nine planets, situated on Chitrasal Hill in Guwahati." },
      { name: "Assam State Zoo cum Botanical Garden", description: "A major wildlife and green-space attraction accessible from the Chandmari/Zoo Road side." },
      { name: "Guwahati Planetarium", description: "A science and astronomy attraction in nearby Uzan Bazar." },
    ],
    shopping: [
      { name: "Chandmari Fly-over Market", description: "A recognised municipal market in the Chandmari area." },
      { name: "Chandmari Colony Market", description: "Another municipal market serving everyday neighbourhood shopping." },
    ],
    transport: [
      { name: "Central road connections", description: "Chandmari connects conveniently with Guwahati Club, Uzan Bazar, Zoo Road and Noonmati." },
      { name: "Local buses and shared transport", description: "Frequent local road transport makes the area practical for everyday movement around central Guwahati." },
      { name: "Railway station access", description: "Guwahati Railway Station is reachable through the central-city road network." },
    ],
    faqs: [
      { question: "Is Chandmari a good area for a longer stay?", answer: "It can be a practical choice because it combines residential streets with markets, food, education, healthcare and central road connections." },
      { question: "What can I visit near Chandmari?", answer: "Navagraha Temple, Assam State Zoo, Guwahati Planetarium and central Uzan Bazar are useful sightseeing options." },
      { question: "Does Chandmari have local markets?", answer: "Yes. Guwahati Municipal Corporation lists both Chandmari Fly-over Market and Chandmari Colony Market." },
    ],
  },
  {
    slug: "panjabari",
    coordinates: { latitude: 26.1458, longitude: 91.826 },
    placesRadiusMeters: 1800,
    name: "Panjabari",
    intro: "Panjabari offers a more residential base in eastern Guwahati, with access to cultural attractions, local services and the Six Mile–VIP Road side of the city.",
    highlights: ["Residential setting", "Cultural attractions nearby", "Access to Six Mile and eastern Guwahati"],
    bestFor: "families, cultural visitors and travellers looking for a quieter eastern Guwahati neighbourhood",
    nearby: "Bagharbari, Six Mile, Hengrabari, Khanapara and Zoo Road",
    food: [
      { name: "The 6th Mile Café", description: "A casual food option on Panjabari Road in the Bormotoria area." },
      { name: "Panjabari Road eateries", description: "Local restaurants, cafés and takeaway options are spread along Panjabari Road and towards Six Mile." },
    ],
    hospitals: [
      { name: "Guwahati Psychiatric Hospital", description: "A specialist psychiatric hospital on Panjabari Road in the Bagharbari side of the locality." },
      { name: "Six Mile healthcare", description: "Larger multi-speciality healthcare options are available towards Six Mile and GS Road." },
    ],
    attractions: [
      { name: "Srimanta Sankardev Kalakshetra", description: "One of Guwahati's major cultural destinations, presenting Assamese art, heritage and performing traditions." },
      { name: "Assam State Zoo cum Botanical Garden", description: "A major family attraction reachable towards the central-eastern side of Guwahati." },
      { name: "Khanapara side", description: "Panjabari provides convenient road access towards Khanapara and the eastern gateway of Guwahati." },
    ],
    shopping: [
      { name: "Panjabari Road local shopping", description: "The main road has neighbourhood stores, pharmacies and daily-use shopping." },
      { name: "Six Mile retail", description: "Six Mile and GS Road provide larger retail, dining and service options nearby." },
    ],
    transport: [
      { name: "Panjabari Road", description: "The main local corridor connects the neighbourhood with Six Mile, Bagharbari and adjoining eastern areas." },
      { name: "Six Mile connection", description: "Six Mile provides access to major city bus routes and the GS Road corridor." },
      { name: "Local taxis and app cabs", description: "Useful for direct travel to the railway station, airport and central Guwahati." },
    ],
    faqs: [
      { question: "Is Panjabari quieter than central Guwahati?", answer: "Much of Panjabari is residential, so it can suit travellers who prefer to stay away from the busiest central commercial districts." },
      { question: "What is the main attraction near Panjabari?", answer: "Srimanta Sankardev Kalakshetra is one of the most notable cultural attractions on this side of Guwahati." },
      { question: "How is Panjabari connected to the rest of Guwahati?", answer: "Panjabari Road connects towards Six Mile, where travellers can join GS Road and major east–west city transport corridors." },
    ],
  },
  {
    slug: "six-mile",
    coordinates: { latitude: 26.1329, longitude: 91.806 },
    placesRadiusMeters: 1800,
    name: "Six Mile",
    intro: "Six Mile is a well-connected eastern Guwahati locality near GS Road, with convenient links to Ganeshguri, Beltola, Panjabari, Khanapara, hospitals, restaurants and retail.",
    highlights: ["Major road connections", "Restaurants and retail", "Healthcare and eastern-city access"],
    bestFor: "business travellers, families, medical visitors and road travellers using the eastern side of Guwahati",
    nearby: "Beltola, Ganeshguri, Panjabari, Rukminigaon and Khanapara",
    food: [
      { name: "Brewbakes", description: "A café and restaurant on GS Road in Six Mile." },
      { name: "ASSAM TEA", description: "A tea and café option on Panjabari Road in the Six Mile area." },
      { name: "GS Road dining", description: "The Six Mile–Rukminigaon stretch has restaurants, cafés, bakeries and takeaway choices." },
    ],
    hospitals: [
      { name: "GNRC Hospital Six-Mile Branch", description: "A private hospital on GS Road at the Six Mile/Jaya Nagar side." },
      { name: "Rahman Hospitals", description: "A hospital on VIP Road near Six Mile, adding another healthcare option in eastern Guwahati." },
    ],
    attractions: [
      { name: "Srimanta Sankardev Kalakshetra", description: "A major Assamese cultural complex accessible from Six Mile via the Panjabari side." },
      { name: "Assam State Zoo cum Botanical Garden", description: "A major wildlife and botanical attraction accessible towards central-eastern Guwahati." },
      { name: "Basistha Temple", description: "A historic temple and scenic local attraction in southeast Guwahati." },
    ],
    shopping: [
      { name: "Six-Mile Fly Over Market", description: "Listed by Guwahati Municipal Corporation among the city's lease markets." },
      { name: "Six Mile / Jayanagar fish and vegetable market", description: "A private market listed by the municipal corporation for local fresh-food shopping." },
      { name: "GS Road retail", description: "The surrounding corridor has supermarkets, branded retail, pharmacies and everyday services." },
    ],
    transport: [
      { name: "Six Mile Flyover bus stop", description: "Official city bus routes include Six Mile Flyover on the major Adabari–Khanapara corridor." },
      { name: "GS Road", description: "A key arterial route linking Six Mile with Ganeshguri, central Guwahati and Khanapara." },
      { name: "Khanapara connection", description: "Six Mile is convenient for travellers continuing east towards Khanapara and highway connections." },
    ],
    faqs: [
      { question: "Is Six Mile well connected to central Guwahati?", answer: "Yes. GS Road and city bus routes connect Six Mile with Ganeshguri, central Guwahati and the western side of the city." },
      { question: "Is Six Mile useful for medical stays?", answer: "Yes. The locality and its immediate surroundings have major healthcare facilities including GNRC Hospital and Rahman Hospitals." },
      { question: "What can families visit from Six Mile?", answer: "Srimanta Sankardev Kalakshetra, Assam State Zoo and Basistha Temple are useful sightseeing options from the eastern side of Guwahati." },
    ],
  },
];

export function getNeighbourhood(slug: string) {
  return NEIGHBOURHOODS.find((item) => item.slug === slug);
}
