import { prisma } from "../lib/prisma";

const createChessGame = async (player1Id: string, player2Id: string): Promise<string | null> => {
    try {
        const whitePlayer = Math.random() > 0.5 ? player1Id : player2Id;
        const blackPlayer = whitePlayer === player1Id ? player2Id : player1Id;

        const game = await prisma.$transaction(async (tx) => {
            const game = tx.game.create({
                data: {
                    blackPlayerId: blackPlayer,
                    whitePlayerId: whitePlayer,
                    timeControl: 600000,
                    whiteTimeLeft: 600000,
                    blackTimeLeft: 600000,
                    gameType: "RAPID",
                    status: "PLAYING"
                }
            });

            return game;
        });

        return JSON.stringify(game);
    } catch (error) {
        return null;
    }
};

export {
    createChessGame
}