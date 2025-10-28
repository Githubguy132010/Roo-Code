import { describe, expect, it } from "vitest"

import {
	determineResourceProfileName,
	getResourceProfileLimits,
	normalizeProfileOverride,
	type ResourceMetrics,
	type ResourceProfileName,
} from "../index"

describe("resource profile detection", () => {
	const buildMetrics = (overrides: Partial<ResourceMetrics>): ResourceMetrics => ({
		cpuCount: 12,
		totalMemGb: 32,
		...overrides,
	})

	it("classifies low resource systems by cpu count", () => {
		expect(determineResourceProfileName(buildMetrics({ cpuCount: 4, totalMemGb: 32 }))).toBe("low")
	})

	it("classifies low resource systems by memory availability", () => {
		expect(determineResourceProfileName(buildMetrics({ cpuCount: 12, totalMemGb: 6 }))).toBe("low")
	})

	it("classifies medium resource systems", () => {
		expect(determineResourceProfileName(buildMetrics({ cpuCount: 6, totalMemGb: 12 }))).toBe("medium")
	})

	it("classifies high resource systems", () => {
		expect(determineResourceProfileName(buildMetrics({ cpuCount: 16, totalMemGb: 64 }))).toBe("high")
	})

	it("normalizes profile overrides", () => {
		const cases: Array<[string | undefined, ResourceProfileName | undefined]> = [
			[undefined, undefined],
			["", undefined],
			["LoW", "low"],
			[" MEDIUM ", "medium"],
			["high", "high"],
			["unsupported", undefined],
		]

		for (const [input, expected] of cases) {
			expect(normalizeProfileOverride(input)).toBe(expected)
		}
	})

	it("exposes preset limits for overrides", () => {
		const lowLimits = getResourceProfileLimits("low")
		expect(lowLimits.batchSegmentThreshold).toBeLessThan(getResourceProfileLimits("high").batchSegmentThreshold)
		expect(lowLimits.parsingConcurrency).toBeLessThan(getResourceProfileLimits("medium").parsingConcurrency)
	})
})
