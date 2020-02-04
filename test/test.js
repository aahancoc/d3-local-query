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
			expect(d3_lq.tokenize(query)).to.deep.equal(expected);
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
			expect(d3_lq.tokenize(query)).to.deep.equal(expected);
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
			expect(d3_lq.filter_cols(input.cols, input.data))
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
			expect(d3_lq.filter_cols(input.cols, input.data))
			.to.deep.equal(expected);
		}
	});
});

describe('filter_cond', function() {
	it('Pass through data unchanged on `1 = 1`', function() {
		const df = [{'a': 1, 'b': 2, 'c': 3}, {'a': 2, 'b': 1, 'c': 0}];
		const tests = new Map([
			[
				{ cond: '1 = 1', data: df },
				[{'a': 1, 'b': 2, 'c': 3}, {'a': 2, 'b': 1, 'c': 0}]
			]
		]);
		for (let [input, expected] of tests) {
			expect(d3_lq.filter_cond(input.cond, input.data))
			.to.deep.equal(expected);
		}
	});

	it('Selects rows using `=` statements', function() {
		const df = [{'a': 1, 'b': 2, 'c': 3}, {'a': 2, 'b': 1, 'c': 0}];
		const tests = new Map([
			[
				{ cond: 'a = 1', data: df },
				[{'a': 1, 'b': 2, 'c': 3}]
			], [
				{ cond: 'c = 0', data: df },
				[{'a': 2, 'b': 1, 'c': 0}]
			],
		]);
		for (let [input, expected] of tests) {
			expect(d3_lq.filter_cond(input.cond, input.data))
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