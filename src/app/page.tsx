import { getCookies } from 'next-client-cookies/server';
import { redirect } from 'next/navigation';

export default async function Page() {
    const cookies = await getCookies();
    const accessToken = cookies.get('accessToken');

    if (!accessToken) return redirect('/login');

    return redirect('/app');
}
