# d3-local-query

Allison Hancock \<aahancoc@umich.edu\>

Run simple SQL `SELECT` statements on data in the format outputted by [d3.dsv](https://d3js.org/d3-dsv/).

## Installing

If you use NPM, `npm install d3-local-query`. Otherwise, download the [latest release](https://github.com/aahancoc/d3-local-query/releases/latest).

## API Reference

<a href="#local_query" name="local_query">#</a> <b>d3.local_query</b>(query, data): Returns `data` as filtered by the SQL statement `query`, in the format `SELECT [columns] (FROM [src]) (WHERE [condition])`.

## Limitations

As this is a very new project, there are some serious limitations.

- Only a single data source source is currently supported. The `FROM` statement has no effect.
- SELECT only allows you to choose columns. No other features are supported.
- The only conditional supported are `=`, `AND`, and `OR`.
- No `ORDER BY`, `GROUP BY`, etc. is currently supported
- Query is case-sensitive. Only all-caps are currently supported.
