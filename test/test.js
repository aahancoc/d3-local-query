import {csvParse} from "d3-dsv";
import {expect} from "chai"
import fs from "fs";
import query, * as d3_lq from "../index.js";


describe('tokenize', function() {
	it('Handles statements with SELECT, FROM, and WHERE', function() {
		const tests = new Map([
			[
				"SELECT * FROM _ WHERE true",
				{ cols: ['*'], srcs: ['_'], cond: 'true' }
			], [
				"SELECT aa, bx, c FROM 1, two WHERE a == 3",
				{ cols: ['aa', 'bx', 'c'], srcs: ['1', 'two'], cond: 'a == 3' }
			],
		]);
		for (let [query, expected] of tests) {
			expect(d3_lq.tokenize(query), query).to.deep.equal(expected);
		}
	});

	it('Handles statements with only SELECT and WHERE', function() {
		const tests = new Map([
			[
				"SELECT * WHERE true",
				{ cols: ['*'], srcs: [], cond: 'true' }
			], [
				"SELECT aa, bx, c WHERE a == 3",
				{ cols: ['aa', 'bx', 'c'], srcs: [], cond: 'a == 3' }
			],
		]);
		for (let [query, expected] of tests) {
			expect(d3_lq.tokenize(query), query).to.deep.equal(expected);
		}
	});
});

describe('filter_cols', function() {
	it('Pass through data unchanged on `SELECT *`', function() {
		const df = [{'a': 1, 'b': 2, 'c': 3}, {'a': 2, 'b': 1, 'c': 0}];
		const tests = new Map([
			[
				{ cols: ['*'], data: df },
				[{'a': 1, 'b': 2, 'c': 3}, {'a': 2, 'b': 1, 'c': 0}]
			]
		]);
		for (let [input, expected] of tests) {
			expect(d3_lq.filter_cols(input.cols, input.data), input.cols)
			.to.deep.equal(expected);
		}
	});

	it('Selects specific columns', function() {
		const df = [{'a': 1, 'b': 2, 'c': 3}, {'a': 2, 'b': 1, 'c': 0}];
		const tests = new Map([
			[
				{ cols: ['a'], data: df },
				[{'a': 1}, {'a': 2}]
			], [
				{ cols: ['b', 'c'], data: df },
				[{'b': 2, 'c': 3}, {'b': 1, 'c': 0}]
			]
		]);
		for (let [input, expected] of tests) {
			expect(d3_lq.filter_cols(input.cols, input.data), input.cols)
			.to.deep.equal(expected);
		}
	});
});

describe('filter_cond', function() {
	it('Pass through data unchanged on `1 = 1`', function() {
		const df = [{'a': 1, 'b': 2, 'c': 3}, {'a': 2, 'b': 1, 'c': 0}];
		const tests = new Map([
			[ { cond: '1 = 1', data: df }, df ]
		]);
		for (let [input, expected] of tests) {
			expect(d3_lq.filter_cond(input.cond, input.data), input.cond)
			.to.deep.equal(expected);
		}
	});

	it('Selects rows using `=` operator', function() {
		const df = [{'a': 1, 'b': 2, 'c': 3}, {'a': 2, 'b': 1, 'c': 0}];
		const tests = new Map([
			[ { cond: 'a = 1', data: df },   [df[0]] ],
			[ { cond: 'c = 0', data: df },   [df[1]] ],
			[ { cond: 'c = 100', data: df }, []      ],
		]);
		for (let [input, expected] of tests) {
			expect(d3_lq.filter_cond(input.cond, input.data), input.cond)
			.to.deep.equal(expected);
		}
	});

	it('Selects rows using `=` and `AND` operators', function() {
		const df = [{'a': 1, 'b': 2, 'c': 3}, {'a': 2, 'b': 1, 'c': 0}];
		const tests = new Map([
			[ { cond: 'a = 2 AND b = 1', data: df },           [df[1]] ],
			[ { cond: 'a = 1 AND b = 2 AND c = 3', data: df }, [df[0]] ],
			[ { cond: 'c = 0 AND c = 1', data: df },           []      ],
		]);
		for (let [input, expected] of tests) {
			expect(d3_lq.filter_cond(input.cond, input.data), input.cond)
			.to.deep.equal(expected);
		}
	});

	it('Selects rows using `=` and `OR` operators', function() {
		const df = [{'a': 1, 'b': 2, 'c': 3}, {'a': 2, 'b': 1, 'c': 0}];
		const tests = new Map([
			[ { cond: 'a = 2 OR b = 1', data: df },          [df[1]] ],
			[ { cond: 'a = 1 OR b = 1 OR c = 1', data: df }, df      ],
			[ { cond: 'c = 1 OR c = 2', data: df },          []      ],
		]);
		for (let [input, expected] of tests) {
			expect(d3_lq.filter_cond(input.cond, input.data), input.cond)
			.to.deep.equal(expected);
		}
	});

	it('Selects rows using `=`, `AND, and `OR` operators', function() {
		const df = [{'a': 1, 'b': 2, 'c': 3}, {'a': 2, 'b': 1, 'c': 0}];
		const tests = new Map([
			[ { cond: 'a = 1 AND b = 1 OR c = 0', data: df }, [df[1]] ],
			[ { cond: 'a = 1 OR b = 1 AND c = 0', data: df }, df      ],
			[ { cond: 'c = 1 OR c = 2', data: df },           []      ],
		]);
		for (let [input, expected] of tests) {
			expect(d3_lq.filter_cond(input.cond, input.data), input.cond)
			.to.deep.equal(expected);
		}
	});
});

describe('query', function() {
	it("Passes through data unaltered if requested", function() {
		const df = csvParse(fs.readFileSync('./test/test.csv', 'UTF-8'));
		expect(query("SELECT * WHERE 1 = 1", df)).to.deep.equal(df);
	});
});
