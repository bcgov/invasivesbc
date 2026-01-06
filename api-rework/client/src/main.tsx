import { createRoot } from 'react-dom/client';
import Client from 'client';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<Client />);
}
