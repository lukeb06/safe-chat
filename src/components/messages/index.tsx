import { getConversations } from '@/lib/actions';
import { getCookies } from 'next-client-cookies/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default function ConvoList() {
    return <Suspense fallback={<div>Loading...</div>}>{<Conversations />}</Suspense>;
}

async function Conversations() {
    const cookies = await getCookies();
    const accessToken = cookies.get('accessToken');
    if (!accessToken) return redirect('/login');

    const convos = await getConversations(accessToken);

    return convos.map(c => (
        <div key={c.id}>
            <p>
                {c.author?.username} says: {c.content}
            </p>
        </div>
    ));
}
