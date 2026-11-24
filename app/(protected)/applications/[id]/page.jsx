import ApplicationDetails from '../../../../src/screens/ApplicationDetails';
import { getPrivateData } from '../../../lib/data';
export default async function ApplicationDetailsPage({ params }) {
  const { id } = await params;
  const [application, interviews] = await Promise.all([getPrivateData(`/applications/${id}`), getPrivateData(`/interviews?applicationId=${id}`)]);
  return <ApplicationDetails initialApplication={application} initialInterviews={interviews || []} />;
}
