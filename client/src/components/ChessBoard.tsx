import type { Square } from 'chess.js';
import { PIECE_MAP } from './chess-pieces'
import { useAppDispatch, useAppSelector } from '../store/hook';
import { makeMove, selectSquare } from '../features/chess.slice'
import type { SquarePiece } from '../types/inex';

const ChessBoard = () => {
    const files = "abcdefgh";

    const dispatch = useAppDispatch();
    const { board, legalMoves, game_status, turn, winner } = useAppSelector((state) => state.chess)

    const indexToSquare = (index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;

        return `${files[col]}${8 - row}` as Square
    }

    const handleSelectSquare = (square: SquarePiece, squareName: Square) => {
        const isMoveIntent = legalMoves.includes(squareName);
        if (isMoveIntent) {
            dispatch(makeMove(squareName));
        } else {
            dispatch(selectSquare(square));
        }
    }

    return (
        <div className='flex flex-col items-center'>
            <div className='flex flex-col gap-4'>
                <span>
                    Current Turn: {turn === 'w' ? 'White' : 'Black'}
                </span>
                <span>
                    Game Status: {game_status}
                </span>
                {winner && <span>
                    Winner: {winner === 'b' ? 'Black Wins' : 'White Wins'}
                </span>}
            </div>
            <div className="flex justify-center items-center h-screen w-full p-8">
                <div className="relative w-full max-w-[80vh] aspect-square sm:max-w-[600px]">
                    <div className="absolute top-0 bottom-0 -left-5 sm:-left-6 flex flex-col justify-around items-center text-gray-500 font-semibold select-none text-xs sm:text-sm">
                        {[8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                            <span key={r} className="flex-1 flex items-center">{r}</span>
                        ))}
                    </div>
                    <div className="absolute left-0 right-0 -bottom-5 sm:-bottom-6 flex justify-around items-center text-gray-500 font-semibold select-none text-xs sm:text-sm h-5 sm:h-6">
                        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((f) => (
                            <span key={f} className="flex-1 flex justify-center">{f}</span>
                        ))}
                    </div>

                    <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-sm overflow-hidden">
                        {board.map((square, index) => {
                            const row = Math.floor(index / 8)
                            const col = index % 8
                            const isLight = (row + col) % 2 === 0
                            const squareName = indexToSquare(index);
                            const isLegalMove = legalMoves.some((m) => m === squareName);

                            return (
                                <div
                                    key={index}
                                    className={`relative w-full h-full flex justify-center items-center ${isLight ? 'bg-[#ebecd0]' : 'bg-[#739552]'}`}
                                    onClick={() => handleSelectSquare(square, squareName)}
                                >
                                    {
                                        isLegalMove && !square &&
                                        <div className='h-4 w-4 bg-black/30 rounded-full'></div>
                                    }
                                    {
                                        isLegalMove && square &&
                                        <div className="absolute inset-1 rounded-full border-[6px] border-black/25" />
                                    }
                                    {square && (() => {
                                        const Piece = PIECE_MAP[square.color][square.type]
                                        return (
                                            <div className="cursor-pointer flex justify-center items-center w-full h-full">
                                                <Piece />
                                            </div>
                                        )
                                    })()}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChessBoard;
