interface AttendanceResult {
  canBunk: number;
  requiredToAttend: number;
  targetPercentage: number;
  isExact: boolean;
}

/**
 * Calculates attendance metrics based on present and total classes
 * @param present Number of classes attended
 * @param total Total number of classes
 * @param targetPercentage Target attendance percentage (default: 75)
 * @returns AttendanceResult object with attendance metrics
 */

export function calculateAttendance(
  present: number,
  total: number,
  targetPercentage: number = 75
): AttendanceResult {
  const result: AttendanceResult = {
    canBunk: 0,
    requiredToAttend: 0,
    targetPercentage,
    isExact: false,
  };

  if (total <= 0 || present < 0 || present > total) {
    return result;
  }

  const currentPercentage = (present / total) * 100;

  if (currentPercentage === targetPercentage) {
    result.isExact = true;
    return result;
  }
  if (currentPercentage < targetPercentage) {
    // Special case: If target is 100%, calculate differently to avoid division by zero
    if (targetPercentage >= 100) {
      // To reach 100%, you must attend all remaining classes
      result.requiredToAttend = total - present;
    } else {
      const required = Math.ceil(
        (targetPercentage * total - 100 * present) / (100 - targetPercentage)
      );
      result.requiredToAttend = Math.max(0, required);
    }
    return result;
  }  if (currentPercentage > targetPercentage) {
    // Calculate how many classes can be bunked while maintaining the target percentage
    // The formula can result in decimal values, and Math.floor ensures we don't go below target
    const bunkableExact = (100 * present - targetPercentage * total) / targetPercentage;
    const bunkable = Math.floor(bunkableExact);
    
    result.canBunk = Math.max(0, bunkable);
    
    // Only mark as isExact if the bunkable value is very small (close to 0)
    // This prevents showing "risky to skip" for cases where you can bunk classes
    if (bunkableExact > 0 && bunkableExact < 0.9 && bunkable === 0) {
      result.isExact = true; // Mark this as an edge case
    }
    
    return result;
  }

  return result;
}
