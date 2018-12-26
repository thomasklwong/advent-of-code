#!/usr/bin/env node

const reader = require('../../../lib/reader');
const lineReader = reader.read();

const MS_IN_MINUTES = 60 * 1000;

class Record {
  static get re() {
    return /\[(.*)\] (.*)/g;
  }

  constructor(line) {
    const [, datetime, entry] = Record.re.exec(line);

    this.datetime = new Date(datetime);
    this.entry = entry;
  }

  toString() {
    return this.datetime.toISOString();
  }
}

const getMinRange = (from, to) => {
  const fromMin = from.getMinutes();
  const toOrig = to.getMinutes();
  const toMin = toOrig > fromMin ? toOrig : toOrig + 60;

  return [...Array(toMin - fromMin).keys()].map(v => (v + fromMin) % 60);
};

class Guard {
  constructor(id) {
    this.id = parseInt(id);
    this.sleptAt = null;
    this.sleptForInMin = 0;
    this.sleepPattern = [...Array(60).keys()].reduce((acc, min) => {
      acc[min] = 0;
      return acc;
    }, {});
  }

  sleep(datetime) {
    this.sleptAt = datetime;
  }

  wake(datetime) {
    const periodInMin = (datetime - this.sleptAt) / MS_IN_MINUTES;

    this.sleptForInMin += periodInMin;

    const sleepRange = getMinRange(this.sleptAt, datetime);

    sleepRange.forEach(min => {
      this.sleepPattern[min] += 1;
    });

    this.sleptAt = null;
  }
}

class Guards extends Map {
  getOrCreate(id) {
    if (!this.has(id)) {
      this.set(id, new Guard(id));
    }

    return this.get(id);
  }
}

const records = [];
const guards = new Guards();

lineReader.on('line', line => records.push(new Record(line)));
lineReader.on('close', () => {
  records.sort();

  const re = /Guard #(\d+) begins shift/;
  let guard;

  while (records.length) {
    const { datetime, entry } = records.shift();

    switch (entry) {
      case 'falls asleep': {
        guard.sleep(datetime);
        break;
      }

      case 'wakes up': {
        guard.wake(datetime);
        break;
      }

      default: {
        const [, id] = re.exec(entry);
        guard = guards.getOrCreate(id);
      }
    }
  }

  let lazyGuard;
  guards.forEach(guard => {
    console.log(`Guard ${guard.id} sleep for ${guard.sleptForInMin}`);

    if (!lazyGuard) {
      lazyGuard = guard;
      return;
    }

    if (guard.sleptForInMin > lazyGuard.sleptForInMin) {
      lazyGuard = guard;
    }
  });

  const { min } = Object.entries(lazyGuard.sleepPattern).reduce(
    (answer, [min, count]) => {
      if (answer.min === void 0 || count > answer.count) {
        return {
          min,
          count
        };
      }

      return answer;
    },
    {}
  );

  console.log(
    `Most Lazy Guard: ${lazyGuard.id} and most probable minute: ${min}
    answer ${lazyGuard.id * min}`
  );
});
