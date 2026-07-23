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

// SVG roster card listing every character sharing one location. Rendered inside
// the hovered dot's counter-scaled group, so it keeps a constant on-screen size.
export default function ClusterRoster({ members, hoveredId, locationName }: ClusterRosterProps) {
  const ROW_H = 150;
  const HEADER_H = 180;
  const PAD_Y = 56;
  const PAD_X = 70;
  const SWATCH_GAP = 104;
  const NAME_SIZE = 94;
  const HOUSE_SIZE = 60;

  const label = (m: RosterMember) => (m.house && m.house !== '—' ? `${m.name} · ${m.house}` : m.name);
  const maxLabelLen = members.reduce((max, m) => Math.max(max, label(m).length), 0);
  const header = `${locationName} · ${members.length} here`.toUpperCase();

  const contentW = Math.max(maxLabelLen * 50 + SWATCH_GAP, header.length * 44);
  const width = PAD_X * 2 + contentW;
  const height = HEADER_H + members.length * ROW_H + PAD_Y;
  const top = -height / 2;
  const firstRowCenter = top + HEADER_H + ROW_H / 2;

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
        return (
          <g key={m.characterId}>
            {isHovered && (
              <rect x={22} y={cy - ROW_H / 2 + 10} width={width - 44} height={ROW_H - 20} rx={28} fill="rgba(255,255,255,0.08)" />
            )}
            <circle cx={PAD_X + 34} cy={cy} r={34} fill={m.color} stroke="rgba(255,255,255,0.7)" strokeWidth={4} />
            <text x={PAD_X + SWATCH_GAP} y={cy + 32} fontSize={NAME_SIZE} fontFamily="Inter, sans-serif">
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
