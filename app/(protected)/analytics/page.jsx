import Analytics from '../../../src/screens/Analytics';
import { getPrivateData } from '../../lib/data';
export default async function AnalyticsPage() {
  const stats = await getPrivateData('/analytics');
  return <Analytics initialStats={stats || { totalApplications: 0, byStatus: {} }} />;
}
