import { test } from "node:test";
import assert from "node:assert/strict";
import { triangleProperties, cubeProperties } from "../src/math/formulas.js";
import { distance } from "../src/math/vector.js";

test("distance 3-4-5", () => assert.equal(distance({x:0,y:0},{x:3,y:4}),5));
test("cube volume", () => assert.equal(cubeProperties(3).volume,27));
// Full test suite from the zip
