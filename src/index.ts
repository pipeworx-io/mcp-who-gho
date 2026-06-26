interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * WHO GHO MCP — World Health Organization Global Health Observatory (free, no auth)
 *
 * Tools:
 * - get_indicators: search/list health indicators
 * - get_data: get data values for a specific indicator, optionally by country and year
 * - list_countries: list all countries with ISO codes
 */


const BASE = 'https://ghoapi.azureedge.net/api';

// ── Types ─────────────────────────────────────────────────────────────

type GHOIndicator = {
  IndicatorCode?: string | null;
  IndicatorName?: string | null;
  Language?: string | null;
};

type GHODataValue = {
  Id?: number | null;
  IndicatorCode?: string | null;
  SpatialDim?: string | null;
  SpatialDimType?: string | null;
  TimeDim?: string | null;
  TimeDimType?: string | null;
  Dim1?: string | null;
  Dim1Type?: string | null;
  Dim2?: string | null;
  Dim2Type?: string | null;
  Dim3?: string | null;
  Dim3Type?: string | null;
  DataSourceDimType?: string | null;
  DataSourceDim?: string | null;
  Value?: string | null;
  NumericValue?: number | null;
  Low?: string | null;
  High?: string | null;
  Comments?: string | null;
  Date?: string | null;
  TimeDimensionValue?: string | null;
  TimeDimensionBegin?: string | null;
  TimeDimensionEnd?: string | null;
};

type GHOCountry = {
  Code?: string | null;
  Title?: string | null;
  Dimension?: string | null;
  ParentDimension?: string | null;
  ParentCode?: string | null;
  ParentTitle?: string | null;
};

type GHOResponse<T> = {
  value: T[];
};

// ── Tool definitions ──────────────────────────────────────────────────

const tools: McpToolExport['tools'] = [
  {
    name: 'get_indicators',
    description:
      'Search or list WHO Global Health Observatory indicators. Returns indicator codes and names. Use the indicator code with get_data to retrieve actual values. Example: get_indicators("life expectancy") or get_indicators("malaria")',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Optional search keyword to filter indicators (e.g., "mortality", "tuberculosis"). Omit to list all.' },
      },
    },
  },
  {
    name: 'get_data',
    description:
      'Get health data values for a WHO indicator code. Returns numeric values by country and year. Example: get_data("WHOSIS_000001", country="USA", year="2020"). Use get_indicators first to find the indicator code.',
    inputSchema: {
      type: 'object',
      properties: {
        indicator: { type: 'string', description: 'WHO indicator code (e.g., "WHOSIS_000001" for life expectancy)' },
        country: { type: 'string', description: 'ISO 3-letter country code (e.g., "USA", "GBR", "JPN")' },
        year: { type: 'string', description: 'Year to filter by (e.g., "2020")' },
      },
      required: ['indicator'],
    },
  },
  {
    name: 'list_countries',
    description:
      'Return all WHO-recognized countries with their 3-letter ISO code, display name, and parent region code. Use the ISO codes returned here as the country parameter in get_data (e.g., "USA", "GBR", "JPN").',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// ── callTool dispatcher ───────────────────────────────────────────────

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_indicators':
      return getIndicators(args.query as string | undefined);
    case 'get_data':
      return getData(
        args.indicator as string,
        args.country as string | undefined,
        args.year as string | undefined,
      );
    case 'list_countries':
      return listCountries();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ── Tool implementations ─────────────────────────────────────────────

async function getIndicators(query?: string) {
  let url = `${BASE}/Indicator`;
  if (query) {
    url += `?$filter=contains(tolower(IndicatorName),tolower('${query.replace(/'/g, "''")}'))`;
  }

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`WHO GHO API error: ${res.status}`);

  const data = (await res.json()) as GHOResponse<GHOIndicator>;

  const indicators = data.value
    .filter((i) => i.Language === 'EN' || !i.Language)
    .map((i) => ({
      code: i.IndicatorCode ?? null,
      name: i.IndicatorName ?? null,
    }));

  return {
    total: indicators.length,
    indicators: indicators.slice(0, 50),
  };
}

async function getData(indicator: string, country?: string, year?: string) {
  let url = `${BASE}/${indicator}`;
  const filters: string[] = [];

  if (country) filters.push(`SpatialDim eq '${country}'`);
  if (year) filters.push(`TimeDim eq '${year}'`);

  if (filters.length > 0) {
    url += `?$filter=${filters.join(' and ')}`;
  }

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`WHO GHO API error (${res.status}): indicator ${indicator} not found`);

  const data = (await res.json()) as GHOResponse<GHODataValue>;

  const values = data.value.map((v) => ({
    country: v.SpatialDim ?? null,
    year: v.TimeDim ?? null,
    value: v.NumericValue ?? v.Value ?? null,
    low: v.Low ?? null,
    high: v.High ?? null,
    dimension: v.Dim1 ?? null,
    dimension_type: v.Dim1Type ?? null,
    comments: v.Comments ?? null,
  }));

  return {
    indicator,
    total: values.length,
    returned: Math.min(values.length, 100),
    data: values.slice(0, 100),
  };
}

async function listCountries() {
  const res = await fetch(`${BASE}/DIMENSION/COUNTRY/DimensionValues`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`WHO GHO API error: ${res.status}`);

  const data = (await res.json()) as GHOResponse<GHOCountry>;

  const countries = data.value.map((c) => ({
    code: c.Code ?? null,
    name: c.Title ?? null,
    parent_code: c.ParentCode ?? null,
    parent_name: c.ParentTitle ?? null,
  }));

  return {
    total: countries.length,
    countries,
  };
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
