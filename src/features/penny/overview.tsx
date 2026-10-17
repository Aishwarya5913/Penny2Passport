import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Wallet,
  TrendingUp,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  MapPin,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ghats from "@/assets/ghats.jpg";
import beach from "@/assets/beach.jpg";
import fort from "@/assets/fort.jpg";
import waterfall from "@/assets/waterfall.jpg";
import { usePenny } from "./store";
import { finance, money, safeBudget, destinations, estimate } from "./logic";
import { PageHeading } from "./ui";
import { EntryModal } from "./money";
export const images = { ghats, beach, fort, waterfall };
export function Overview() {
  const { account } = usePenny();
  const [add, setAdd] = useState(false);
  const f = finance(account.entries, account.profile.savings, "2026-10");
  const safe = safeBudget(
    f.savings,
    account.profile.reserve,
    account.profile.bills,
    account.profile.willingness,
  );
  const recent = account.entries
    .filter((e) => e.kind === "expense")
    .slice(-4)
    .reverse();
  const rate = f.income ? Math.max(0, Math.round((f.unspent / f.income) * 100)) : 0;
  const spendingGroups = [
    "Food & groceries",
    "Rent",
    "Daily travel",
    "College fees",
    "Everything else",
  ];
  const categoryTotals = spendingGroups.map((cat, i) =>
    account.entries
      .filter(
        (e) =>
          e.kind === "expense" &&
          e.date.startsWith("2026-10") &&
          (i === 4 ? !spendingGroups.slice(0, 4).includes(e.category) : e.category === cat),
      )
      .reduce((sum, e) => sum + e.amount, 0),
  );
  const stops = categoryTotals.map(
    (_, i) =>
      (categoryTotals.slice(0, i + 1).reduce((sum, v) => sum + v, 0) / Math.max(1, f.expenses)) *
      100,
  );
  return (
    <>
      <PageHeading
        title={`A little saved. A world to explore.`}
        subtitle={`Hey ${account.profile.name}, let’s turn your everyday savings into extraordinary memories.`}
        action={
          <Button variant="outline" onClick={() => setAdd(true)}>
            <Plus />
            Add expense
          </Button>
        }
      />
      <div className="overview-stats">
        {[
          {
            label: "Monthly income",
            amount: f.income,
            note: "Your October allowance & income",
            icon: Wallet,
            color: "yellow",
          },
          {
            label: "Monthly expenses",
            amount: f.expenses,
            note: `${recent.length ? "Every little spend, accounted for" : "A fresh start for your month"}`,
            icon: ArrowUpRight,
            color: "coral",
          },
          {
            label: "Total savings",
            amount: f.savings,
            note: `${money(Math.max(0, f.unspent))} unspent this month`,
            icon: PiggyBank,
            color: "mint",
          },
          {
            label: "Safe travel budget",
            amount: safe,
            note: "Your essentials stay protected",
            icon: ShieldCheck,
            color: "lavender",
          },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-top">
              <span>{s.label}</span>
              <span className={`stat-icon ${s.color}`}>
                <s.icon size={18} />
              </span>
            </div>
            <strong>{money(s.amount)}</strong>
            <small>{s.note}</small>
          </div>
        ))}
      </div>
      <section className="adventure-banner">
        <img
          src={ghats}
          width={1536}
          height={864}
          alt="Lush Western Ghats hills and a winding mountain road"
        />
        <div className="adventure-overlay" />
        <div className="adventure-copy">
          <span className="banner-eyebrow">
            <Sparkles size={15} /> THE SAVINGS-TO-ADVENTURE ENGINE
          </span>
          <h2>
            Your next adventure
            <br />
            starts with {money(safe)}.
          </h2>
          <p>
            A weekend in the hills? A day by the sea?
            <br />
            Find a little escape that fits your real-life budget.
          </p>
          <Button asChild className="mint-button">
            <Link to="/discover">
              Find my next trip <ArrowUpRight />
            </Link>
          </Button>
          <span className="banner-foot">
            <ShieldCheck size={14} />
            {money(account.profile.reserve)} emergency fund stays untouched
          </span>
        </div>
        <span className="image-location">
          <MapPin size={14} /> Western Ghats, Maharashtra
        </span>
      </section>
      <div className="overview-mid">
        <section className="spending-section">
          <div className="section-heading">
            <div>
              <h2>Your money, at a glance</h2>
              <p className="muted">Small habits. More room for adventure.</p>
            </div>
            <Button variant="link" asChild>
              <Link to="/money">
                View details <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <div className="spending-content">
            <div
              className="donut"
              style={
                {
                  "--s0": `${stops[0]}%`,
                  "--s1": `${stops[1]}%`,
                  "--s2": `${stops[2]}%`,
                  "--s3": `${stops[3]}%`,
                } as React.CSSProperties
              }
            >
              <div>
                <small>Spent this month</small>
                <strong>{money(f.expenses)}</strong>
                <span>of {money(f.income)}</span>
              </div>
            </div>
            <div className="spending-legend">
              {["Food & groceries", "Rent", "Daily travel", "College fees", "Everything else"].map(
                (cat, i) => {
                  const value = account.entries
                    .filter(
                      (e) =>
                        e.kind === "expense" &&
                        e.date.startsWith("2026-10") &&
                        (i === 4
                          ? !["Food & groceries", "Rent", "Daily travel", "College fees"].includes(
                              e.category,
                            )
                          : e.category === cat),
                    )
                    .reduce((s, e) => s + e.amount, 0);
                  return (
                    <div key={cat}>
                      <span>
                        <i className={`legend-dot dot-${i}`} />
                        {cat}
                      </span>
                      <strong>{money(value)}</strong>
                    </div>
                  );
                },
              )}
            </div>
          </div>
          <div className="spending-note">
            <TrendingUp size={17} />
            <span>
              {rate > 0
                ? `You’re keeping ${rate}% of this month’s income. That’s a little closer to your next escape.`
                : "Record income and expenses to see your savings rate."}
            </span>
          </div>
        </section>
        <section className="transactions-section">
          <div className="section-heading">
            <div>
              <h2>The little spends</h2>
              <p className="muted">Your recent transactions</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Add a transaction"
              onClick={() => setAdd(true)}
            >
              <Plus />
            </Button>
          </div>
          {recent.map((e, i) => (
            <div className="transaction" key={e.id}>
              <span className={`transaction-icon dot-${i}`}>
                <ArrowDownLeft size={19} />
              </span>
              <div>
                <strong>{e.category}</strong>
                <small>{e.description}</small>
              </div>
              <span>
                <strong>−{money(e.amount)}</strong>
                <small>
                  {new Date(`${e.date}T12:00:00`).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </small>
              </span>
            </div>
          ))}
          {!recent.length && <p className="muted">No expenses yet. Add your first little spend.</p>}
          <Button variant="link" asChild className="all-transactions">
            <Link to="/money">
              All transactions <ChevronRight size={14} />
            </Link>
          </Button>
        </section>
      </div>
      <section className="destinations-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LESS SPENDING. MORE STORIES.</span>
            <h2>A little inspiration for your next escape</h2>
            <p className="muted">
              Curated getaways. Indicative estimates, not live booking prices.
            </p>
          </div>
          <Button variant="link" asChild>
            <Link to="/discover">
              Explore all trips <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <div className="trip-grid">
          {destinations.slice(0, 4).map((d, i) => {
            const cost = estimate(d, [65, 30, 55, 140][i] ?? 50, 2, 1);
            return (
              <Link to="/discover" key={d.id} className="trip-card">
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
                    {d.state}
                  </span>
                  <h3>
                    {d.name}
                    <ArrowUpRight size={18} />
                  </h3>
                  <p>{d.caption}</p>
                  <div className="trip-card-bottom">
                    <span>
                      <Clock size={13} />2 days · 1 night
                    </span>
                    <strong>
                      {money(cost.perPerson)}
                      <small>/ person</small>
                    </strong>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      {add && <EntryModal close={() => setAdd(false)} />}
    </>
  );
}
