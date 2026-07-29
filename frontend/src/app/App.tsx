import { RouterOutlet, RouterProvider } from '@router';

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
