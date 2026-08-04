# WHO GHO — World Health Organization Global Health Observatory

The World Health Organization's GHO database. ~3,000 health-related indicators across 194 member states: mortality, disease prevalence, healthcare workforce, immunization, environmental health, NCDs, communicable diseases, demographics. The canonical international health-data source. Free, no auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Who Gho data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
