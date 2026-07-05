const stroke = { stroke: '#1a1a1a', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

function Pawn({ fill }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="30" r="14" fill={fill} {...stroke} />
      <path d="M38 46 L62 46 L70 68 L30 68 Z" fill={fill} {...stroke} />
      <rect x="24" y="68" width="52" height="12" rx="2" fill={fill} {...stroke} />
    </svg>
  );
}

function Rook({ fill }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path
        d="M28 22 H36 V30 H44 V22 H56 V30 H64 V22 H72 V38 L64 46 V70 H36 V46 L28 38 Z"
        fill={fill}
        {...stroke}
      />
      <path d="M32 70 H68 V78 H32 Z" fill={fill} {...stroke} />
      <rect x="26" y="78" width="48" height="10" rx="2" fill={fill} {...stroke} />
    </svg>
  );
}

function Knight({ fill }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path
        d="M32 82 C28 68 30 58 26 50 C22 42 24 32 34 26 C40 22 44 24 46 20
           C48 16 54 16 56 20 C58 24 66 26 70 34 C74 42 70 48 74 54
           C78 60 76 68 70 70 C66 72 64 68 60 68 C56 68 54 72 54 76
           L56 82 Z"
        fill={fill}
        {...stroke}
      />
      <circle cx="42" cy="30" r="2.5" fill="#1a1a1a" />
      <rect x="26" y="82" width="48" height="8" rx="2" fill={fill} {...stroke} />
    </svg>
  );
}

function Bishop({ fill }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="14" r="5" fill={fill} {...stroke} />
      <path
        d="M50 22 C60 32 66 44 60 56 C56 64 56 68 62 72 L38 72
           C44 68 44 64 40 56 C34 44 40 32 50 22 Z"
        fill={fill}
        {...stroke}
      />
      <line x1="42" y1="42" x2="58" y2="50" stroke="#1a1a1a" strokeWidth="3" />
      <path d="M34 72 H66 V80 H34 Z" fill={fill} {...stroke} />
      <rect x="30" y="80" width="40" height="10" rx="2" fill={fill} {...stroke} />
    </svg>
  );
}

function Queen({ fill }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {[24, 38, 50, 62, 76].map((cx, i) => (
        <circle key={i} cx={cx} cy={i === 2 ? 16 : 24} r="6" fill={fill} {...stroke} />
      ))}
      <path d="M26 30 L74 30 L68 60 L32 60 Z" fill={fill} {...stroke} />
      <rect x="28" y="60" width="44" height="10" rx="2" fill={fill} {...stroke} />
      <rect x="24" y="82" width="52" height="8" rx="2" fill={fill} {...stroke} />
    </svg>
  );
}

function King({ fill }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="46" y="6" width="8" height="18" fill={fill} {...stroke} />
      <rect x="38" y="12" width="24" height="8" fill={fill} {...stroke} />
      <path d="M30 34 L70 34 L64 62 L36 62 Z" fill={fill} {...stroke} />
      <rect x="30" y="62" width="40" height="10" rx="2" fill={fill} {...stroke} />
      <rect x="24" y="82" width="52" height="8" rx="2" fill={fill} {...stroke} />
    </svg>
  );
}

const SHAPES = { p: Pawn, r: Rook, n: Knight, b: Bishop, q: Queen, k: King };
const LABELS = { p: 'Pawn', r: 'Rook', n: 'Knight', b: 'Bishop', q: 'Queen', k: 'King' };

// The array you asked for: 12 entries (6 piece types x 2 colors),
// each with an `Svg` component ready to drop into a board cell.
export const CHESS_PIECES = ['w', 'b'].flatMap((color) =>
  Object.keys(SHAPES).map((type) => ({
    id: `${color}${type}`,
    type,
    color,
    label: `${color === 'w' ? 'White' : 'Black'} ${LABELS[type]}`,
    Svg: (props) => SHAPES[type]({ fill: color === 'w' ? '#f5f5f0' : '#2b2b2b', ...props }),
  }))
);

// Quick lookup if you'd rather index by type+color instead of scanning the array,
// e.g. PIECE_MAP.w.n for the white knight.
export const PIECE_MAP = CHESS_PIECES.reduce((acc, piece) => {
  acc[piece.color] ??= {};
  acc[piece.color][piece.type] = piece.Svg;
  return acc;
}, {});
