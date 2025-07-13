interface AttendanceResult {
  canBunk: number;
  requiredToAttend: number;
  targetPercentage: number;
  isExact: boolean;
}

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
    if (targetPercentage >= 100) {
      result.requiredToAttend = total - present;
    } else {
      const required = Math.ceil(
        (targetPercentage * total - 100 * present) / (100 - targetPercentage)
      );
      result.requiredToAttend = Math.max(0, required);
    }
    return result;
  }  if (currentPercentage > targetPercentage) {
    const bunkableExact = (100 * present - targetPercentage * total) / targetPercentage;
    const bunkable = Math.floor(bunkableExact);
    
    result.canBunk = Math.max(0, bunkable);
    
    if (bunkableExact > 0 && bunkableExact < 0.9 && bunkable === 0) {
      result.isExact = true;
    }
    
    return result;
  }

  return result;
}
