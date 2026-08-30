import { useDispatch, useSelector } from "react-redux";
import { PIECES_MAP_BLACK, PIECES_MAP_WHITE } from "../../utils/constants";
import { Chess, type Square } from "chess.js";
import { useMemo } from "react";
import type { RootState } from "../../store/store";
import { setLegalMoves, setSelectedSquare, clearSelectedSquare } from "../../features/chess.slice";
import { gameManager } from "../../game/gameManager";

const Board = () => {
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const { fen, blackPlayerId, whitePlayerId, turn, legalMoves, status, selectedSquare } = useSelector((state: RootState) => state.chess);
    const { id } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();

    const chess = useMemo(() => {
        return new Chess(fen);
    }, [fen]);

    const isUserHasBlackPieces = useMemo(() => {
        return id === blackPlayerId;
    }, [blackPlayerId, id]);

    const board = useMemo(() => {
        if (id === blackPlayerId) {
            return chess.board().slice().reverse().map((row) => row.reverse());
        }
        return chess.board();
    }, [chess, id, blackPlayerId]);

    const handleSelectSquare = (square: Square, color: "b" | "w") => {
        if (turn !== color || status !== 'playing') return;

        // Ensure the user can only select their own pieces
        if (color === 'w' && id !== whitePlayerId) return;
        if (color === 'b' && id !== blackPlayerId) return;

        dispatch(setSelectedSquare(square));

        const moves = chess.moves({
            square,
            verbose: true
        }).map((m) => m.to);

        dispatch(setLegalMoves(moves));
    };

    const getSquare = (colIndex: number, rowIndex: number) => {
        if (id === blackPlayerId) {
            return `${letters[7 - colIndex]}${rowIndex + 1}`;
        }

        return `${letters[colIndex]}${8 - rowIndex}`;
    }

    const handleMove = (from: Square, to: Square) => {
        gameManager.makeMove(from, to);
    }

    return (
        <div className="grid grid-cols-8 grid-rows-8 aspect-square w-full max-w-150 mx-auto rounded-xl overflow-hidden shadow-lg border-2 border-[#2c2c2a]">
            {board.map((row, rowIndex) => {
                return row.map((col, colIndex) => {
                    const isDark = (rowIndex + colIndex) % 2 === 1;
                    const squareColorClass = isDark ? 'bg-[#739552]' : 'bg-[#ebecd0]';
                    const textColorClass = isDark ? 'text-[#ebecd0]' : 'text-[#739552]';
                    const square = getSquare(colIndex, rowIndex);
                    const isLegalMove = legalMoves.includes(square as Square);

                    return (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`relative flex items-center justify-center ${squareColorClass} ${(col || isLegalMove) ? 'cursor-pointer' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();

                                // If the clicked square is a legal move from a previously selected piece
                                if (isLegalMove && selectedSquare) {
                                    handleMove(selectedSquare, square as Square);
                                    dispatch(clearSelectedSquare());
                                    dispatch(setLegalMoves([]));
                                    return;
                                }

                                // Otherwise, if clicking on a piece, select it
                                if (col && col.square) {
                                    handleSelectSquare(col.square, col.color);
                                } else {
                                    // Clicking an empty square clears selection
                                    dispatch(clearSelectedSquare());
                                    dispatch(setLegalMoves([]));
                                }
                            }}
                        >
                            {/* Rank labels on the first column */}
                            {colIndex === 0 && (
                                <span className={`absolute top-0.5 left-1 text-xs font-bold ${textColorClass}`}>
                                    {isUserHasBlackPieces ? rowIndex + 1 : 8 - rowIndex}
                                </span>
                            )}

                            {/* File labels on the last row */}
                            {rowIndex === 7 && (
                                <span className={`absolute bottom-0.5 right-1 text-xs font-bold ${textColorClass}`}>
                                    {isUserHasBlackPieces ? letters[8 - colIndex - 1] : letters[colIndex]}
                                </span>
                            )}

                            {col && (
                                <img
                                    src={col.color === 'w' ? PIECES_MAP_WHITE[col.type] : PIECES_MAP_BLACK[col.type]}
                                    alt={`${col.color}${col.type}`}
                                    className="w-full h-full object-contain drop-shadow-md relative z-10"
                                />
                            )}

                            {isLegalMove && !col && (
                                <div className="absolute w-[30%] h-[30%] bg-black/20 rounded-full pointer-events-none z-20" />
                            )}

                            {isLegalMove && col && (
                                <div className="absolute w-[85%] h-[85%] border-[5px] sm:border-[6px] border-black/20 rounded-full pointer-events-none z-20" />
                            )}
                        </div>
                    );
                });
            })}
        </div>
    );
};

export default Board;
