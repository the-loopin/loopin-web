import Link from "next/link";
import { ArrowRight, CalendarDays, Compass, MapPin, Sparkles, UsersRound } from "lucide-react";
import { SiteShell } from "../../site";

const choices = [
  {
    href: "/events",
    label: "Events",
    eyebrow: "Organized plans",
    description:
      "Browse scheduled public gatherings like conferences, startup nights, workshops, social events, and city experiences.",
    icon: CalendarDays,
    accent: "choice-card-events",
    stats: ["Published schedules", "Groups before the event", "Organizer details"],
  },
  {
    href: "/activities",
    label: "Activities",
    eyebrow: "Casual meetups",
    description:
      "Find lighter plans created around shared interests: coffee chats, walks, board games, coding sessions, and outdoor circles.",
    icon: UsersRound,
    accent: "choice-card-activities",
    stats: ["Interest-first discovery", "Small group energy", "Quick join flow"],
  },
];

export default function ExplorePage() {
  return (
    <SiteShell>
      <section className="explore-choice-shell">
        <div className="explore-choice-hero">
          <span className="explore-kicker">
            <Compass size={16} /> Choose your direction
          </span>
          <h1>What kind of plan are you looking for?</h1>
          <p>
            Events are more structured and organizer-led. Activities are more casual and community-led. Either way,
            Loopin helps you find people before you arrive.
          </p>
        </div>

        <div className="explore-choice-grid">
          {choices.map((choice) => {
            const Icon = choice.icon;

            return (
              <Link className={`explore-choice-card ${choice.accent}`} href={choice.href} key={choice.href}>
                <div className="choice-card-topline">
                  <span>{choice.eyebrow}</span>
                  <ArrowRight size={20} />
                </div>

                <div className="choice-icon-wrap">
                  <Icon size={34} />
                </div>

                <h2>{choice.label}</h2>
                <p>{choice.description}</p>

                <div className="choice-stat-list">
                  {choice.stats.map((stat) => (
                    <span key={stat}>{stat}</span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="explore-helper-band">
          <div>
            <Sparkles size={18} />
            <strong>Not sure yet?</strong>
            <span>
              Start with Events if there is a fixed organizer or schedule. Start with Activities if the plan is mostly
              about finding people to do something with.
            </span>
          </div>
          <div>
            <MapPin size={18} />
            <strong>Map flow ready</strong>
            <span>Both pages can highlight locations, groups, and active plans with the same design language.</span>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
