import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "CampusVoice gave us a way to protect our brand across every college without being in every meeting. It's the governance layer we've been missing.",
    author: "Dr. Sarah Mitchell",
    role: "VP of University Communications",
    institution: "Lakewood State University",
    initials: "SM",
  },
  {
    quote: "We cut our content creation time by 60% while actually improving brand consistency scores. Our admissions team went from dreading messaging season to looking forward to it.",
    author: "James Chen",
    role: "Director of Enrollment Marketing",
    institution: "Pacific Ridge University",
    initials: "JC",
  },
  {
    quote: "The Content DNA feature is a game-changer. It learned our voice from just a handful of samples, and now every department sounds like us — not like a chatbot.",
    author: "Maria Torres",
    role: "Chief Marketing Officer",
    institution: "Crestview College",
    initials: "MT",
  },
];

const partnerLogos = [
  "Lakewood State",
  "Pacific Ridge",
  "Crestview College",
  "Northfield University",
  "Summit Valley State",
];

export default function SocialProofSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(222_47%_11%)] relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(270_50%_20%_/_0.08),_transparent_60%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Partner logos strip */}
        <div className="text-center mb-14">
          <p className="text-white/30 text-xs font-medium uppercase tracking-widest mb-6">
            Early partners include
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {partnerLogos.map((name) => (
              <span
                key={name}
                className="text-white/20 text-sm font-semibold tracking-wide"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-white/10 mx-auto mb-14" />

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]"
            >
              <Quote className="w-6 h-6 text-[hsl(82_85%_55%_/_0.4)] mb-4" />
              <p className="text-white/70 text-sm leading-relaxed italic mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 border-t border-white/[0.06] pt-4">
                <div className="w-9 h-9 rounded-full bg-[hsl(270_70%_60%_/_0.2)] flex items-center justify-center text-[hsl(270_70%_65%)] text-xs font-bold">
                  {t.initials}
                </div>
                <div>
                  <p className="text-white/90 text-sm font-medium">{t.author}</p>
                  <p className="text-white/40 text-xs">
                    {t.role} · {t.institution}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
