# osu-pp-calculator
[![CodeFactor](https://img.shields.io/codefactor/grade/github/kionell/osu-pp-calculator)](https://www.codefactor.io/repository/github/kionell/osu-pp-calculator)
[![License](https://img.shields.io/github/license/kionell/osu-pp-calculator)](https://github.com/kionell/osu-pp-calculator/blob/master/LICENSE)
[![Package](https://img.shields.io/npm/v/@kionell/osu-pp-calculator)](https://www.npmjs.com/package/@kionell/osu-pp-calculator)


This is an advanced performance calculator for the game called osu!

- Written in TypeScript.
- Based on the osu!lazer source code.
- Supports converted beatmaps.
- Supports unsubmitted beatmaps via custom file URL.
- Can calculate beatmaps with custom clockrate and stats.
- Outputs strains for beatmaps and lifebar values for replays.
- Can be used for score simulation and replay calculation via replay URL.
- Uses latest difficulty and performance changes (as of October 2022).

## Installation

Add a new dependency to your project via npm:

```bash
npm install @kionell/osu-pp-calculator
```

## Dependencies

- [osu-classes](https://github.com/kionell/osu-classes.git) - Basic package for developing all osu! projects.
- [osu-parsers](https://github.com/kionell/osu-parsers.git) - Used for beatmap & replay parsing.
- [osu-downloader](https://github.com/kionell/osu-downloader.git) - Advanced osu! downloader for beatmaps and replays with file validation.
- [osu-standard-stable](https://github.com/kionell/osu-standard-stable.git) - Used for difficulty & performance calculation of the osu!standard beatmaps and scores.
- [osu-taiko-stable](https://github.com/kionell/osu-taiko-stable.git) - Used for difficulty & performance calculation of the osu!taiko beatmaps and scores.
- [osu-catch-stable](https://github.com/kionell/osu-catch-stable.git) - Used for difficulty & performance calculation of the osu!catch beatmaps and scores.
- [osu-mania-stable](https://github.com/kionell/osu-mania-stable.git) - Used for difficulty & performance calculation of the osu!mania beatmaps and scores.

## Beatmap calculation

Beatmaps can be calculated from beatmap ID or custom beatmap file URL. All files are downloaded automatically and cached by default. You can change path to the cache or disable caching at all. The more precalculated data you have the less you need to calculate using this calculator. In case if you pass precalculated difficulty attributes and beatmap information, this calculator will try to skip beatmap parsing and calculate performance attributes immediately. This will not work if you try to output beatmap strains tho. For beatmap strains you need to parse beatmap and calculate its difficulty.

### Beatmap calculation options

|        Name       |                                                                         Description                                                                         |                                                                                           Type                                                                                           | Optional |    Default value   |
|:-----------------:|:-----------------------------------------------------------------------------------------------------------------------------------------------------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:--------:|:------------------:|
| beatmapInfo       | Precalculated beatmap information.                                                                                                                          | [IBeatmapInfo](https://kionell.github.io/osu-classes/interfaces/IBeatmapInfo.html) \| [IJsonableBeatmapInfo](https://kionell.github.io/osu-classes/interfaces/IJsonableBeatmapInfo.html) |    Yes   |          -         |
| attributes        | Missing beatmap attributes that are required to simulate scores. This is used only for osu!catch which requires the number of fruits and droplets.          |                                           [IBeatmapAttributes](https://kionell.github.io/osu-pp-calculator/interfaces/IBeatmapAttributes.html)                                           |    Yes   |          -         |
| rulesetId         | Ruleset ID                                                                                                                                                  |                                                                                          number                                                                                          |    Yes   |   Beatmap ruleset  |
| ruleset           | Custom ruleset instance (for non-supported rulesets)                                                                                                        |                                                        [IRuleset](https://kionell.github.io/osu-classes/interfaces/IRuleset.html)                                                        |    Yes   |   Beatmap ruleset  |
| mods              | Mod combination or bitwise.                                                                                                                                 |                                                                                     string \| number                                                                                     |    Yes   |         NM         |
| difficulty        | Precalculated difficulty attributes.                                                                                                                        |                                        [IDifficultyAttributes](https://kionell.github.io/osu-pp-calculator/interfaces/IDifficultyAttributes.html)                                        |    Yes   |          -         |
| totalHits         | Total hits for gradual beatmap difficulty calculation. If it differs from the hit object count of a full beatmap then it will force difficulty calculation. |                                                                                          number                                                                                          |    Yes   | Beatmap total hits |
| strains           | Whether to output strain peaks or not.                                                                                                                      |                                                                                          boolean                                                                                         |    Yes   |        false       |
| accuracy          | List of accuracy for all game modes except osu!mania.                                                                                                       |                                                                                         number[]                                                                                         |    Yes   |    [95, 98, 100]   |
| beatmapId         | ID of the target beatmap.                                                                                                                                   |                                                                                          number                                                                                          |    Yes   |          -         |
| fileURL           | Custom file URL of the target beatmap.                                                                                                                      |                                                                                          string                                                                                          |    Yes   |          -         |
| savePath          | Path to the beatmap file save location.                                                                                                                     |                                                                                          string                                                                                          |    Yes   |      "./cache"     |
| cacheFiles        | Should files be cached on a disk after calculation?                                                                                                         |                                                                                          boolean                                                                                         |    Yes   |        true        |
| hash              | Hash of the target beatmap. Used to validate beatmap files. If wasn't specified then file will not be validated.                                            |                                                                                          string                                                                                          |    Yes   |          -         |
| approachRate      | Custom approach rate for the target beatmap in range [0-11].                                                                                                |                                                                                          number                                                                                          |    Yes   |     Beatmap AR     |
| overallDifficulty | Custom overall difficulty for the target beatmap in range [0-11].                                                                                           |                                                                                          number                                                                                          |    Yes   |     Beatmap OD     |
| circleSize        | Custom circle size for the target beatmap in range [0-11].                                                                                                  |                                                                                          number                                                                                          |    Yes   |     Beatmap CS     |
| clockRate         | Custom clock rate for the target beatmap in range [0.25-3].                                                                                                 |                                                                                          number                                                                                          |    Yes   |  Beatmap clockrate |
| bpm               | Custom BPM for the target beatmap in range [60-10000]. Can exceed clockrate limits.                                                                         |                                                                                          number                                                                                          |    Yes   |     Beatmap BPM    |
| lockApproachRate      | Prevents scaling of approach rate from difficulty adjusting mods.                                                                                                   |                                                                                          boolean                                                                                         |    Yes   |        false       |
| lockOverallDifficulty | Prevents scaling of overall difficulty from difficulty adjusting mods.                                                                                                   |                                                                                          boolean                                                                                         |    Yes   |        false       |
| lockCircleSize        | Prevents scaling of circle size from difficulty adjusting mods.                                                                                                   |                                                                                          boolean                                                                                         |    Yes   |        false       |

### How to use beatmap calculator

```js
import { BeatmapCalculator } from '@kionell/osu-pp-calculator'

const beatmapCalculator = new BeatmapCalculator();

const result = await beatmapCalculator.calculate({
  beatmapId: 1695382,     // Calculate beatmap with ID 1695382
  mods: 'HDDT',           // Calculate beatmap with HDDT mods.
  rulesetId: 3,           // Convert this beatmap to the osu!mania ruleset.
  accuracy: [90, 92, 99], // Calculate performance for 90%, 92% and 99% accuracy.
  strains: true,          // Output strain values (can be used for building strain graph).
  approachRate: 5,        // Set initial approach rate of the beatmap to 5 (not working for rulesets without AR).
  overallDifficulty: 6,   // Set initial overall difficulty of the beatmap to 6 (not working for rulesets without OD).
  clockRate: 2.2,         // Set clock rate of the beatmap to 2.2
  lockStats: true,        // Don't scale stats with clock rate.
  totalHits: 200,         // Calculate only first 200 objects of the beatmap. 
});
```

### Stringified beatmap calculation output

```json
{
  "beatmapInfo": {
    "id": 1695382,
    "beatmapsetId": 807850,
    "creatorId": 0,
    "creator": "Nevo",
    "favourites": 0,
    "passcount": 0,
    "playcount": 0,
    "status": -2,
    "title": "Mou Ii kai?",
    "artist": "THE ORAL CIGARETTES",
    "version": "Rain",
    "hittable": 822,
    "slidable": 0,
    "spinnable": 0,
    "holdable": 187,
    "length": 38.1390909090909,
    "bpmMin": 422.40000000000003,
    "bpmMax": 422.40000000000003,
    "bpmMode": 422.40000000000003,
    "circleSize": 7,
    "approachRate": 9.600000381469727,
    "overallDifficulty": 9.600000381469727,
    "drainRate": 6,
    "starRating": 0,
    "maxCombo": 1239,
    "isConvert": true,
    "deletedAt": null,
    "updatedAt": null,
    "md5": "a9e199c11e6e980a5b8e7fab577a61ca",
    "mods": "HDDT",
    "rulesetId": 3,
    "totalHits": 1009
  },
  "attributes": {
    "beatmapId": 1695382,
    "rulesetId": 3,
    "mods": "HDDT",
    "maxCombo": 1239,
    "clockRate": 2.2,
    "totalHits": 200,
    "maxFruits": 822,
    "maxDroplets": 0,
    "maxTinyDroplets": 0
  },
  "skills": [
    {
      "title": "Strain",
      "strainPeaks": [
        11.923872846058632,
        20.094559378244572,
        23.24491065116399,
        28.359139012121112,
        28.49445324083708,
        28.48941376652405,
        29.623584184490362,
        31.29989996954709,
        29.776584828405223,
        26.18698395475034,
        29.60093228910057,
        29.551000264044337,
        26.733776644631135,
        22.653368641459263,
        23.047484620797093,
        28.256876431500995,
        27.85502827688512,
        26.90389416382286,
        30.654131532118168,
        30.502875550841555,
        30.582869639525093
      ]
    }
  ],
  "difficulty": {
    "maxCombo": 0,
    "mods": "HDDT",
    "starRating": 4.622018505963288,
    "greatHitWindow": 34
  },
  "performance": [
    {
      "mods": "HDDT",
      "totalPerformance": 108.00834887422428,
      "difficultyPerformance": 13.501043609278035
    },
    {
      "mods": "HDDT",
      "totalPerformance": 131.07975251033213,
      "difficultyPerformance": 16.384969063791516
    },
    {
      "mods": "HDDT",
      "totalPerformance": 209.52252487309954,
      "difficultyPerformance": 26.190315609137443
    }
  ]
}
```

## Score calculation

You can use almost all options from beatmap calculator for score calculator as well. Score calculator can accept custom [IScoreInfo](https://kionell.github.io/osu-classes/interfaces/IScoreInfo.html) objects and replay file URLs. It is also possible to simulate FC scores by using "fix" option.

### Score calculation options

|        Name       |                                                    Description                                                   |                                                                                           Type                                                                                           | Optional |   Default value   |
|:-----------------:|:----------------------------------------------------------------------------------------------------------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:--------:|:-----------------:|
| beatmapId         | ID of the target beatmap.                                                                                        |                                                                                          number                                                                                          |    Yes   |         -         |
| fileURL           | Custom file URL of the target beatmap.                                                                           |                                                                                          string                                                                                          |    Yes   |         -         |
| rulesetId         | Ruleset ID                                                                                                       |                                                                                          number                                                                                          |    Yes   |  Beatmap ruleset  |
| ruleset           | Custom ruleset instance (for non-supported rulesets)                                                             |                                                        [IRuleset](https://kionell.github.io/osu-classes/interfaces/IRuleset.html)                                                        |    Yes   |  Beatmap ruleset  |
| beatmapInfo       | Precalculated beatmap information.                                                                               | [IBeatmapInfo](https://kionell.github.io/osu-classes/interfaces/IBeatmapInfo.html) \| [IJsonableBeatmapInfo](https://kionell.github.io/osu-classes/interfaces/IJsonableBeatmapInfo.html) |    Yes   |         -         |
| mods              | Mod combination or bitwise.                                                                                      |                                                                                     string \| number                                                                                     |    Yes   |         NM        |
| difficulty        | Precalculated difficulty attributes.                                                                             |                                        [IDifficultyAttributes](https://kionell.github.io/osu-pp-calculator/interfaces/IDifficultyAttributes.html)                                        |    Yes   |         -         |
| scoreInfo         | Target score.                                                                                                    | [IScoreInfo](https://kionell.github.io/osu-classes/interfaces/IScoreInfo.html) \| [IJsonableScoreInfo](https://kionell.github.io/osu-classes/interfaces/IJsonableScoreInfo.html)         |    Yes   |         -         |
| fix               | Should this score be unchoked or not?                                                                            |                                                                                          boolean                                                                                         |    Yes   |       false       |
| replayURL         | Custom replay file URL.                                                                                          |                                                                                          string                                                                                          |    Yes   |         -         |
| lifeBar           | Output replay life bar if replay file is present?                                                                |                                                                                          boolean                                                                                         |    Yes   |       false       |
| savePath          | Path to the replay file save location.                                                                           |                                                                                          string                                                                                          |    Yes   |     "./cache"     |
| hash              | Hash of the target beatmap. Used to validate beatmap files. If wasn't specified then file will not be validated. |                                                                                          string                                                                                          |    Yes   |         -         |
| attributes        | Missing beatmap attributes for score simulation.                                                                 | [IBeatmapInfo](https://kionell.github.io/osu-classes/interfaces/IBeatmapInfo.html) \| [IJsonableBeatmapInfo](https://kionell.github.io/osu-classes/interfaces/IJsonableBeatmapInfo.html) |    Yes   |         -         |
| countMiss         | Target score misses.                                                                                             |                                                                                          number                                                                                          |    Yes   |         0         |
| count50           | Target score 50's.                                                                                               |                                                                                          number                                                                                          |    Yes   |  Simulated by acc |
| count100          | Target score 100's.                                                                                              |                                                                                          number                                                                                          |    Yes   |  Simulated by acc |
| count300          | Target score 300's.                                                                                              |                                                                                          number                                                                                          |    Yes   |  Simulated by acc |
| countKatu         | Target score katu hits.                                                                                          |                                                                                          number                                                                                          |    Yes   |  Simulated by acc |
| countGeki         | Target score geki hits (not used right now).                                                                     |                                                                                          number                                                                                          |    Yes   |  Simulated by acc |
| accuracy          | Target score accuracy.                                                                                           |                                                                                          number                                                                                          |    Yes   |        100        |
| totalScore        | Target total score.                                                                                              |                                                                                          number                                                                                          |    Yes   |         0         |
| maxCombo          | Target max combo of a score.                                                                                     |                                                                                          number                                                                                          |    Yes   | Beatmap max combo |
| percentCombo      | Target percent of max combo of a score.                                                                          |                                                                                          number                                                                                          |    Yes   |        100        |
| approachRate      | Custom approach rate for the target beatmap.                                                                     |                                                                                          number                                                                                          |    Yes   |     Beatmap AR    |
| overallDifficulty | Custom overall difficulty for the target beatmap.                                                                |                                                                                          number                                                                                          |    Yes   |     Beatmap OD    |
| circleSize        | Custom circle size for the target beatmap.                                                                       |                                                                                          number                                                                                          |    Yes   |     Beatmap CS    |
| clockRate         | Custom clock rate for the target beatmap.                                                                        |                                                                                          number                                                                                          |    Yes   | Beatmap clockrate |
| bpm               | Custom BPM for the target beatmap in range [60-10000].                                                           |                                                                                          number                                                                                          |    Yes   |    Beatmap BPM    |
| lockApproachRate      | Prevents scaling of approach rate from difficulty adjusting mods.                                                                                                   |                                                                                          boolean                                                                                         |    Yes   |        false       |
| lockOverallDifficulty | Prevents scaling of overall difficulty from difficulty adjusting mods.                                                                                                   |                                                                                          boolean                                                                                         |    Yes   |        false       |
| lockCircleSize        | Prevents scaling of circle size from difficulty adjusting mods.                                                                                                   |                                                                                          boolean                                                                                         |    Yes   |        false       |

### Example of score calculation

```js
import { ScoreCalculator } from '@kionell/osu-pp-calculator'

const scoreCalculator = new ScoreCalculator();

const result = await scoreCalculator.calculate({
  beatmapId: 1695382,     // Calculate beatmap with ID 1695382
  mods: 'HDDT',           // Calculate beatmap with HDDT mods.
  rulesetId: 1,           // Convert this beatmap to the osu!taiko ruleset.
  accuracy: 85,           // Simulate score with 85% accuracy. Score simulator will try to approximate accuracy even with specified counts. 
  count100: 10,           // Simulate score with 10 goods.
  lifeBar: true,          // Output life bar of the replay (if present).
  approachRate: 5,        // Set initial approach rate of the beatmap to 5.
  overallDifficulty: 6,   // Set initial overall difficulty of the beatmap to 6.
  clockRate: 2.2,         // Set clock rate of the beatmap to 2.2
  lockStats: true,        // Don't scale stats with clock rate.
});
```

### Example of replay calculation

```js
import { ScoreCalculator } from 'osu-pp-calculator'

const scoreCalculator = new ScoreCalculator();

const result = await scoreCalculator.calculate({
  beatmapId: 1695382,     // Calculate beatmap with ID 1695382
  replayURL: "...",       // URL to the replay file (.osr). It will compare beatmap and replay by MD5.
  fix: true,              // Fix chokes on the target score.
});
```

### Stringified score calculation output

```json
{
  "scoreInfo": {
    "totalScore": 0,
    "maxCombo": 672,
    "passed": true,
    "perfect": true,
    "rank": "SH",
    "accuracy": 0.9925595238095238,
    "username": "osu!",
    "beatmapId": 1695382,
    "statistics": {
      "perfect": 0,
      "great": 662,
      "good": 0,
      "ok": 10,
      "meh": 0,
      "largeTickHit": 0,
      "smallTickMiss": 0,
      "smallTickHit": 0,
      "miss": 0,
      "largeBonus": 0,
      "largeTickMiss": 0,
      "smallBonus": 0,
      "ignoreHit": 0,
      "ignoreMiss": 0,
      "none": 0
    },
    "beatmapHashMD5": "a9e199c11e6e980a5b8e7fab577a61ca",
    "beatmap": null,
    "mods": "HDDT",
    "rulesetId": 1,
    "countGeki": 0,
    "count300": 662,
    "countKatu": 0,
    "count100": 10,
    "count50": 0,
    "countMiss": 0,
    "totalHits": 672
  },
  "difficulty": {
    "maxCombo": 672,
    "mods": "HDDT",
    "starRating": 8.790758863373132,
    "staminaDifficulty": 8.040083944297882,
    "rhythmDifficulty": 1.3278814870393163,
    "colourDifficulty": 3.211051542494555,
    "peakDifficulty": 8.498489486433925,
    "greatHitWindow": 14.545454545454545
  },
  "performance": {
    "mods": "HDDT",
    "totalPerformance": 927.6127529824629,
    "difficultyPerformance": 578.7134642344957,
    "accuracyPerformance": 226.66086943645078,
    "effectiveMissCount": 0
  }
}
```

## Documentation

Auto-generated documentation is available [here](https://kionell.github.io/osu-pp-calculator/).

## Contributing

This project is being developed personally by me on pure enthusiasm. If you want to help with development or fix a problem, then feel free to create a new pull request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](https://choosealicense.com/licenses/mit/) for details.
