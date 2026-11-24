import Schedule from '../../../src/screens/Schedule';
import { getPrivateData } from '../../lib/data';
export default async function SchedulePage() {
  const interviews = await getPrivateData('/interviews');
  return <Schedule initialInterviews={interviews || []} />;
}
