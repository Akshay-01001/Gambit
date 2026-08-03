import { useDispatch, useSelector } from "react-redux"
import Navbar from "../../Pages/Home/Navbar"
import type { RootState } from "../../store/store"
import { useMemo } from "react";
import { Chess, type Square } from "chess.js";
import { PIECES_MAP_BLACK, PIECES_MAP_WHITE } from "../../utils/constants";
import { setFen, setLastMove, setLegalMoves, setSelectedSquare, setTurn } from "../../features/chess.slice";

const Board = () => {
    const { fen, legalMoves, selectedSquare } = useSelector((state: RootState) => state.chess);
    const dispatch = useDispatch();

    const chess = useMemo(() => {
        return new Chess(fen)
    }, [fen]);

    const selectSquare = (square: Square) => {
        dispatch(setSelectedSquare(square));

        dispatch(
            setLegalMoves(
                chess.moves({
                    square,
                    verbose: true,
                }).map((m) => m.to)
            )
        );
    };

    const handleSelectSquare = (square: Square) => {
        const clickedPiece = chess.get(square);

        if (!selectedSquare) {
            if (clickedPiece?.color === chess.turn()) {
                selectSquare(square);
            }
            return;
        }

        if (clickedPiece?.color === chess.turn()) {
            selectSquare(square);
            return;
        }

        if (!legalMoves.includes(square)) {
            console.log("NOT A LEGAL MOVE")
            return;
        }

        const move = chess.move({
            from: selectedSquare,
            to: square
        });

        if (!move) return;

        dispatch(setFen(chess.fen()));
        dispatch(setLastMove({
            from: move.from,
            to: move.to
        }));
        dispatch(setTurn(chess.turn()));
        dispatch(setSelectedSquare(null));
        dispatch(setLegalMoves([]));
    };

    return (
        <div className="h-screen w-screen overflow-y-auto">
            <Navbar />
            <div className="flex justify-center items-center mt-8 pb-12 px-4">
                <div className="grid grid-cols-8 grid-rows-8 w-full max-w-160 aspect-square border-4 border-[#333] shadow-2xl">
                    {
                        chess.board().flat().map((b, index) => {
                            const piece_image = b ? (b.color === 'b' ? PIECES_MAP_BLACK[b.type] : PIECES_MAP_WHITE[b.type]) : null;
                            const row = Math.floor(index / 8);
                            const col = index % 8;
                            const square = b?.square || `${['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][col]}${8 - row}` as Square;
                            const bgColor = (row + col) % 2 === 0 ? 'bg-board-light' : 'bg-board-dark';
                            const isLegalSquare = legalMoves.includes(square);
                            const shouldCursorPointer = b || isLegalSquare

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleSelectSquare(square)}
                                    className={`relative w-full h-full flex justify-center items-center ${bgColor} ${shouldCursorPointer && 'cursor-pointer'}`}
                                >
                                    {
                                        piece_image &&
                                        <img src={piece_image} alt={`${b?.color} ${b?.type}`} className="w-4/5 h-4/5 object-contain" />
                                    }
                                    {
                                        isLegalSquare &&
                                        <div className="absolute w-4 h-4 rounded-full bg-black/30">
                                        </div>
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default Board