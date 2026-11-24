import Pipeline from '../../../src/screens/Pipeline';
import PipelineViewportGuard from '../../../src/components/PipelineViewportGuard';
import { getPrivateData } from '../../lib/data';
export default async function PipelinePage() {
  const applications = await getPrivateData('/applications');
  return <PipelineViewportGuard><Pipeline initialApplications={applications || []} /></PipelineViewportGuard>;
}
