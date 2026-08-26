# WHO GHO — World Health Organization Global Health Observatory

The World Health Organization's GHO database. ~3,000 health-related indicators across 194 member states: mortality, disease prevalence, healthcare workforce, immunization, environmental health, NCDs, communicable diseases, demographics. The canonical international health-data source. Free, no auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Why this matters for AI agents

For international comparisons of health indicators or country-level public-health snapshots, WHO GHO is the source. Where [CDC](/docs/reference/cdc) is US-focused, WHO is global. Pair with [World Bank](/docs/reference/worldbank) (development indicators) and [IMF](/docs/reference/imf) (macro) for full country-level analysis.

Common flows:

- **Country indicator.** "Life expectancy in Brazil?" → indicator + country query.
- **Cross-country comparison.** Same indicator across multiple countries.
- **Time series.** Indicator over years for trend analysis.
- **Indicator browse.** "What does WHO publish on diabetes?" → search the indicator catalog.

## Auth

None. WHO GHO is fully public, free.

## Indicator categories

Major categories (each with dozens to hundreds of indicators):

- Mortality and life expectancy
- Communicable diseases (HIV, TB, malaria, COVID-19, vaccine-preventable)
- Non-communicable diseases (cardiovascular, cancer, diabetes, mental health)
- Maternal and child health
- Health workforce (physicians, nurses, beds per 1000)
- Environmental health (air pollution, water/sanitation access)
- Health systems financing
- Risk factors (tobacco, alcohol, BMI, blood pressure)

## Common pitfalls

- **Country reporting quality varies.** Wealthy countries report comprehensively; lower-income countries have data gaps and longer lags. Some indicators are WHO-modeled estimates filling country reporting gaps.
- **Disaggregation availability.** "Indicator X for country Y" may not break down by sex, age, or urban/rural. Check whether the disaggregation you want exists before building queries that depend on it.
- **Definition shifts.** WHO occasionally revises indicator methodology (e.g., changing definition of "stunting" cut-points). Long time series across methodology changes need annotation.
- **Lag.** Most WHO data lags 1-3 years. Recent year may have only modeled estimates. For real-time outbreak data, use WHO's separate disease-surveillance feeds.
- **Country naming.** WHO uses ISO 3-letter codes. Some politically-disputed entities (Taiwan, Palestine, Kosovo) have inconsistent treatment in headline data; check coverage explicitly.
- **Population denominator.** Per-capita rates are usually computed against UN population estimates. Different sources (UN vs. national stats) can differ slightly, especially for fast-growing populations.
- **WHO regions.** WHO groups countries into 6 regions (Africa, Americas, Eastern Mediterranean, Europe, Southeast Asia, Western Pacific). These don't match World Bank or other regional groupings.

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "who-gho": {
      "url": "https://gateway.pipeworx.io/who-gho/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/who-gho/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Who Gho data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
