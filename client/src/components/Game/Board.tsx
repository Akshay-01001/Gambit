import { useSelector } from "react-redux";
import { PIECES_MAP_BLACK, PIECES_MAP_WHITE } from "../../utils/constants";
import { Chess } from "chess.js";
import { useMemo } from "react";
import type { RootState } from "../../store/store";

const Board = () => {
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    const { fen } = useSelector((state: RootState) => state.chess)

    const chess = useMemo(() => {
        return new Chess(fen);
    }, [fen]);

    return (
        <div className="grid grid-cols-8 grid-rows-8 aspect-square w-full max-w-150 mx-auto rounded-xl overflow-hidden shadow-lg border-2 border-[#2c2c2a]">
            {chess.board().map((row, rowIndex) => {
                return row.map((col, colIndex) => {
                    const isDark = (rowIndex + colIndex) % 2 === 1;
                    const squareColorClass = isDark ? 'bg-[#739552]' : 'bg-[#ebecd0]';
                    const textColorClass = isDark ? 'text-[#ebecd0]' : 'text-[#739552]';
                    const square = `${letters[colIndex]}${8 - rowIndex}`;

                    return (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`relative flex items-center justify-center ${squareColorClass} ${col && 'cursor-pointer'}`}
                        >
                            {/* Rank labels on the first column */}
                            {colIndex === 0 && (
                                <span className={`absolute top-0.5 left-1 text-xs font-bold ${textColorClass}`}>
                                    {8 - rowIndex}
                                </span>
                            )}

                            {/* File labels on the last row */}
                            {rowIndex === 7 && (
                                <span className={`absolute bottom-0.5 right-1 text-xs font-bold ${textColorClass}`}>
                                    {letters[colIndex]}
                                </span>
                            )}

                            {col && (
                                <img
                                    src={col.color === 'w' ? PIECES_MAP_WHITE[col.type] : PIECES_MAP_BLACK[col.type]}
                                    alt={`${col.color}${col.type}`}
                                    className="w-full h-full object-contain drop-shadow-md"
                                />
                            )}
                        </div>
                    );
                });
            })}
        </div>
    );
};

export default Board;
