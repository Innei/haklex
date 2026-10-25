import { Navigate, useParams } from 'react-router-dom';

import { DocPage } from '../../components/doc/DocPage';
import { extensions } from '../../site/extensions';
import { extensionDetails } from './details';

export function ExtensionPage() {
  const { id } = useParams();
  const meta = extensions.find((e) => e.id === id);
  if (!meta) return <Navigate replace to="/extensions" />;
  const Detail = extensionDetails[meta.id];

  return (
    <DocPage
      breadcrumb={['Reference', 'Extensions']}
      lead={meta.description}
      meta={<span className="badge">{`@haklex/${meta.packageName}`}</span>}
      title={meta.name}
    >
      <div className="doc-flat" key={meta.id}>
        <Detail />
      </div>
    </DocPage>
  );
}
