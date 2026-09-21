const wallpaper = { background: "url(/logicawallpaper.png) center / cover no-repeat" };

const card = {
  index: "01",
  title: "Development",
  text: "Join project teams shipping the LOGICA site and tools that serve our members on campus.",
};

/** Shared shell so only the box treatment differs between options. */
function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-xs tracking-widest text-white/60">{label}</h2>
      <div className="grid grid-cols-2 gap-8">{children}</div>
    </div>
  );
}

export default function CardLab() {
  return (
    <div style={wallpaper} className="min-h-screen space-y-16 p-10">
      <Frame label="A · SOLID INK, sharp corners, gold top rule — museum placard">
        <div className="relative h-64 bg-black">
          <span className="absolute inset-x-0 top-0 h-1 bg-signal" />
          <div className="flex h-full flex-col p-8">
            <span className="font-mono text-xs tracking-[0.3em] text-white/40">{card.index}</span>
            <h3 className="mt-6 text-2xl font-bold text-white">{card.title}</h3>
            <span className="mt-4 block h-px w-8 bg-signal" />
            <p className="mt-4 text-white/70">{card.text}</p>
          </div>
        </div>
        <div className="relative h-64 bg-black">
          <span className="absolute inset-x-0 top-0 h-1 bg-signal" />
          <div className="flex h-full flex-col p-8">
            <span className="font-mono text-xs tracking-[0.3em] text-white/40">02</span>
            <h3 className="mt-6 text-2xl font-bold text-white">Mentorship</h3>
            <span className="mt-4 block h-px w-8 bg-signal" />
            <p className="mt-4 text-white/70">New to computing? Learn from peers and mentors through workshops and study cohorts.</p>
          </div>
        </div>
      </Frame>

      <Frame label="B · SOLID PAPER, dark text, warm shadow — index card">
        <div className="flex h-64 flex-col rounded-sm bg-[#f4ede0] p-8 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
          <span className="font-mono text-xs tracking-[0.3em] text-black/35">{card.index}</span>
          <h3 className="mt-6 text-2xl font-bold text-black">{card.title}</h3>
          <span className="mt-4 block h-px w-8 bg-black/20" />
          <p className="mt-4 text-black/70">{card.text}</p>
        </div>
        <div className="flex h-64 flex-col rounded-sm bg-[#f4ede0] p-8 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
          <span className="font-mono text-xs tracking-[0.3em] text-black/35">02</span>
          <h3 className="mt-6 text-2xl font-bold text-black">Mentorship</h3>
          <span className="mt-4 block h-px w-8 bg-black/20" />
          <p className="mt-4 text-black/70">New to computing? Learn from peers and mentors through workshops and study cohorts.</p>
        </div>
      </Frame>

      <Frame label="C · INK + KEYLINE, thin gold frame — brass-and-glass label">
        <div className="flex h-64 flex-col border border-signal/60 bg-black p-8">
          <span className="font-mono text-xs tracking-[0.3em] text-signal/70">{card.index}</span>
          <h3 className="mt-6 text-2xl font-bold text-white">{card.title}</h3>
          <span className="mt-4 block h-px w-8 bg-signal/60" />
          <p className="mt-4 text-white/70">{card.text}</p>
        </div>
        <div className="flex h-64 flex-col border border-white/25 bg-black p-8">
          <span className="font-mono text-xs tracking-[0.3em] text-white/40">02</span>
          <h3 className="mt-6 text-2xl font-bold text-white">Mentorship</h3>
          <span className="mt-4 block h-px w-8 bg-white/25" />
          <p className="mt-4 text-white/70">New to computing? Learn from peers and mentors through workshops and study cohorts.</p>
        </div>
      </Frame>

      <Frame label="D · TORN PAPER CUTOUT, geometric zigzag edge — piece cut from the same collage">
        <div
          className="flex h-64 flex-col bg-[#f4ede0] p-8 shadow-[0_20px_44px_rgba(0,0,0,0.5)]"
          style={{
            clipPath:
              "polygon(0% 2%, 4% 0%, 9% 2%, 15% 0%, 21% 2%, 27% 0%, 33% 1%, 39% 0%, 45% 2%, 51% 0%, 57% 1%, 64% 0%, 70% 2%, 76% 0%, 82% 1%, 88% 0%, 94% 2%, 100% 0%, 100% 98%, 95% 100%, 90% 98%, 84% 100%, 78% 99%, 72% 100%, 66% 98%, 60% 100%, 54% 99%, 48% 100%, 42% 98%, 36% 100%, 30% 99%, 24% 100%, 18% 98%, 12% 100%, 6% 99%, 0% 100%)",
            transform: "rotate(-0.6deg)",
          }}
        >
          <span className="font-mono text-xs tracking-[0.3em] text-black/35">{card.index}</span>
          <h3 className="mt-6 text-2xl font-bold text-black">{card.title}</h3>
          <span className="mt-4 block h-px w-8 bg-black/20" />
          <p className="mt-4 text-black/70">{card.text}</p>
        </div>
        <div
          className="flex h-64 flex-col bg-black p-8 shadow-[0_20px_44px_rgba(0,0,0,0.5)]"
          style={{
            clipPath:
              "polygon(0% 0%, 6% 2%, 12% 0%, 18% 1%, 24% 0%, 30% 2%, 36% 0%, 42% 1%, 48% 0%, 54% 2%, 60% 0%, 66% 1%, 72% 0%, 78% 2%, 84% 0%, 90% 1%, 96% 0%, 100% 2%, 100% 100%, 94% 98%, 88% 100%, 82% 99%, 76% 100%, 70% 98%, 64% 100%, 58% 99%, 52% 100%, 46% 98%, 40% 100%, 34% 99%, 28% 100%, 22% 98%, 16% 100%, 10% 99%, 4% 100%, 0% 98%)",
            transform: "rotate(0.5deg)",
          }}
        >
          <span className="font-mono text-xs tracking-[0.3em] text-white/40">02</span>
          <h3 className="mt-6 text-2xl font-bold text-white">Mentorship</h3>
          <span className="mt-4 block h-px w-8 bg-white/25" />
          <p className="mt-4 text-white/70">New to computing? Learn from peers and mentors through workshops and study cohorts.</p>
        </div>
      </Frame>

      <Frame label="E · NO BOX — typography only, scrim gradient just behind the text">
        <div className="relative flex h-64 flex-col justify-end p-8">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}
          />
          <div className="relative">
            <span className="font-mono text-xs tracking-[0.3em] text-white/50">{card.index}</span>
            <h3 className="mt-4 text-2xl font-bold text-white">{card.title}</h3>
            <span className="mt-4 block h-px w-8 bg-signal" />
            <p className="mt-4 text-white/85">{card.text}</p>
          </div>
        </div>
        <div className="relative flex h-64 flex-col justify-end p-8">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}
          />
          <div className="relative">
            <span className="font-mono text-xs tracking-[0.3em] text-white/50">02</span>
            <h3 className="mt-4 text-2xl font-bold text-white">Mentorship</h3>
            <span className="mt-4 block h-px w-8 bg-signal" />
            <p className="mt-4 text-white/85">New to computing? Learn from peers and mentors through workshops and study cohorts.</p>
          </div>
        </div>
      </Frame>
    </div>
  );
}
