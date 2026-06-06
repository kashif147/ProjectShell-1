/** Client-side aggregations for workplace breakdown (fallback when API fields missing). */

export function buildOfficialSummaryFromRegions(regions = []) {
  const groups = new Map();
  for (const section of regions) {
    for (const row of section.rows || []) {
      const key =
        row.official?.userId || row.official?.initials || "unknown";
      if (!groups.has(key)) {
        groups.set(key, {
          official: { ...row.official },
          workplaceCount: 0,
          totalMembersCurrent: 0,
          momAbsolute: 0,
          yoyAbsolute: 0,
        });
      }
      const g = groups.get(key);
      g.workplaceCount += 1;
      const current =
        row.monthlyCounts?.[row.monthlyCounts.length - 1]?.count ?? 0;
      g.totalMembersCurrent += current;
      g.momAbsolute += row.mom?.absolute ?? 0;
      g.yoyAbsolute += row.yoy?.absolute ?? 0;
    }
  }

  return [...groups.values()]
    .map((g) => {
      const momPrior = g.totalMembersCurrent - g.momAbsolute;
      const yoyPrior = g.totalMembersCurrent - g.yoyAbsolute;
      const momPercent =
        momPrior === 0
          ? g.momAbsolute === 0
            ? 0
            : 100
          : Math.round((g.momAbsolute / momPrior) * 1000) / 10;
      const yoyPercent =
        yoyPrior === 0
          ? g.yoyAbsolute === 0
            ? 0
            : 100
          : Math.round((g.yoyAbsolute / yoyPrior) * 1000) / 10;
      return {
        official: g.official,
        workplaceCount: g.workplaceCount,
        totalMembersCurrent: g.totalMembersCurrent,
        mom: { absolute: g.momAbsolute, percent: momPercent },
        yoy: { absolute: g.yoyAbsolute, percent: yoyPercent },
      };
    })
    .sort((a, b) => b.totalMembersCurrent - a.totalMembersCurrent);
}

export function buildTrendSeriesFromRegions(regions = [], periodColumns = []) {
  const orgMonthlyTotals = periodColumns.map(({ year, month, asOfDate, label }) => ({
    year,
    month,
    asOfDate,
    label,
    count: regions.reduce(
      (sum, section) =>
        sum +
        (section.rows || []).reduce(
          (rowSum, row) =>
            rowSum +
            (row.monthlyCounts?.find(
              (c) => c.year === year && c.month === month,
            )?.count ?? 0),
          0,
        ),
      0,
    ),
  }));

  const endCol = periodColumns[periodColumns.length - 1];
  const topWorkplaces = regions
    .flatMap((section) =>
      (section.rows || []).map((row) => ({
        workLocation: row.workLocation,
        region: row.region,
        currentCount:
          row.monthlyCounts?.find(
            (c) => c.year === endCol?.year && c.month === endCol?.month,
          )?.count ?? 0,
      })),
    )
    .sort((a, b) => b.currentCount - a.currentCount)
    .slice(0, 10);

  const allRows = regions.flatMap((s) => s.rows || []);
  const gainers = [...allRows]
    .filter((r) => (r.mom?.absolute ?? 0) > 0)
    .sort((a, b) => (b.mom?.absolute ?? 0) - (a.mom?.absolute ?? 0))
    .slice(0, 5)
    .map((m) => ({
      workLocation: m.workLocation,
      region: m.region,
      momAbsolute: m.mom?.absolute ?? 0,
    }));
  const losers = [...allRows]
    .filter((r) => (r.mom?.absolute ?? 0) < 0)
    .sort((a, b) => (a.mom?.absolute ?? 0) - (b.mom?.absolute ?? 0))
    .slice(0, 5)
    .map((m) => ({
      workLocation: m.workLocation,
      region: m.region,
      momAbsolute: m.mom?.absolute ?? 0,
    }));

  return { orgMonthlyTotals, topWorkplaces, movers: { gainers, losers } };
}
