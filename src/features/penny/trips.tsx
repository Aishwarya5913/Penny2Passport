import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Save, Trash2, Copy, ArrowUpRight, Plus, CloudRain, Backpack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePenny } from "./store";
import { destinations, money, packing, type Trip, type PackingItem } from "./logic";
import { forecast, conditions, type Forecast } from "./weather";
import { PageHeading, Modal, Field, Empty, IconAction } from "./ui";
import { images } from "./overview";
export function Checklist({
  items,
  onChange,
}: {
  items: PackingItem[];
  onChange: (items: PackingItem[]) => void;
}) {
  const [custom, setCustom] = useState("");
  const done = items.filter((x) => x.packed).length;
  return (
    <>
      <div className="section-heading">
        <h3>Your packing list</h3>
        <span className="muted">
          {done}/{items.length} packed ·{" "}
          {items.length ? Math.round((done / items.length) * 100) : 0}%
        </span>
      </div>
      <div className="progress">
        <span style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
      </div>
      <div className="checklist">
        {items.map((item) => (
          <div className="checklist-item" key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={item.packed}
                onChange={(e) =>
                  onChange(
                    items.map((x) => (x.id === item.id ? { ...x, packed: e.target.checked } : x)),
                  )
                }
              />
              <span className={item.packed ? "checked" : ""}>{item.name}</span>
            </label>
            <input
              aria-label={`Quantity for ${item.name}`}
              type="number"
              min="1"
              max="99"
              value={item.quantity}
              onChange={(e) =>
                onChange(
                  items.map((x) =>
                    x.id === item.id ? { ...x, quantity: Math.max(1, Number(e.target.value)) } : x,
                  ),
                )
              }
            />
            <IconAction
              label={`Remove ${item.name}`}
              onClick={() => onChange(items.filter((x) => x.id !== item.id))}
            >
              <Trash2 size={14} />
            </IconAction>
          </div>
        ))}
      </div>
      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim()) {
            onChange([
              ...items,
              { id: crypto.randomUUID(), name: custom.trim(), quantity: 1, packed: false },
            ]);
            setCustom("");
          }
        }}
      >
        <input
          aria-label="Custom packing item"
          placeholder="Something else to bring?"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          maxLength={80}
        />
        <Button type="submit" size="icon" aria-label="Add packing item">
          <Plus />
        </Button>
      </form>
      <p className="muted estimate-note">
        {items.length - done} items remaining. Verify your ID and personal medicines before leaving.
      </p>
    </>
  );
}
export function TripDetail({
  trip,
  onSave,
  isNew = false,
}: {
  trip: Trip;
  onSave: (t: Trip) => Promise<void>;
  isNew?: boolean;
}) {
  const { account, busy } = usePenny();
  const [draft, setDraft] = useState(trip),
    [weather, setWeather] = useState<Forecast | null>(null),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState("");
  const d = destinations.find((x) => x.id === trip.destinationId);
  useEffect(() => {
    if (!d) return;
    let active = true;
    forecast(d.lat, d.lon)
      .then((w) => {
        if (active) {
          setWeather(w);
          const index = w.daily.time.indexOf(trip.start);
          if (isNew && index >= 0) {
            setDraft((previous) => ({
              ...previous,
              checklist: packing(
                previous.days,
                d.type,
                w.daily.precipitation_probability_max[index] ?? 0,
                w.daily.temperature_2m_max[index] ?? 24,
                account.profile.packingPreference,
              ),
            }));
          }
        }
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Forecast not available");
      });
    return () => {
      active = false;
    };
  }, [d, trip.start, isNew, account.profile.packingPreference]);
  const idx = weather?.daily.time.indexOf(draft.start) ?? -1;
  const temp = idx >= 0 && weather ? (weather.daily.temperature_2m_max[idx] ?? 24) : 24;
  const rain = idx >= 0 && weather ? (weather.daily.precipitation_probability_max[idx] ?? 0) : 0;
  async function save() {
    setSaving(true);
    try {
      await onSave(draft);
      setMessage("Trip and packing list saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="trip-detail">
      <Field label="Trip name">
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      </Field>
      <div className="form-grid">
        <Field label="Departure">
          <input
            type="date"
            min="2026-10-17"
            value={draft.start}
            onChange={(e) => setDraft({ ...draft, start: e.target.value })}
          />
        </Field>
        <Field label="Group size">
          <input
            type="number"
            min="1"
            max="20"
            value={draft.travellers}
            onChange={(e) =>
              setDraft({ ...draft, travellers: Math.max(1, Number(e.target.value)) })
            }
          />
        </Field>
      </div>
      <div className="form-grid">
        <Field label="Estimated whole-group budget (₹)">
          <input
            type="number"
            min="0"
            value={draft.budget}
            onChange={(e) => setDraft({ ...draft, budget: Number(e.target.value) })}
          />
        </Field>
        <Field label="Actual whole-group spend (₹)">
          <input
            type="number"
            min="0"
            value={draft.actual}
            onChange={(e) => setDraft({ ...draft, actual: Number(e.target.value) })}
          />
        </Field>
      </div>
      {draft.costs && (
        <section className="budget-lines">
          <h3>Indicative itemized group estimate</h3>
          {Object.entries(draft.costs).map(([label, value]) => (
            <Field key={label} label={`${label} (₹)`}>
              <input
                type="number"
                min="0"
                value={value}
                onChange={(e) => {
                  const costs = { ...draft.costs, [label]: Math.max(0, Number(e.target.value)) };
                  setDraft({
                    ...draft,
                    costs,
                    budget: Object.values(costs).reduce((sum, cost) => sum + cost, 0),
                  });
                }}
              />
            </Field>
          ))}
          <p className="muted estimate-note">
            Round-trip transport; shared rooms for two guests; three meals/day at ₹300/person; local
            transport shared; 10% contingency. Edit any estimate to update the group budget. Confirm
            everyone’s contribution before booking.
          </p>
        </section>
      )}
      <p className="positive">
        Remaining group money: {money(draft.budget - draft.actual)} · Estimated{" "}
        {money(Math.ceil(draft.budget / draft.travellers))} per person if equally split.
      </p>
      <p className="muted estimate-note">
        Changing group size does not reprice the saved plan; update your planning budget to match.
      </p>
      <h3>Your little itinerary</h3>
      {draft.itinerary.map((text, i) => (
        <Field key={i} label={`Day ${i + 1}`}>
          <input
            value={text}
            onChange={(e) =>
              setDraft({
                ...draft,
                itinerary: draft.itinerary.map((t, j) => (i === j ? e.target.value : t)),
              })
            }
          />
        </Field>
      ))}
      <Field label="Transport, accommodation & sharing notes">
        <textarea
          value={draft.notes}
          rows={3}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        />
      </Field>
      <section className="weather-strip">
        <CloudRain size={24} />
        <div>
          <strong>
            {weather
              ? `${weather.current.temperature_2m}°C · ${conditions(weather.current.weather_code)}`
              : error
                ? "Forecast unavailable"
                : "Checking destination weather…"}
          </strong>
          <p>
            {weather
              ? `Observed ${weather.current.time.replace("T", " ")} · Forecast ${weather.daily.time[0]}–${weather.daily.time.at(-1)}`
              : error || "Open-Meteo forecast"}
          </p>
          {weather && idx < 0 && (
            <p className="muted">
              Your departure is outside the available forecast. Best season: {d?.season}. Packing is
              a general list until a dated forecast is available.
            </p>
          )}
          {idx >= 0 && (
            <p>
              {rain}% chance of rain on departure · {temp}°C high.{" "}
              {rain >= 70
                ? "Heavy rain risk: reconsider outdoor plans."
                : "Weather can change; check again before leaving."}
            </p>
          )}
        </div>
      </section>
      <Button
        variant="outline"
        disabled={!weather || idx < 0}
        onClick={() =>
          setDraft({
            ...draft,
            checklist: packing(
              draft.days,
              d?.type ?? "",
              rain,
              temp,
              account.profile.packingPreference,
            ),
          })
        }
      >
        <Backpack />
        Regenerate packing for departure weather
      </Button>
      <Checklist
        items={draft.checklist}
        onChange={(checklist) => setDraft({ ...draft, checklist })}
      />
      <Button
        disabled={saving || busy || !draft.name.trim() || draft.start < "2026-10-17"}
        onClick={() => void save()}
      >
        <Save />
        {saving ? "Saving…" : isNew ? "Save my trip" : "Save trip & checklist"}
      </Button>
      {message && (
        <p role="status" className="alert">
          {message}
        </p>
      )}
    </div>
  );
}
export function TripsPage({ packingOnly = false }: { packingOnly?: boolean }) {
  const { account, update } = usePenny();
  const [selected, setSelected] = useState<Trip | null>(null),
    [message, setMessage] = useState("");
  async function remove(id: string) {
    try {
      await update({ ...account, trips: account.trips.filter((t) => t.id !== id) });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not delete.");
    }
  }
  async function duplicate(trip: Trip) {
    try {
      await update({
        ...account,
        trips: [
          ...account.trips,
          { ...trip, id: crypto.randomUUID(), name: `${trip.name} (copy)` },
        ],
      });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not duplicate.");
    }
  }
  return (
    <>
      <PageHeading
        title={packingOnly ? "A little ready. A lot excited." : "Your travel notebook."}
        subtitle={
          packingOnly
            ? "The essentials, the just-in-cases, and everything that makes a trip yours."
            : "The adventures you’re dreaming of, all saved in one place."
        }
        action={
          <Button asChild>
            <Link to="/discover">
              Plan a little escape <Plus />
            </Link>
          </Button>
        }
      />
      {message && <p className="alert">{message}</p>}
      {account.trips.length ? (
        <div className="trip-grid results">
          {account.trips.map((t) => {
            const d = destinations.find((x) => x.id === t.destinationId);
            return (
              <article className="trip-card" key={t.id}>
                <div className="trip-photo">
                  <img
                    src={images[d?.image ?? "ghats"]}
                    width={1024}
                    height={768}
                    alt="Destination inspired scenery"
                    loading="lazy"
                  />
                </div>
                <div className="trip-card-body">
                  <h3>{t.name}</h3>
                  <p>
                    {t.start} · {t.days} days · {t.travellers} travellers
                  </p>
                  <strong>{money(t.budget)} group budget</strong>
                  <p className="muted">
                    {t.checklist.filter((x) => x.packed).length}/{t.checklist.length} items packed
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => setSelected(t)}>
                    {packingOnly ? "Open packing checklist" : "Open trip"}
                    <ArrowUpRight />
                  </Button>
                  <div className="trip-actions">
                    <IconAction label="Duplicate trip" onClick={() => void duplicate(t)}>
                      <Copy />
                    </IconAction>
                    <IconAction label="Delete trip" onClick={() => void remove(t.id)}>
                      <Trash2 />
                    </IconAction>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty
          title={
            packingOnly
              ? "Every adventure starts with a plan"
              : "Your next chapter is still unwritten"
          }
          description="Find a destination and save a trip to start your travel notebook and packing list."
        >
          <Button asChild>
            <Link to="/discover">
              Find my next trip <ArrowUpRight />
            </Link>
          </Button>
        </Empty>
      )}
      {selected && (
        <Modal
          title={packingOnly ? "Your packing checklist" : "Your trip plan"}
          close={() => setSelected(null)}
        >
          <TripDetail
            trip={selected}
            onSave={async (t) => {
              await update({
                ...account,
                trips: account.trips.map((x) => (x.id === t.id ? t : x)),
              });
              setSelected(null);
            }}
          />
        </Modal>
      )}
    </>
  );
}
