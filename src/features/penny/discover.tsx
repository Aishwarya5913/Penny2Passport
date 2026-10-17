import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  Clock,
  ShieldCheck,
  Users,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePenny } from "./store";
import {
  finance,
  money,
  safeBudget,
  destinations,
  estimate,
  distance,
  packing,
  type Trip,
  type Destination,
} from "./logic";
import { geocode, type Location } from "./weather";
import { images } from "./overview";
import { PageHeading, Field, Modal, Empty } from "./ui";
import { TripDetail } from "./trips";
export function DiscoverPage() {
  const { account, update, busy } = usePenny();
  const p = account.profile;
  const f = finance(account.entries, p.savings, "2026-10");
  const [step, setStep] = useState(0),
    [reserve, setReserve] = useState(p.reserve),
    [bills, setBills] = useState(p.bills),
    [willing, setWilling] = useState(p.willingness),
    [city, setCity] = useState(p.homeCity),
    [radius, setRadius] = useState(100),
    [days, setDays] = useState(2),
    [travellers, setTravellers] = useState(1),
    [types, setTypes] = useState<string[]>([]),
    [transport, setTransport] = useState("Bus / train"),
    [start, setStart] = useState("2026-10-24"),
    [flexible, setFlexible] = useState(true),
    [allowanceDays, setAllowanceDays] = useState(14),
    [origin, setOrigin] = useState<Location | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<Trip | null>(null),
    [scope, setScope] = useState("My contribution"),
    [picked, setPicked] = useState<Destination | null>(null);
  const safe = safeBudget(f.savings, reserve, bills, willing);
  async function generate(e: FormEvent) {
    e.preventDefault();
    if (!city.trim()) {
      setError("Enter your home city to calculate distances.");
      return;
    }
    if (!flexible && start < "2026-10-17") {
      setError("Choose a future travel date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const location = await geocode(city);
      setOrigin(location);
      await update({
        ...account,
        profile: { ...p, homeCity: city, reserve, bills, willingness: willing },
      });
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not find your city.");
    } finally {
      setLoading(false);
    }
  }
  const results = origin
    ? destinations
        .map((d) => {
          const km = distance(origin.latitude, origin.longitude, d);
          const cost = estimate(d, Math.ceil(km * 1.25), days, travellers, transport);
          const personal = scope === "Whole group" ? cost.total : cost.perPerson;
          return { d, km, cost, personal };
        })
        .filter((r) => r.km <= radius && (!types.length || types.includes(r.d.type)))
        .sort(
          (a, b) =>
            Number(b.personal <= safe) - Number(a.personal <= safe) || a.personal - b.personal,
        )
    : [];
  function openPlan(d: Destination, km: number) {
    const cost = estimate(d, Math.ceil(km * 1.25), days, travellers, transport);
    setPicked(d);
    setSelected({
      id: crypto.randomUUID(),
      destinationId: d.id,
      name: `A little escape to ${d.name}`,
      start,
      days,
      travellers,
      budget: cost.total,
      actual: 0,
      checklist: packing(days, d.type, 0, 24, p.packingPreference),
      notes: `From ${city}. ${transport}. ${scope}. Indicative prices: 2 guests/room, ₹300 food per person/day, 10% contingency. Approximate road distance: ${Math.ceil(km * 1.25)} km.`,
      itinerary: Array.from({ length: days }, (_, i) =>
        i === 0
          ? `Arrive in ${d.name}, settle in and explore local sights.`
          : i === days - 1
            ? "Enjoy a relaxed morning, a local meal and travel home."
            : `Explore ${d.type.toLowerCase()} spots, with time for breaks and local food.`,
      ),
    });
  }
  return (
    <>
      <PageHeading
        eyebrow="THE SAVINGS-TO-ADVENTURE ENGINE"
        title="Your savings. Your next story."
        subtitle="A little escape, planned around what you can safely afford."
        action={
          <span className="safe-pill">
            <ShieldCheck size={17} />
            {money(safe)} safe to spend
          </span>
        }
      />
      <div className="wizard-steps">
        {[
          "Your safe budget",
          "Your starting point",
          "Your kind of escape",
          "Your possibilities",
        ].map((s, i) => (
          <div key={s} className={i === step ? "current" : i < step ? "completed" : ""}>
            <span>{i + 1}</span>
            {s}
          </div>
        ))}
      </div>
      {step < 3 ? (
        <div className="wizard-layout">
          <form
            onSubmit={
              step === 2
                ? generate
                : (e) => {
                    e.preventDefault();
                    setStep(step + 1);
                  }
            }
            className="wizard-form"
          >
            {step === 0 ? (
              <>
                <span className="eyebrow">FIRST, THE IMPORTANT PART</span>
                <h2>Adventure without the money stress.</h2>
                <p className="muted">Your fund is {money(f.savings)}. How much should stay safe?</p>
                <div className="form-grid">
                  <Field label="Emergency reserve (₹)">
                    <input
                      type="number"
                      min="0"
                      required
                      value={reserve}
                      onChange={(e) => setReserve(Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Essential bills before next allowance (₹)">
                    <input
                      type="number"
                      min="0"
                      required
                      value={bills}
                      onChange={(e) => setBills(Number(e.target.value))}
                    />
                  </Field>
                </div>
                <Field label="Maximum you want to spend (₹)">
                  <input
                    type="number"
                    min="0"
                    required
                    value={willing}
                    onChange={(e) => setWilling(Number(e.target.value))}
                  />
                </Field>
                <Field label="Days until your next allowance">
                  <input
                    type="number"
                    min="0"
                    max="365"
                    required
                    value={allowanceDays}
                    onChange={(e) => setAllowanceDays(Number(e.target.value))}
                  />
                </Field>
                <Field label="Your budget covers">
                  <select value={scope} onChange={(e) => setScope(e.target.value)}>
                    <option>My contribution</option>
                    <option>Whole group</option>
                  </select>
                </Field>
              </>
            ) : step === 1 ? (
              <>
                <span className="eyebrow">NEAR OR FAR, IT’S YOUR CALL</span>
                <h2>Where does your journey begin?</h2>
                <Field label="Your home city">
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your actual starting city"
                    required
                  />
                </Field>
                <Field label="How far would you like to go?">
                  <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
                    {[25, 50, 100, 250, 10000].map((r) => (
                      <option value={r} key={r}>
                        {r === 10000 ? "Anywhere in India" : `Within ${r} km`}
                      </option>
                    ))}
                  </select>
                </Field>
                <p className="muted">
                  The current curated collection covers Maharashtra. Distances are straight-line
                  approximations; travel estimates use a 25% road allowance.
                </p>
              </>
            ) : (
              <>
                <span className="eyebrow">MAKE IT YOUR KIND OF TRIP</span>
                <h2>What sounds like a good weekend?</h2>
                <div className="form-grid">
                  <Field label="Travellers (including you)">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={travellers}
                      onChange={(e) => setTravellers(Number(e.target.value))}
                      required
                    />
                  </Field>
                  <Field label="Number of days">
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      required
                    />
                  </Field>
                </div>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={flexible}
                    onChange={(e) => setFlexible(e.target.checked)}
                  />
                  My dates are flexible
                </label>
                <Field label={flexible ? "Tentative departure" : "Departure date"}>
                  <input
                    type="date"
                    min="2026-10-17"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Transport preference">
                  <select value={transport} onChange={(e) => setTransport(e.target.value)}>
                    <option>Bus / train</option>
                    <option>Shared car</option>
                  </select>
                </Field>
                <Field label="Experiences">
                  <div className="experience-options">
                    {[
                      "Mountains",
                      "Nature & waterfalls",
                      "Trekking",
                      "Beaches",
                      "Relaxing getaway",
                    ].map((t) => (
                      <label key={t} className={types.includes(t) ? "selected" : ""}>
                        <input
                          type="checkbox"
                          checked={types.includes(t)}
                          onChange={() =>
                            setTypes(
                              types.includes(t) ? types.filter((x) => x !== t) : [...types, t],
                            )
                          }
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </Field>
              </>
            )}
            {error && (
              <p className="alert" role="alert">
                {error}
              </p>
            )}
            <div className="wizard-actions">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  <ArrowLeft />
                  Back
                </Button>
              )}
              <Button disabled={loading || busy}>
                {loading
                  ? "Finding your possibilities…"
                  : step === 2
                    ? "Find my little escape"
                    : "Continue"}
                <ArrowRight />
              </Button>
            </div>
          </form>
          <aside className="wizard-summary">
            <img
              src={images.ghats}
              width={1536}
              height={864}
              alt="Western Ghats inspired scenery"
            />
            <div>
              <span className="stat-icon mint">
                <Compass />
              </span>
              <h3>
                A world of possibilities.
                <br />A budget that’s yours.
              </h3>
              <p>
                Total savings <strong>{money(f.savings)}</strong>
              </p>
              <p>
                Protected reserve <strong>{money(reserve)}</strong>
              </p>
              <p>
                Essential bills <strong>{money(bills)}</strong>
              </p>
              <hr />
              <p>
                Safe budget <strong>{money(safe)}</strong>
              </p>
              <small>Never more than you’re comfortable spending.</small>
            </div>
          </aside>
        </div>
      ) : (
        <>
          <div className="section-heading">
            <div>
              <h2>Your possibilities from {origin?.name}</h2>
              <p className="muted">
                {days} days · {travellers} traveller{travellers > 1 ? "s" : ""} ·{" "}
                {radius === 10000 ? "India" : `${radius} km radius`} · {scope.toLowerCase()}
              </p>
            </div>
            <Button variant="outline" onClick={() => setStep(0)}>
              <PencilIcon />
              Edit preferences
            </Button>
          </div>
          {results.length ? (
            <div className="trip-grid results">
              {results.map(({ d, km, cost, personal }) => (
                <article className="trip-card" key={d.id}>
                  <div className="trip-photo">
                    <img
                      loading="lazy"
                      src={images[d.image]}
                      width={1024}
                      height={768}
                      alt={`${d.name} inspired scenery`}
                    />
                    <span className="trip-type">{d.type}</span>
                    <span className="photo-caption">Illustrative photo</span>
                  </div>
                  <div className="trip-card-body">
                    <span className="trip-region">
                      <MapPin size={12} />
                      {km} km from {origin?.name} · {d.state}
                    </span>
                    <h3>{d.name}</h3>
                    <p>{d.caption}</p>
                    <span className={`tag ${personal <= safe ? "mint" : "coral"}`}>
                      {personal <= safe ? "Fits your budget" : "Save more before visiting"}
                    </span>
                    <div className="trip-card-bottom">
                      <span>
                        <Clock size={13} />
                        {days} days <Users size={13} />
                        {travellers}
                      </span>
                      <strong>
                        {money(cost.perPerson)}
                        <small>/ person</small>
                      </strong>
                    </div>
                    <p className="estimate-note">
                      Group total: {money(cost.total)} · 10% contingency included
                    </p>
                    <p className="estimate-note">
                      {personal <= safe
                        ? `Within your radius and leaves ${money(safe - personal)} of your ${scope === "Whole group" ? "group" : "personal"} travel budget.`
                        : `Your ${scope === "Whole group" ? "group" : "personal"} budget needs ${money(personal - safe)} more.`}
                    </p>
                    <Button variant="outline" className="w-full" onClick={() => openPlan(d, km)}>
                      View plan & budget <ArrowUpRight />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Empty
              title="A smaller escape, or a bigger circle?"
              description="No curated destinations match these choices. Try a wider radius, another experience, or start a local day-trip savings goal."
            >
              <Button onClick={() => setStep(1)}>
                Adjust travel area <ArrowRight />
              </Button>
            </Empty>
          )}
          <p className="muted estimate-note">
            Indicative estimates only, not verified live fares or availability. Two guests per room;
            food ₹300/person/day; transport varies by mode.{" "}
            {safe === 0
              ? "No safe budget is available yet. Protect your essentials and build your fund before travelling."
              : ""}
          </p>
        </>
      )}
      {selected && picked && (
        <Modal title={picked.name} close={() => setSelected(null)}>
          <TripDetail
            trip={selected}
            onSave={async (t) => {
              await update({ ...account, trips: [...account.trips, t] });
              setSelected(null);
            }}
            isNew
          />
        </Modal>
      )}
      <Button variant="link" asChild>
        <Link to="/savings">
          Review my safety net <ShieldCheck />
        </Link>
      </Button>
    </>
  );
}
function PencilIcon() {
  return <Compass size={16} />;
}
