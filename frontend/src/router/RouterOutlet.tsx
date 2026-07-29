import { resolveRoute } from './routes';
import { useRouter } from './useRouter';

export function RouterOutlet() {
  const { currentPath } = useRouter();
  const route = resolveRoute(currentPath);
  const Page = route.component;

  return <Page />;
}
