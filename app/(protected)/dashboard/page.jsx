import Dashboard from '../../../src/screens/Dashboard';
import { getPrivateData } from '../../lib/data';
export default async function DashboardPage() {
  const [applications, interviews, user] = await Promise.all([getPrivateData('/applications'), getPrivateData('/interviews'), getPrivateData('/user/me')]);
  return <Dashboard initialApplications={applications || []} initialInterviews={interviews || []} initialUser={user} />;
}
