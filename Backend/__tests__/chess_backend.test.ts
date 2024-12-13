import request from 'supertest';
import app from '../chess';

describe('Chess Backend API', () => {
    let gameId: string;

    it('should create a new game', async () => {
        const response = await request(app)
            .post('/new-game')
            .send({ player: 'Player1' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('gameId');
        gameId = response.body.gameId;
    });

    it('should join an existing game', async () => {
        const response = await request(app)
            .post('/join-game')
            .send({ gameId, player: 'Player2' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Joined game');
    });
});
