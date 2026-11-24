import Admin from '../../../src/screens/admin/Admin';
import { getPrivateData } from '../../lib/data';
export default async function AdminPage() {
  const user = await getPrivateData('/user/me');
  return <Admin initialUser={user} />;
}
