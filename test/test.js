import {csvParse} from "d3-dsv";
import {assert} from "chai"
import fs from "fs";
import d3_lq from "../index.js";

const df = csvParse(fs.readFileSync('./test/test.csv', 'UTF-8'));

describe('query', function() {
	it("Passes through data unaltered if requested", function() {
		assert.equal(d3_lq("SELECT * FROM _ WHERE true", df), df);
	});
});