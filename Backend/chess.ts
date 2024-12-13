import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

// Init app & middleware
const app: express.Application = express();
app.use(bodyParser.json());

// In-memory store
type Game = {
    board: string[][],
    players: string[],
    currentTurn: string
};
const games: Record<string, Game> = {};

// Init empty chess board
const createEmptyBoard = (): string[][] => {
    const board: string[][] = Array.from({ length: 8 }, () => Array(8).fill(''));

    // Set initial positions for pawns
    for (let i = 0; i < 8; i++) {
        board[1][i] = 'P'; // White pawns
        board[6][i] = 'p'; // Black pawns
    }

    // Set initial positions for other pieces
    board[0] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    board[7] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

    return board;
};

// Validate a move
const isValidMove = (board: string[][], from: [number, number], to: [number, number], currentTurn: string): boolean => {
    const piece = board[from[0]][from[1]];
    if (!piece) return false;

    const isWhite = piece === piece.toUpperCase();
    if ((currentTurn === 'white' && !isWhite) || (currentTurn === 'black' && isWhite)) {
        return false;
    }

    // Add more validation logic here (piece-specific rules, check, etc.)
    return true;
};

// Create a new game
app.post('/new-game', (req: express.Request, res: express.Response): void => {
    const { player } = req.body as { player: string };
    const gameId = uuidv4();
    const board = createEmptyBoard();

    games[gameId] = { board, players: [player], currentTurn: 'white' };

    res.status(200).json({ gameId, message: 'New game created', board });
});


// Join an existing game
app.post('/join-game', (req: express.Request, res: express.Response) => {
    const { gameId, player } = req.body as { gameId: string, player: string };

    if (!games[gameId]) {
        return res.status(404).json({ message: 'Game not found' });
    }

    const game = games[gameId];

    if (game.players.length >= 2) {
        retn res.status(400).json({ message: 'Game already full' });
    }

    game.players.push(player);

    res.status(200).json({ message: 'Joined game', gameId });
});


// Make a move
app.post('/make-move', async (req: express.Request, res: express.Response): Promise<void> => {
    const { gameId, from, to } = req.body as { gameId: string, from: [number, number], to: [number, number] };

    if (!games[gameId]) {
        res.status(404).json({ message: 'Game not found' });
    }

    const game = games[gameId];
    const fromCoords: [number, number] = from;
    const toCoords: [number, number] = to;

    if (!isValidMove(game.board, fromCoords, toCoords, game.currentTurn)) {
        res.status(400).json({ message: 'Invalid move' });
    }

    const piece = game.board[fromCoords[0]][fromCoords[1]];
    game.board[fromCoords[0]][fromCoords[1]] = '';
    game.board[toCoords[0]][toCoords[1]] = piece;

    game.currentTurn = game.currentTurn === 'white' ? 'black' : 'white';

    res.status(200).json({ message: 'Move made', board: game.board, currentTurn: game.currentTurn });
});


// Get game state
app.get('/game/:gameId', (req: express.Request, res: express.Response): void => {
    const { gameId } = req.params;

    if (!games[gameId]) {
        res.status(404).json({ message: 'Game not found' });
    }

    const game = games[gameId];

    res.json({ board: game.board, players: game.players, currentTurn: game.currentTurn });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;