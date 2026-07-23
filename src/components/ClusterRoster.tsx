export interface RosterMember {
  characterId: string;
  name: string;
  house: string;
  color: string;
  wikiUrl?: string;
}

interface ClusterRosterProps {
  members: RosterMember[];
  hoveredId: string;
  locationName: string;
}

// Sizes are in the foreignObject's coordinate space (which the parent group
// counter-scales to a constant on-screen size). The single-character tooltip
// uses a 560px portrait; the roster mirrors it at 75% (420px).
const IMG = 420;
const IMG_RX = 38;
const ROW_VPAD = 22;
const ROW_H = IMG + ROW_VPAD * 2;
const GAP = 46;
const BORDER = 16;
const ROW_HPAD = 44;
const NAME = 104;
const HOUSE = 72;
const GOLD_BAR = 16;
const HEADER_H = 150;
const BOTTOM_PAD = 20;
const SCROLLBAR = 48;
const MAX_VISIBLE = 5;

// Roster of every character sharing a location, rendered as scrollable, clickable
// HTML inside a foreignObject so it keeps native scrolling and wiki links.
export default function ClusterRoster({ members, hoveredId, locationName }: ClusterRosterProps) {
  const maxNameLen = members.reduce((max, m) => Math.max(max, m.name.length), 0);
  const header = `${locationName} · ${members.length} here`.toUpperCase();
  const visibleRows = Math.min(members.length, MAX_VISIBLE);
  const scrolls = members.length > MAX_VISIBLE;

  const width = Math.max(
    BORDER + ROW_HPAD + IMG + GAP + maxNameLen * 68 + 40 + ROW_HPAD + (scrolls ? SCROLLBAR : 0),
    1400,
  );
  const listH = visibleRows * ROW_H;
  const height = GOLD_BAR + HEADER_H + listH + BOTTOM_PAD;

  const placeholder = (m: RosterMember) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=222222&color=ffffff&size=300&font-size=0.4`;

  return (
    <foreignObject x={0} y={-height / 2} width={width} height={height} style={{ overflow: 'visible' }}>
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          background: 'rgba(13,17,23,0.96)',
          border: '4px solid rgba(255,255,255,0.15)',
          borderRadius: '56px',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <style>{`
          .roster-scroll::-webkit-scrollbar { width: 46px; }
          .roster-scroll::-webkit-scrollbar-track { background: transparent; }
          .roster-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.22); border-radius: 24px; border: 12px solid transparent; background-clip: padding-box; }
          .roster-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.34); background-clip: padding-box; }
          .roster-row { text-decoration: none; }
          .roster-row:hover { background: rgba(255,255,255,0.07); }
        `}</style>

        <div style={{ height: `${GOLD_BAR}px`, background: '#C4A44A', opacity: 0.85 }} />
        <div
          style={{
            height: `${HEADER_H - 1}px`,
            display: 'flex',
            alignItems: 'center',
            padding: `0 ${ROW_HPAD + BORDER}px`,
            color: '#C4A44A',
            fontFamily: 'Cinzel, serif',
            fontWeight: 600,
            fontSize: `${82}px`,
            letterSpacing: '4px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            whiteSpace: 'nowrap',
          }}
        >
          {header}
        </div>

        <div className="roster-scroll" data-roster-scroll style={{ height: `${listH}px`, overflowY: scrolls ? 'auto' : 'hidden' }}>
          {members.map((m) => {
            const isHovered = m.characterId === hoveredId;
            const Row: any = m.wikiUrl ? 'a' : 'div';
            return (
              <Row
                key={m.characterId}
                className="roster-row"
                {...(m.wikiUrl ? { href: m.wikiUrl, target: '_blank', rel: 'noopener noreferrer' } : {})}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${GAP}px`,
                  height: `${ROW_H}px`,
                  boxSizing: 'border-box',
                  padding: `${ROW_VPAD}px ${ROW_HPAD}px`,
                  borderLeft: `${BORDER}px solid ${m.color}`,
                  background: isHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
                  cursor: m.wikiUrl ? 'pointer' : 'default',
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}characters/${m.characterId}.png`}
                  width={IMG}
                  height={IMG}
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement;
                    if (!t.dataset.fbk) { t.dataset.fbk = '1'; t.src = placeholder(m); }
                  }}
                  style={{ width: `${IMG}px`, height: `${IMG}px`, borderRadius: `${IMG_RX}px`, objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 600, fontSize: `${NAME}px`, color: '#fff', whiteSpace: 'nowrap' }}>
                    {m.name}
                  </div>
                  {m.house && m.house !== '—' && (
                    <div style={{ fontSize: `${HOUSE}px`, color: 'rgba(255,255,255,0.5)', marginTop: '14px', whiteSpace: 'nowrap' }}>
                      {m.house}
                    </div>
                  )}
                </div>
              </Row>
            );
          })}
        </div>
      </div>
    </foreignObject>
  );
}
