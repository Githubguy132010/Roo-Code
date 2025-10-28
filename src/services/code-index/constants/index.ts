import { CODEBASE_INDEX_DEFAULTS } from "@roo-code/types"
import * as os from "os"

export type ResourceProfileName = "low" | "medium" | "high"

export interface ResourceProfileLimits {
	batchSegmentThreshold: number
	parsingConcurrency: number
	batchProcessingConcurrency: number
	maxPendingBatches: number
}

const RESOURCE_PROFILE_ENV_KEY = "ROO_CODE_INDEX_PROFILE"

const RESOURCE_PROFILE_PRESETS: Record<ResourceProfileName, ResourceProfileLimits> = {
	low: {
		batchSegmentThreshold: 16,
		parsingConcurrency: 2,
		batchProcessingConcurrency: 2,
		maxPendingBatches: 4,
	},
	medium: {
		batchSegmentThreshold: 32,
		parsingConcurrency: 4,
		batchProcessingConcurrency: 4,
		maxPendingBatches: 10,
	},
	high: {
		batchSegmentThreshold: 60,
		parsingConcurrency: 10,
		batchProcessingConcurrency: 10,
		maxPendingBatches: 20,
	},
}

export interface ResourceMetrics {
	cpuCount: number
	totalMemGb: number
}

export const normalizeProfileOverride = (value: string | undefined): ResourceProfileName | undefined => {
	if (!value) {
		return undefined
	}

	const normalized = value.trim().toLowerCase()
	if (normalized === "low" || normalized === "medium" || normalized === "high") {
		return normalized
	}

	return undefined
}

export const determineResourceProfileName = (metrics: ResourceMetrics): ResourceProfileName => {
	const { cpuCount, totalMemGb } = metrics

	if (cpuCount <= 4 || totalMemGb <= 8) {
		return "low"
	}

	if (cpuCount <= 8 || totalMemGb <= 16) {
		return "medium"
	}

	return "high"
}

const detectSystemMetrics = (): ResourceMetrics => {
	const cpuCount = (() => {
		try {
			return os.cpus()?.length ?? 1
		} catch {
			return 1
		}
	})()

	const totalMemGb = (() => {
		try {
			return os.totalmem() / 1024 / 1024 / 1024
		} catch {
			return 8
		}
	})()

	return {
		cpuCount,
		totalMemGb,
	}
}

const resolveResourceProfile = (): ResourceProfileName => {
	const override = normalizeProfileOverride(process.env[RESOURCE_PROFILE_ENV_KEY])
	if (override) {
		return override
	}

	const metrics = detectSystemMetrics()
	return determineResourceProfileName(metrics)
}

export const getResourceProfileLimits = (profile: ResourceProfileName): ResourceProfileLimits =>
	RESOURCE_PROFILE_PRESETS[profile]

const resourceProfileName = resolveResourceProfile()
const resourceProfileLimits = getResourceProfileLimits(resourceProfileName)

export const RESOURCE_PROFILE_NAME = resourceProfileName
export const RESOURCE_PROFILE_LIMITS = resourceProfileLimits

/**Parser */
export const MAX_BLOCK_CHARS = 1000
export const MIN_BLOCK_CHARS = 50
export const MIN_CHUNK_REMAINDER_CHARS = 200 // Minimum characters for the *next* chunk after a split
export const MAX_CHARS_TOLERANCE_FACTOR = 1.15 // 15% tolerance for max chars

/**Search */
export const DEFAULT_SEARCH_MIN_SCORE = CODEBASE_INDEX_DEFAULTS.DEFAULT_SEARCH_MIN_SCORE
export const DEFAULT_MAX_SEARCH_RESULTS = CODEBASE_INDEX_DEFAULTS.DEFAULT_SEARCH_RESULTS

/**File Watcher */
export const QDRANT_CODE_BLOCK_NAMESPACE = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
export const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024 // 1MB

/**Directory Scanner */
export const MAX_LIST_FILES_LIMIT_CODE_INDEX = 50_000
export const BATCH_SEGMENT_THRESHOLD = resourceProfileLimits.batchSegmentThreshold // Number of code segments to batch for embeddings/upserts
export const MAX_BATCH_RETRIES = 3
export const INITIAL_RETRY_DELAY_MS = 500
export const PARSING_CONCURRENCY = resourceProfileLimits.parsingConcurrency
export const MAX_PENDING_BATCHES = resourceProfileLimits.maxPendingBatches // Maximum number of batches to accumulate before waiting

/**OpenAI Embedder */
export const MAX_BATCH_TOKENS = 100000
export const MAX_ITEM_TOKENS = 8191
export const BATCH_PROCESSING_CONCURRENCY = resourceProfileLimits.batchProcessingConcurrency

/**Gemini Embedder */
export const GEMINI_MAX_ITEM_TOKENS = 2048
