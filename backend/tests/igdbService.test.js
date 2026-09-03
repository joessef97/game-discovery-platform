const igdb = require('../services/igdbService');

// Pure functions only — no network. These cover the title matching that decides
// which game a link opens, which is where "click Far Cry 6, get DOOM" came from.

describe('normaliseTitle', () => {
  it('lowercases and strips punctuation', () => {
    expect(igdb.normaliseTitle('The Witcher 3: Wild Hunt')).toBe('the witcher 3 wild hunt');
  });

  it('strips edition suffixes so a base game and its edition compare equal', () => {
    expect(igdb.normaliseTitle('Cyberpunk 2077: Ultimate Edition'))
      .toBe(igdb.normaliseTitle('Cyberpunk 2077'));
  });

  it("strips director's cut and GOTY markers", () => {
    expect(igdb.normaliseTitle("Ghost of Tsushima DIRECTOR'S CUT"))
      .toBe(igdb.normaliseTitle('Ghost of Tsushima'));
  });

  it('converts Roman numerals to digits (IGDB uses "III", the UI uses "3")', () => {
    expect(igdb.normaliseTitle("Baldur's Gate III"))
      .toBe(igdb.normaliseTitle("Baldur's Gate 3"));
    expect(igdb.normaliseTitle('Hades II')).toBe('hades 2');
  });

  it('does not corrupt words that merely contain numeral letters', () => {
    // 'ix' inside "phoenix" must not become "phoen9"
    expect(igdb.normaliseTitle('Phoenix Point')).toBe('phoenix point');
    expect(igdb.normaliseTitle('Civilization VI')).toBe('civilization 6');
  });

  it('leaves ambiguous single letters alone (Mega Man X is not Mega Man 10)', () => {
    expect(igdb.normaliseTitle('Mega Man X')).toBe('mega man x');
  });

  it('handles empty and nullish input', () => {
    expect(igdb.normaliseTitle('')).toBe('');
    expect(igdb.normaliseTitle(null)).toBe('');
    expect(igdb.normaliseTitle(undefined)).toBe('');
  });
});

describe('isEditionTitle', () => {
  it.each([
    ['Cyberpunk 2077: Ultimate Edition', true],
    ["Baldur's Gate 3: Deluxe Edition", true],
    ['Black Myth: Wukong Soundtrack', true],
    ['Elden Ring', false],
    ['Hollow Knight', false],
  ])('%s -> %s', (name, expected) => {
    expect(igdb.isEditionTitle(name)).toBe(expected);
  });
});

describe('pickBestNameMatch', () => {
  const g = (id, name) => ({ id, name });

  it('prefers an exact title over a fuzzy sibling', () => {
    const results = [
      g(1, 'Far Cry 6: Collapse'),
      g(2, 'Far Cry 6'),
      g(3, 'Far Cry 6: Insanity'),
    ];
    expect(igdb.pickBestNameMatch(results, 'Far Cry 6').id).toBe(2);
  });

  it('prefers the base game over an edition when both normalise equal', () => {
    // The real IGDB response: the base game uses a Roman numeral and the
    // editions sort first, which previously opened the wrong page.
    const results = [
      g(119171, "Baldur's Gate III"),
      g(279660, "Baldur's Gate 3: Deluxe Edition"),
      g(239449, "Baldur's Gate 3: Collector's Edition"),
    ];
    expect(igdb.pickBestNameMatch(results, "Baldur's Gate 3").id).toBe(119171);
  });

  it('does not just return the first result', () => {
    const results = [g(1, 'Something Unrelated'), g(2, 'Hollow Knight')];
    expect(igdb.pickBestNameMatch(results, 'Hollow Knight').id).toBe(2);
  });

  it('returns null when nothing is close enough, rather than guessing', () => {
    // This is the important one: returning an arbitrary hit is what made a bad
    // lookup silently open an unrelated game instead of falling through.
    const results = [g(1, 'Stardew Valley'), g(2, 'Terraria')];
    expect(igdb.pickBestNameMatch(results, 'Grand Theft Auto VI')).toBeNull();
  });

  it('matches when the wanted title has a subtitle the result lacks', () => {
    const results = [g(1, 'The Witcher 3')];
    expect(igdb.pickBestNameMatch(results, 'The Witcher 3: Wild Hunt').id).toBe(1);
  });

  it('handles an empty candidate list', () => {
    expect(igdb.pickBestNameMatch([], 'Anything')).toBeNull();
  });

  it('handles an empty wanted title', () => {
    expect(igdb.pickBestNameMatch([g(1, 'Elden Ring')], '')).toBeNull();
  });
});

describe('getESRBRating', () => {
  // IGDB replaced age_ratings.category/.rating with .organization/.rating_category.
  // Querying the old fields returned nothing, so every game reported "RP".
  const ESRB = 1;

  it('reads the ESRB entry using the current field names', () => {
    expect(igdb.getESRBRating([{ organization: ESRB, rating_category: 6 }])).toBe('M');
    expect(igdb.getESRBRating([{ organization: ESRB, rating_category: 4 }])).toBe('E10+');
    expect(igdb.getESRBRating([{ organization: ESRB, rating_category: 3 }])).toBe('E');
  });

  it('ignores other rating organisations (PEGI, USK, ...)', () => {
    const ratings = [
      { organization: 2, rating_category: 5 }, // PEGI
      { organization: ESRB, rating_category: 7 }, // ESRB: AO
    ];
    expect(igdb.getESRBRating(ratings)).toBe('AO');
  });

  it('falls back to RP when there is no ESRB entry', () => {
    expect(igdb.getESRBRating([{ organization: 3, rating_category: 2 }])).toBe('RP');
    expect(igdb.getESRBRating([])).toBe('RP');
  });
});

describe('formatGameData', () => {
  it('normalises an IGDB record into the app\'s internal shape', () => {
    const out = igdb.formatGameData({
      id: 1022,
      name: 'The Legend of Zelda',
      cover: { url: '//images.igdb.com/igdb/image/upload/t_thumb/co1uii.jpg' },
      first_release_date: 508291200,
      rating: 80.5,
      genres: [{ name: 'Adventure' }],
      platforms: [{ name: 'NES' }],
      summary: 'A classic.',
    });

    expect(out.id).toBe(1022);
    expect(out.name).toBe('The Legend of Zelda');
    expect(out.background_image).toMatch(/^https:/);       // protocol-relative URL fixed
    expect(out.background_image).toContain('t_cover_big');  // upscaled from t_thumb
    expect(out.rating).toBeCloseTo(8.05);                   // 0-100 -> 0-10
    expect(out.genres).toEqual([{ name: 'Adventure' }]);
    expect(out.platforms).toEqual([{ platform: { name: 'NES' } }]);
    expect(out.description_raw).toBe('A classic.');
  });

  it('tolerates a sparse record without throwing', () => {
    const out = igdb.formatGameData({ id: 1, name: 'Unknown' });
    expect(out.background_image).toBeNull();
    expect(out.released).toBeNull();
    expect(out.rating).toBeNull();
    expect(out.genres).toEqual([]);
    expect(out.screenshots).toEqual([]);
  });
});
