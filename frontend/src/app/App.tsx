import { RouterOutlet } from '@router';
import { RouterProvider } from '@router/navigation';

import { Layout } from './layout';
import { AppProvider } from './providers';

export function App() {
  return (
    <AppProvider>
      <RouterProvider>
        <Layout>
          <RouterOutlet />
        </Layout>
      </RouterProvider>
    </AppProvider>
  );
}
