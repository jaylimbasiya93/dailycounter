// Local timezone YYYY-MM-DD date formatter

export function getLocalDateStr(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getFutureDateStr(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return getLocalDateStr(d);
}

export function getDaysDifference(targetDateStr: string, fromDateStr: string = getLocalDateStr()): number {
  try {
    const tParts = targetDateStr.split('-').map(Number);
    const fParts = fromDateStr.split('-').map(Number);
    if (tParts.length !== 3 || fParts.length !== 3) return 30;

    const tDate = new Date(tParts[0], tParts[1] - 1, tParts[2]);
    const fDate = new Date(fParts[0], fParts[1] - 1, fParts[2]);
    
    const diffMs = tDate.getTime() - fDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  } catch {
    return 30;
  }
}

export function getDueDateTimestamp(dueDateStr?: string): number {
  if (!dueDateStr) return Infinity;
  try {
    const parts = dueDateStr.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
    }
    const parsed = Date.parse(dueDateStr);
    if (!isNaN(parsed)) return parsed;
  } catch {
    // fallback
  }
  return Infinity;
}

export function getDaysFromStartDate(startDateStr: string, targetDateStr: string): number {
  try {
    const sParts = startDateStr.split('-').map(Number);
    const tParts = targetDateStr.split('-').map(Number);
    if (sParts.length !== 3 || tParts.length !== 3) return 0;

    const sDate = new Date(sParts[0], sParts[1] - 1, sParts[2]);
    const tDate = new Date(tParts[0], tParts[1] - 1, tParts[2]);

    const diffMs = tDate.getTime() - sDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 0;
    return diffDays + 1;
  } catch {
    return 0;
  }
}



