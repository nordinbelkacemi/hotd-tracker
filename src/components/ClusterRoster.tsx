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

// SVG roster card listing every character sharing one location, each with a
// circular portrait. Rendered inside the hovered dot's counter-scaled group, so
// it keeps a constant on-screen size.
export default function ClusterRoster({ members, hoveredId, locationName }: ClusterRosterProps) {
  const ROW_H = 158;
  const HEADER_H = 176;
  const PAD_Y = 56;
  const PAD_X = 70;
  const AVATAR_R = 52;
  const TEXT_X = PAD_X + AVATAR_R * 2 + 44;
  const NAME_SIZE = 88;
  const HOUSE_SIZE = 56;

  const label = (m: RosterMember) => (m.house && m.house !== '—' ? `${m.name} · ${m.house}` : m.name);
  const maxLabelLen = members.reduce((max, m) => Math.max(max, label(m).length), 0);
  const header = `${locationName} · ${members.length} here`.toUpperCase();

  const width = Math.max(TEXT_X + maxLabelLen * 47 + PAD_X, PAD_X * 2 + header.length * 44);
  const height = HEADER_H + members.length * ROW_H + PAD_Y;
  const top = -height / 2;
  const firstRowCenter = top + HEADER_H + ROW_H / 2;

  const placeholder = (m: RosterMember) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=222222&color=ffffff&size=200&font-size=0.4`;

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
      {/* Gold accent + header */}
      <line x1={0} y1={top} x2={width} y2={top} stroke="#C4A44A" strokeWidth={20} strokeOpacity={0.85} />
      <text
        x={PAD_X}
        y={top + 116}
        fontSize={80}
        fill="#C4A44A"
        fontFamily="Cinzel, serif"
        fontWeight={600}
        letterSpacing={4}
      >
        {header}
      </text>
      <line x1={PAD_X} y1={top + HEADER_H - 12} x2={width - PAD_X} y2={top + HEADER_H - 12} stroke="rgba(255,255,255,0.1)" strokeWidth={3} />

      {/* One row per co-located character */}
      {members.map((m, i) => {
        const cy = firstRowCenter + i * ROW_H;
        const isHovered = m.characterId === hoveredId;
        const cx = PAD_X + AVATAR_R;
        return (
          <g key={m.characterId}>
            {isHovered && (
              <rect x={22} y={cy - ROW_H / 2 + 8} width={width - 44} height={ROW_H - 16} rx={30} fill="rgba(255,255,255,0.08)" />
            )}
            <clipPath id={`clip-roster-${m.characterId}`}>
              <circle cx={cx} cy={cy} r={AVATAR_R} />
            </clipPath>
            <image
              href={`${import.meta.env.BASE_URL}characters/${m.characterId}.png`}
              x={cx - AVATAR_R}
              y={cy - AVATAR_R}
              width={AVATAR_R * 2}
              height={AVATAR_R * 2}
              clipPath={`url(#clip-roster-${m.characterId})`}
              preserveAspectRatio="xMidYMid slice"
              onError={(e) => {
                e.currentTarget.setAttribute('href', placeholder(m));
              }}
            />
            {/* Colored ring keeps the faction/character colour association */}
            <circle cx={cx} cy={cy} r={AVATAR_R} fill="none" stroke={m.color} strokeWidth={isHovered ? 8 : 6} />
            <text x={TEXT_X} y={cy + 30} fontSize={NAME_SIZE} fontFamily="Inter, sans-serif">
              <tspan fill={isHovered ? '#ffffff' : 'rgba(255,255,255,0.82)'} fontWeight={isHovered ? 600 : 500}>
                {m.name}
              </tspan>
              {m.house && m.house !== '—' && (
                <tspan fill="rgba(255,255,255,0.4)" fontSize={HOUSE_SIZE}>{`  ·  ${m.house}`}</tspan>
              )}
            </text>
          </g>
        );
      })}
    </g>
  );
}
