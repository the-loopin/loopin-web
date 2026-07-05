import Link from "next/link";
import { PageHeader, Panel, SiteShell } from "../site";

export default function PublicHomePage() {
  return (
    <SiteShell>
      <PageHeader
        title="Find local events and build small groups"
        subtitle="Loopin connects people around events, activities, groups, join requests and realtime chat."
        action={<Link className="primary-link" href="/events">Browse events</Link>}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Panel title="Discover">
          <p className="text-sm leading-6 text-slate-400">
            Filter events by city, category and free/paid status. Open an event and start a group around it.
          </p>
          <Link className="mt-4 inline-flex text-sm font-semibold text-cyan-300" href="/events">
            View events
          </Link>
        </Panel>
        <Panel title="Create groups">
          <p className="text-sm leading-6 text-slate-400">
            Create a group for an event, manage members, handle join requests and keep capacity under control.
          </p>
          <Link className="mt-4 inline-flex text-sm font-semibold text-cyan-300" href="/events">
            Start from an event
          </Link>
        </Panel>
        <Panel title="Chat realtime">
          <p className="text-sm leading-6 text-slate-400">
            Once a group exists, members can chat live through the backend websocket flow.
          </p>
          <Link className="mt-4 inline-flex text-sm font-semibold text-cyan-300" href="/login">
            Sign in first
          </Link>
        </Panel>
      </section>
    </SiteShell>
  );
}
