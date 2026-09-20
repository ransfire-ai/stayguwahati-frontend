import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://stayguwahati.in";
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://stayguwahati-backend.onrender.com"
).replace(/\/$/, "");

type Property = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  locality?: string;
  location?: string;
  area?: string;
  city?: string;
  description?: string;
  images?: string[];
  image?: string;
  pricePerNight?: number;
  price?: number;
  rating?: number;
  reviewsCount?: number;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  isActive?: boolean;
  active?: boolean;
  isAvailable?: boolean;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
};

type ApiResponse = Property[] | { data?: Property[] | { properties?: Property[]; homestays?: Property[] }; properties?: Property[]; homestays?: Property[] };

import { NEIGHBOURHOODS, getNeighbourhood } from "../data";
import type { Neighbourhood } from "../data";

function isActiveProperty(property: Property) {
  if (property.isActive === false || property.active === false || property.isAvailable === false) return false;
  const status = String(property.status || "").toLowerCase();
  return !["pending", "rejected", "inactive", "disabled", "deleted", "draft"].includes(status);
}

function propertyLocality(property: Property) {
  return String(property.locality || property.location || property.area || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function getProperties(result: ApiResponse): Property[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.properties)) return result.properties;
  if (Array.isArray(result.homestays)) return result.homestays;
  if (Array.isArray(result.data)) return result.data;
  if (result.data && !Array.isArray(result.data)) {
    if (Array.isArray(result.data.properties)) return result.data.properties;
    if (Array.isArray(result.data.homestays)) return result.data.homestays;
  }
  return [];
}

async function getPropertiesForNeighbourhood(name: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/homestays`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const result = (await response.json()) as ApiResponse;
    const needle = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
    return getProperties(result).filter((property) => isActiveProperty(property) && propertyLocality(property).includes(needle));
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return NEIGHBOURHOODS.map(({ slug }) => ({ locality: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locality: string }> }): Promise<Metadata> {
  const { locality } = await params;
  const neighbourhood = getNeighbourhood(locality);
  if (!neighbourhood) return { title: "Guwahati Neighbourhoods | StayGuwahati", robots: { index: false, follow: true } };

  const properties = await getPropertiesForNeighbourhood(neighbourhood.name);
  const countText = properties.length ? ` Browse ${properties.length} listed ${properties.length === 1 ? "stay" : "stays"} in the area.` : "";
  return {
    title: `Homestays in ${neighbourhood.name}, Guwahati | StayGuwahati`,
    description: `${neighbourhood.intro}${countText}`,
    alternates: { canonical: `${SITE_URL}/guwahati/${neighbourhood.slug}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/guwahati/${neighbourhood.slug}`,
      siteName: "StayGuwahati",
      title: `Homestays in ${neighbourhood.name}, Guwahati | StayGuwahati`,
      description: neighbourhood.intro,
      locale: "en_IN",
    },
    robots: properties.length ? { index: true, follow: true } : { index: false, follow: true },
  };
}

function Breadcrumbs({ neighbourhood }: { neighbourhood: Neighbourhood }) {
  const items = [
    { name: "Home", href: "/" },
    { name: "Guwahati", href: "/explore" },
    { name: neighbourhood.name, href: `/guwahati/${neighbourhood.slug}` },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${SITE_URL}${item.href}` })),
  };
  return <>
    <nav aria-label="Breadcrumb" style={{ fontSize: 13, marginBottom: 18 }}>
      {items.map((item, index) => <span key={item.href}>{index > 0 && " / "}<Link href={item.href}>{item.name}</Link></span>)}
    </nav>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  </>;
}

export default async function NeighbourhoodPage({ params }: { params: Promise<{ locality: string }> }) {
  const { locality } = await params;
  const neighbourhood = getNeighbourhood(locality);
  if (!neighbourhood) return null;

  const properties = await getPropertiesForNeighbourhood(neighbourhood.name);
  const otherNeighbourhoods = NEIGHBOURHOODS.filter((item) => item.slug !== neighbourhood.slug).slice(0, 6);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: neighbourhood.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const PlaceCards = ({ items }: { items: { name: string; description: string }[] }) => (
    <div className="sg-grid sg-3" style={{ marginTop: 18 }}>
      {items.map((item) => <article key={item.name} className="sg-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 19, margin: "0 0 8px" }}>{item.name}</h3>
        <p className="sg-muted" style={{ margin: 0 }}>{item.description}</p>
      </article>)}
    </div>
  );

  return <main className="sg-container sg-page">
    <Breadcrumbs neighbourhood={neighbourhood} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

    <section className="sg-hero" style={{ paddingTop: 12 }}>
      <span className="sg-kicker">Guwahati neighbourhood guide</span>
      <h1 className="sg-title-sm" style={{ marginTop: 12 }}>Homestays in {neighbourhood.name}, Guwahati</h1>
      <p className="sg-sub" style={{ maxWidth: 860 }}>{neighbourhood.intro}</p>
      <p className="sg-muted" style={{ marginTop: 12 }}><strong>Best for:</strong> {neighbourhood.bestFor}. <strong>Nearby:</strong> {neighbourhood.nearby}.</p>
      <div className="sg-grid sg-3" style={{ marginTop: 22 }}>
        {neighbourhood.highlights.map((highlight) => <div key={highlight} className="sg-card" style={{ padding: 18 }}><strong>{highlight}</strong></div>)}
      </div>
    </section>

    <section className="sg-section" id="stays">
      <span className="sg-kicker">Available homestays</span>
      <h2 className="sg-title-sm" style={{ marginTop: 12 }}>{properties.length ? `${properties.length} local ${properties.length === 1 ? "stay" : "stays"} to explore` : `Homestays in ${neighbourhood.name} coming soon`}</h2>
      {properties.length ? <div className="sg-grid sg-3" style={{ marginTop: 20 }}>
        {properties.map((property) => {
          const id = property._id || property.id;
          const propertyImage = property.images?.[0] || property.image;
          if (!id) return null;
          return <Link href={`/properties/${id}`} key={String(id)} className="sg-card sg-property">
            <div className="sg-property-img">{propertyImage ? <img src={propertyImage} alt={property.title || property.name || `Homestay in ${neighbourhood.name}`} /> : null}</div>
            <div className="sg-property-body">
              <span className="sg-kicker">Local stay</span>
              <h3 className="sg-property-title" style={{ marginTop: 12 }}>{property.title || property.name || "Homestay"}</h3>
              <p className="sg-muted">{property.locality || property.location || neighbourhood.name}</p>
              <b>₹{Number(property.pricePerNight || property.price || 0).toLocaleString("en-IN")} / night</b>
            </div>
          </Link>;
        })}
      </div> : <div className="sg-card sg-empty" style={{ marginTop: 20 }}><p>We are onboarding stays in {neighbourhood.name}. Explore all current Guwahati stays while more local hosts join.</p><Link href="/explore" style={{ fontWeight: 700 }}>Explore all stays →</Link></div>}
    </section>

    <section className="sg-section" id="food">
      <span className="sg-kicker">Eat & drink</span><h2 className="sg-title-sm" style={{ marginTop: 12 }}>Cafés & restaurants around {neighbourhood.name}</h2>
      <PlaceCards items={neighbourhood.food} />
    </section>

    <section className="sg-section" id="hospitals">
      <span className="sg-kicker">Healthcare</span><h2 className="sg-title-sm" style={{ marginTop: 12 }}>Hospitals & healthcare nearby</h2>
      <PlaceCards items={neighbourhood.hospitals} />
      <p className="sg-muted" style={{ marginTop: 14, fontSize: 13 }}>For urgent medical needs, confirm the facility, department and current opening information directly before travelling.</p>
    </section>

    <section className="sg-section" id="attractions">
      <span className="sg-kicker">Things to do</span><h2 className="sg-title-sm" style={{ marginTop: 12 }}>Tourist attractions near {neighbourhood.name}</h2>
      <PlaceCards items={neighbourhood.attractions} />
    </section>

    <section className="sg-section" id="shopping">
      <span className="sg-kicker">Local shopping</span><h2 className="sg-title-sm" style={{ marginTop: 12 }}>Shopping & markets</h2>
      <PlaceCards items={neighbourhood.shopping} />
    </section>

    <section className="sg-section" id="transport">
      <span className="sg-kicker">Getting around</span><h2 className="sg-title-sm" style={{ marginTop: 12 }}>Transport & connectivity</h2>
      <PlaceCards items={neighbourhood.transport} />
    </section>

    <section className="sg-section">
      <span className="sg-kicker">Explore more</span><h2 className="sg-title-sm" style={{ marginTop: 12 }}>Nearby Guwahati neighbourhoods</h2>
      <div className="sg-grid sg-3" style={{ marginTop: 18 }}>
        {otherNeighbourhoods.map((item) => <Link href={`/guwahati/${item.slug}`} key={item.slug} className="sg-card" style={{ padding: 20 }}><span className="sg-kicker">Neighbourhood</span><h3 style={{ fontSize: 22, margin: "10px 0 6px" }}>{item.name}</h3><p className="sg-muted">{item.intro}</p><b>View stays →</b></Link>)}
      </div>
    </section>

    <section className="sg-section" id="faqs">
      <span className="sg-kicker">Plan your stay</span><h2 className="sg-title-sm" style={{ marginTop: 12 }}>FAQs about staying in {neighbourhood.name}</h2>
      <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
        {neighbourhood.faqs.map((faq) => <details key={faq.question} className="sg-card" style={{ padding: "18px 20px" }}><summary style={{ fontWeight: 750, cursor: "pointer" }}>{faq.question}</summary><p className="sg-muted" style={{ margin: "12px 0 0" }}>{faq.answer}</p></details>)}
      </div>
    </section>
  </main>;
}
