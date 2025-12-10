// Overview models/helpers

interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
}

interface RecentAlert {
  id: string;
  studentName: string;
  reason: string;
  date: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface OverviewResponse {
  totalStudents: number;
  avgAttendance: number;
  riskDistribution?: RiskDistribution;
  recentAlerts?: RecentAlert[];
}

export function mapOverviewResponse(resp: OverviewResponse) {
  return {
    totalStudents: resp.totalStudents,
    avgAttendance: resp.avgAttendance,
    riskDistribution: resp.riskDistribution || { low: 0, medium: 0, high: 0 },
    recentAlerts: resp.recentAlerts || [],
  };
}
