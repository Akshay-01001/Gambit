import { useDraggable } from '@dnd-kit/react';
import type { Color, PieceSymbol } from 'chess.js';
import { PIECES_MAP_BLACK, PIECES_MAP_WHITE } from '../../utils/constants';

interface DragabblePieceProps {
    id: string;
    type: PieceSymbol;
    color: Color;
}

const DragabblePiece: React.FC<DragabblePieceProps> = ({ id, type, color }) => {
    const imgSrc =
        color === 'w' ? PIECES_MAP_WHITE[type] : PIECES_MAP_BLACK[type];
    const { ref } = useDraggable({
        id,
    });

    return (
        <img
            src={imgSrc}
            alt={`${color}${type}`}
            ref={ref}
            className="w-full h-full object-contain drop-shadow-md relative z-10"
        />
    );
};

export default DragabblePiece;
