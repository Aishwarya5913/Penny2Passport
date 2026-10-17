import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldCheck, PiggyBank, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePenny } from "./store";
import { finance, money, safeBudget } from "./logic";
import { Field, PageHeading } from "./ui";
export function ProfilePage({ savings = false }: { savings?: boolean }) {
  const { account, update, busy, demo } = usePenny();
  const [message, setMessage] = useState("");
  const p = account.profile;
  const f = finance(account.entries, p.savings, "2026-10");
  const safe = safeBudget(f.savings, p.reserve, p.bills, p.willingness);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const read = (key: string) => (d.has(key) ? String(d.get(key)) : p[key as keyof typeof p]);
    const numeric = (key: "savings" | "reserve" | "bills" | "willingness") =>
      d.has(key) ? Number(d.get(key)) : p[key];
    try {
      await update({
        ...account,
        profile: {
          ...p,
          name: String(read("name")),
          homeCity: String(read("homeCity")),
          homeState: String(read("homeState")),
          packingPreference: String(read("packingPreference")),
          savings: numeric("savings"),
          reserve: numeric("reserve"),
          bills: numeric("bills"),
          willingness: numeric("willingness"),
          analytics: savings ? p.analytics : d.get("analytics") === "on",
        },
      });
      setMessage(
        demo
          ? "Updated in this demo session. Sign in to save across sessions."
          : "Your changes are saved.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save");
    }
  }
  return (
    <>
      <PageHeading
        title={savings ? "A little safety. A little freedom." : "Make this journey yours."}
        subtitle={
          savings
            ? "Protect your essentials, then make room for adventure."
            : "Your starting point and personal preferences, all in one place."
        }
      />
      <div className="profile-layout">
        <form className="form-stack profile-form" onSubmit={submit}>
          {!savings && (
            <>
              <h2>Your student profile</h2>
              <Field label="Full name">
                <input name="name" defaultValue={p.name} required maxLength={100} />
              </Field>
              <div className="form-grid">
                <Field label="Home city">
                  <input
                    name="homeCity"
                    defaultValue={p.homeCity}
                    placeholder="Your actual starting city"
                    required
                  />
                </Field>
                <Field label="State / region">
                  <input name="homeState" defaultValue={p.homeState} />
                </Field>
              </div>
              <Field label="Additional personal packing preference (optional)">
                <input
                  name="packingPreference"
                  defaultValue={p.packingPreference}
                  placeholder="An extra item you like to bring"
                />
              </Field>
              <label className="check-row">
                <input type="checkbox" name="analytics" defaultChecked={p.analytics} />
                Allow anonymous usage analytics
              </label>
              <hr />
            </>
          )}
          <h2>Your savings & safety net</h2>
          <Field label="Existing savings before this month (₹)">
            <input
              name="savings"
              type="number"
              min="0"
              step="0.01"
              defaultValue={p.savings}
              required
            />
          </Field>
          <p className="muted">
            Your starting savings balance, not including this month’s unspent money. Earlier months
            are not added again.
          </p>
          <div className="form-grid">
            <Field label="Protected emergency reserve (₹)">
              <input
                name="reserve"
                type="number"
                min="0"
                step="0.01"
                defaultValue={p.reserve}
                required
              />
            </Field>
            <Field label="Upcoming essential bills (₹)">
              <input
                name="bills"
                type="number"
                min="0"
                step="0.01"
                defaultValue={p.bills}
                required
              />
            </Field>
          </div>
          <Field label="Maximum I am willing to spend on travel (₹)">
            <input
              name="willingness"
              type="number"
              min="0"
              step="0.01"
              defaultValue={p.willingness}
              required
            />
          </Field>
          <Button disabled={busy}>
            <Save />
            {busy ? "Saving…" : "Save changes"}
          </Button>
          {message && (
            <p role="status" className="alert">
              {message}
            </p>
          )}
        </form>
        <aside className="savings-summary">
          <span className="stat-icon mint">
            <PiggyBank />
          </span>
          <h2>Your adventure fund</h2>
          <strong className="big-number">{money(f.savings)}</strong>
          <div className="budget-lines">
            <p>
              Existing savings <strong>{money(p.savings)}</strong>
            </p>
            <p>
              This month’s unspent <strong>+{money(Math.max(0, f.unspent))}</strong>
            </p>
            <p>
              Emergency reserve <strong>−{money(p.reserve)}</strong>
            </p>
            <p>
              Upcoming bills <strong>−{money(p.bills)}</strong>
            </p>
            <p>
              Willingness cap <strong>{money(p.willingness)}</strong>
            </p>
            <hr />
            <p>
              Safe travel budget <strong>{money(safe)}</strong>
            </p>
          </div>
          <p className="positive">
            <ShieldCheck size={16} />
            Your safety net comes first.
          </p>
          <Button asChild>
            <Link to="/discover">
              I have saved. Where can I go? <ArrowUpRight />
            </Link>
          </Button>
        </aside>
      </div>
    </>
  );
}
