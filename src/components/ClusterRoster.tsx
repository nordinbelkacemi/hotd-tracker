export interface RosterMember {
  characterId: string;
  name: string;
  house: string;
  color: string;
}

interface ClusterRosterProps {
  members: RosterMember[];
  hoveredId: string;
  locationName: string;
}

// Single-character tooltip uses a 560px rounded-square portrait; the roster
// mirrors that look at 75% size, one row per co-located character.
const IMG = 420;
const IMG_RX = 38;
const ROW_H = 500;
const HEADER_H = 196;
const PAD_X = 70;
const PAD_Y = 64;
const TEXT_X = PAD_X + IMG + 64;
const NAME_SIZE = 106;
const HOUSE_SIZE = 74;

// SVG roster card listing every character sharing one location, each with a
// portrait matching the single-character tooltip. Rendered inside the hovered
// dot's counter-scaled group, so it keeps a constant on-screen size.
export default function ClusterRoster({ members, hoveredId, locationName }: ClusterRosterProps) {
  const label = (m: RosterMember) => (m.house && m.house !== '—' ? `${m.name} · ${m.house}` : m.name);
  const maxLabelLen = members.reduce((max, m) => Math.max(max, label(m).length), 0);
  const header = `${locationName} · ${members.length} here`.toUpperCase();

  const width = Math.max(TEXT_X + maxLabelLen * 56 + PAD_X, PAD_X * 2 + header.length * 46);
  const height = HEADER_H + members.length * ROW_H + PAD_Y;
  const top = -height / 2;
  const firstRowTop = top + HEADER_H;

  const placeholder = (m: RosterMember) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=222222&color=ffffff&size=300&font-size=0.4`;

  return (
    <g>
      <rect
        x={0}
        y={top}
        width={width}
        height={height}
        rx={56}
        fill="rgba(13,17,23,0.95)"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={4}
      />
      {/* Header */}
      <line x1={0} y1={top} x2={width} y2={top} stroke="#C4A44A" strokeWidth={20} strokeOpacity={0.85} />
      <text
        x={PAD_X}
        y={top + 122}
        fontSize={84}
        fill="#C4A44A"
        fontFamily="Cinzel, serif"
        fontWeight={600}
        letterSpacing={4}
      >
        {header}
      </text>

      {/* One row per co-located character */}
      {members.map((m, i) => {
        const rowTop = firstRowTop + i * ROW_H;
        const imgY = rowTop + (ROW_H - IMG) / 2;
        const centerY = rowTop + ROW_H / 2;
        const isHovered = m.characterId === hoveredId;
        return (
          <g key={m.characterId}>
            {isHovered && (
              <rect x={22} y={rowTop + 14} width={width - 44} height={ROW_H - 28} rx={40} fill="rgba(255,255,255,0.08)" />
            )}
            {/* Colour accent above the portrait, echoing the single tooltip's top line */}
            <line x1={PAD_X} y1={imgY - 26} x2={PAD_X + IMG} y2={imgY - 26} stroke={m.color} strokeWidth={16} strokeOpacity={0.9} />
            <clipPath id={`clip-roster-${m.characterId}`}>
              <rect x={PAD_X} y={imgY} width={IMG} height={IMG} rx={IMG_RX} />
            </clipPath>
            <image
              href={`${import.meta.env.BASE_URL}characters/${m.characterId}.png`}
              x={PAD_X}
              y={imgY}
              width={IMG}
              height={IMG}
              clipPath={`url(#clip-roster-${m.characterId})`}
              preserveAspectRatio="xMidYMid slice"
              onError={(e) => {
                e.currentTarget.setAttribute('href', placeholder(m));
              }}
            />
            <text x={TEXT_X} y={centerY - 4} fontSize={NAME_SIZE} fill="white" fontFamily="Cinzel, serif" fontWeight={600}>
              {m.name}
            </text>
            {m.house && m.house !== '—' && (
              <text x={TEXT_X} y={centerY + 108} fontSize={HOUSE_SIZE} fill="rgba(255,255,255,0.5)" fontFamily="Inter, sans-serif">
                {m.house}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
