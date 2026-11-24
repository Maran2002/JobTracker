import AddApplication from '../../../../../src/screens/AddApplication';
import { getPrivateData } from '../../../../lib/data';
export default async function EditApplicationPage({ params }) {
  const { id } = await params;
  const application = await getPrivateData(`/applications/${id}`);
  return <AddApplication initialApplication={application} />;
}
