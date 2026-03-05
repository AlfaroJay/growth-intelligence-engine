import { redirect } from 'next/navigation';

// Root redirects to the intake form
export default function RootPage() {
  redirect('/growth-score');
}
