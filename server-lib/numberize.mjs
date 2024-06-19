
export default function numberize(measurement) {
	if (!measurement) {
		return null
	}

	try {
		if (measurement.toLowerCase().endsWith('px')) {
			measurement = measurement.substring(0, measurement.length - 2)
		}

		let num = parseInt(measurement)
		if (Number.isNaN(num)) {
			return null
		}

		return num
	}
	catch (e) {
		return null
	}
}