import { useDispatch, useSelector } from "react-redux"
import Navbar from "../../Pages/Home/Navbar"
import type { RootState } from "../../store/store"
import { useMemo, useEffect, useCallback } from "react";
import { Chess, type Square } from "chess.js";
import { PIECES_MAP_BLACK, PIECES_MAP_WHITE } from "../../utils/constants";
import {
    setFen, setGameOverModal, setLastMove, setLegalMoves,
    setResult, setSelectedSquare, setStatus, setTurn, setWinner,
    setPromotion, clearPromotion
} from "../../features/chess.slice";

const PROMOTION_PIECES = ["q", "r", "b", "n"] as const;
type PromotionPiece = typeof PROMOTION_PIECES[number];

const Board = () => {
    const { fen, legalMoves, selectedSquare, result, players } = useSelector((state: RootState) => state.chess);
    const promotion = players.promotion;
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

    const handeCheckGame = () => {
        if (chess.isCheckmate()) {
            const winner = chess.turn() === "b" ? "w" : "b";
            dispatch(setStatus("checkmate"));
            dispatch(setWinner(winner));
            dispatch(setGameOverModal(true));
            dispatch(setResult(winner === "b" ? "0-1" : "1-0"));
        } else if (chess.isStalemate()) {
            dispatch(setStatus("stalemate"));
            dispatch(setGameOverModal(true));
            dispatch(setResult("1/2 - 1/2"));
        } else if (chess.isThreefoldRepetition() || chess.isInsufficientMaterial() || chess.isDraw()) {
            dispatch(setStatus("draw"));
            dispatch(setGameOverModal(true));
            dispatch(setResult("1/2 - 1/2"));
        } else if (chess.isCheck()) {
            dispatch(setStatus("check"));
        } else {
            dispatch(setStatus("playing"));
        }
    };

    useEffect(() => {
        handeCheckGame();
    }, [chess]);

    // Check if a move from `from` to `to` is a promotion
    const isPromotionMove = (from: Square, to: Square): boolean => {
        const piece = chess.get(from);
        if (!piece || piece.type !== "p") return false;

        const toRank = to[1];
        // White pawn promoting on rank 8, black pawn promoting on rank 1
        if (piece.color === "w" && toRank === "8") return true;
        if (piece.color === "b" && toRank === "1") return true;
        return false;
    };

    // Execute a move with optional promotion piece
    const executeMove = useCallback((from: Square, to: Square, promotionPiece?: PromotionPiece) => {
        const move = chess.move({
            from,
            to,
            promotion: promotionPiece,
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
    }, [chess, dispatch]);

    // Handle user selecting a promotion piece from the dropdown
    const handlePromotionSelect = (piece: PromotionPiece) => {
        if (!promotion.from || !promotion.to) return;

        executeMove(promotion.from, promotion.to, piece);
        dispatch(clearPromotion());
    };

    // Cancel promotion (click outside / press Escape)
    const cancelPromotion = useCallback(() => {
        dispatch(clearPromotion());
        dispatch(setSelectedSquare(null));
        dispatch(setLegalMoves([]));
    }, [dispatch]);

    // Close promotion picker on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && promotion.open) {
                cancelPromotion();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [promotion.open, cancelPromotion]);

    const handleSelectSquare = (square: Square) => {
        // Don't allow moves if game is over
        if (result !== null) return;

        // If promotion picker is open, clicking anywhere else cancels it
        if (promotion.open) {
            cancelPromotion();
            return;
        }

        const clickedPiece = chess.get(square);

        // No piece selected yet — select own piece
        if (!selectedSquare) {
            if (clickedPiece?.color === chess.turn()) {
                selectSquare(square);
            }
            return;
        }

        // Clicked own piece — reselect
        if (clickedPiece?.color === chess.turn()) {
            selectSquare(square);
            return;
        }

        // Not a legal move target
        if (!legalMoves.includes(square)) {
            return;
        }

        // Check if this is a promotion move
        if (isPromotionMove(selectedSquare, square)) {
            // Open the promotion picker instead of making the move
            dispatch(setPromotion({
                from: selectedSquare,
                to: square,
                color: chess.turn()
            }));
            return;
        }

        // Normal move (no promotion)
        executeMove(selectedSquare, square);
    };

    // Calculate promotion overlay position
    const getPromotionSquares = (): { square: Square; index: number }[] => {
        if (!promotion.open || !promotion.to || !promotion.color) return [];

        const col = promotion.to.charCodeAt(0) - 97; // 'a' = 0, 'h' = 7
        const isWhite = promotion.color === "w";

        // chess.com style: dropdown from the promotion square going inward
        // White promotes on rank 8 (row 0), pieces go downward: ranks 8,7,6,5
        // Black promotes on rank 1 (row 7), pieces go upward: ranks 1,2,3,4
        return PROMOTION_PIECES.map((_, i) => {
            const rank = isWhite ? 8 - i : 1 + i;
            const squareName = `${String.fromCharCode(97 + col)}${rank}` as Square;
            const row = 8 - rank;
            return { square: squareName, index: row * 8 + col };
        });
    };

    const promotionSquares = getPromotionSquares();
    const promotionSquareNames = promotionSquares.map(ps => ps.square);
    const piecesMap = promotion.color === "b" ? PIECES_MAP_BLACK : PIECES_MAP_WHITE;

    return (
        <div className="h-screen w-screen overflow-y-auto">
            <Navbar />
            <div className="flex flex-col justify-center items-center mt-8 pb-12 px-4">
                <div className="relative grid grid-cols-8 grid-rows-8 w-full max-w-160 aspect-square border-4 border-[#333] shadow-2xl">
                    {
                        chess.board().flat().map((b, index) => {
                            const piece_image = b ? (b.color === 'b' ? PIECES_MAP_BLACK[b.type] : PIECES_MAP_WHITE[b.type]) : null;
                            const row = Math.floor(index / 8);
                            const col = index % 8;
                            const square = b?.square || `${['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][col]}${8 - row}` as Square;
                            const bgColor = (row + col) % 2 === 0 ? 'bg-board-light' : 'bg-board-dark';
                            const isLegalSquare = legalMoves.includes(square);
                            const shouldCursorPointer = b || isLegalSquare;

                            // Check if this square is part of the promotion overlay
                            const promotionIndex = promotionSquareNames.indexOf(square);
                            const isPromotionSquare = promotionIndex !== -1;

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleSelectSquare(square)}
                                    className={`relative w-full h-full flex justify-center items-center ${bgColor} ${shouldCursorPointer && 'cursor-pointer'}`}
                                >
                                    {/* Normal piece rendering — hide pieces behind the promotion overlay */}
                                    {
                                        piece_image && !isPromotionSquare &&
                                        <img src={piece_image} alt={`${b?.color} ${b?.type}`} className="w-4/5 h-4/5 object-contain" />
                                    }
                                    {/* Legal move dots — hide under promotion overlay */}
                                    {
                                        isLegalSquare && !isPromotionSquare &&
                                        <div className="absolute w-4 h-4 rounded-full bg-black/30">
                                        </div>
                                    }
                                    {/* Promotion piece option overlay */}
                                    {
                                        isPromotionSquare &&
                                        <div
                                            className="absolute inset-0 z-20 flex justify-center items-center bg-white/90 hover:bg-amber-200/80 cursor-pointer transition-colors duration-100 shadow-lg"
                                            style={{
                                                // First item gets rounded top (white) or bottom (black) corners
                                                borderRadius: promotionIndex === 0
                                                    ? (promotion.color === "w" ? "6px 6px 0 0" : "0 0 6px 6px")
                                                    : promotionIndex === 3
                                                        ? (promotion.color === "w" ? "0 0 6px 6px" : "6px 6px 0 0")
                                                        : "0",
                                                boxShadow: promotionIndex === 0 ? "0 -2px 10px rgba(0,0,0,0.3)" : "none",
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePromotionSelect(PROMOTION_PIECES[promotionIndex]);
                                            }}
                                        >
                                            <img
                                                src={piecesMap[PROMOTION_PIECES[promotionIndex]]}
                                                alt={PROMOTION_PIECES[promotionIndex]}
                                                className="w-4/5 h-4/5 object-contain drop-shadow-md"
                                            />
                                        </div>
                                    }
                                </div>
                            )
                        })
                    }

                    {/* Dimmed backdrop when promotion is open — click to cancel */}
                    {
                        promotion.open &&
                        <div
                            className="absolute inset-0 z-10 bg-black/40 cursor-pointer"
                            onClick={cancelPromotion}
                        />
                    }
                </div>
            </div>
        </div>
    )
}

export default Board