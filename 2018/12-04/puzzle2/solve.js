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

  get mostlySleptAt() {
    return Object.entries(this.sleepPattern).reduce(
      (acc, [min, count]) => {
        if (count > acc.count) {
          return {
            min,
            count
          };
        }

        return acc;
      },
      {
        min: 0,
        count: 0
      }
    );
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
    const {
      id,
      mostlySleptAt: { min, count }
    } = guard;

    console.log(`Guard ${id} sleep most at min: ${min}, count: ${count}`);

    if (!lazyGuard) {
      lazyGuard = guard;
      return;
    }

    const {
      mostlySleptAt: { count: prevCount }
    } = lazyGuard;

    if (count > prevCount) {
      lazyGuard = guard;
    }
  });

  const {
    id,
    mostlySleptAt: { min, count }
  } = lazyGuard;

  console.log(`Lazy guard ${id} sleep most at min: ${min}, count: ${count}`);
  console.log(`Answer: ${id * min}`);
});
