const crons = {
    everyMinute: '* * * * *',
    everyFiveMinutes: '*/5 * * * *',
    everyTenMinutes: '*/10 * * * *',
    everyHour: '0 * * * *',
    everyDayAtMidnight: '0 0 * * *',
    everySundayAtMidnight: '0 0 * * 0',
    everyMonthAtMidnight: '0 0 1 * *',
    everyWeekdayAtNoon: '0 12 * * 1-5',
    everyMondayAtNoon: '0 12 * * 1',
    everyFridayAtNoon: '0 12 * * 5',
    everyYearOnJanuaryFirst: '0 0 1 1 *'
  };