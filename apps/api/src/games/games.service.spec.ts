import { GamesService } from './games.service';

describe('GamesService', () => {
  let gamesService: GamesService;

  beforeEach(() => {
    gamesService = new GamesService();
  });

  it('filters games by favorite team', () => {
    const response = gamesService.getGames({ favoriteTeam: 'LG' });

    expect(response.games).toHaveLength(4);
    expect(response.games.every((game) => game.favoriteTeam === 'LG')).toBe(true);
  });

  it('filters games by date and season year when provided', () => {
    const response = gamesService.getGames({
      favoriteTeam: 'LG',
      date: '2026-04-10',
      seasonYear: 2026,
    });

    expect(response.games).toEqual([
      expect.objectContaining({
        id: 'game-lg-2026-04-10',
        status: 'SCHEDULED',
      }),
    ]);
  });
});
