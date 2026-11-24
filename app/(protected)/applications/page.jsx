import Applications from '../../../src/screens/Applications';
import { getPrivateData } from '../../lib/data';
export default async function ApplicationsPage() {
  const applications = await getPrivateData('/applications');
  return <Applications initialApplications={applications || []} />;
}
