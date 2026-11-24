import Settings from '../../../src/screens/Settings';
import { getPrivateData } from '../../lib/data';
export default async function SettingsPage() {
  const [user, preferences] = await Promise.all([getPrivateData('/user/me'), getPrivateData('/user/preferences')]);
  const initialPreferences = preferences?.preferences || preferences || null;
  if (initialPreferences?.accentColor?.toLowerCase() === '#4f46e5') initialPreferences.accentColor = '#2f6b5e';
  return <Settings initialUser={user} initialPreferences={initialPreferences} />;
}
