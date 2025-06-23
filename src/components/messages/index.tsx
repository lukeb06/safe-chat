import { getConversations, getUserFromAccessToken } from '@/lib/actions';
import { getCookies } from 'next-client-cookies/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import ConvoListSkeleton from './skeleton';
import { Link } from 'next-view-transitions';

export default function ConvoList() {
    return <Suspense fallback={<ConvoListSkeleton />}>{<Conversations />}</Suspense>;
}

async function Conversations() {
    const cookies = await getCookies();
    const accessToken = cookies.get('accessToken');
    if (!accessToken) return redirect('/login');
    const user = await getUserFromAccessToken(accessToken);
    if (!user) return redirect('/login');

    const convos = await getConversations(accessToken);

    return convos.map(c => {
        const otherUser = c.authorId !== user.id ? c.author : c.recipient;
        return (
            <Link
                href={`/app/messages/${otherUser?.id}`}
                key={c.id}
                className="flex items-center gap-4 py-2 px-4 hover:bg-foreground/5 rounded cursor-pointer"
            >
                <div className="h-8 w-8 rounded-full bg-foreground/10" />
                <div className="flex flex-col gap-1">
                    <span>{otherUser?.displayName || otherUser?.username}</span>
                    <span className="text-foreground/75">
                        {c.content.length > 10 ? c.content.slice(0, 10) + '...' : c.content}
                    </span>
                </div>
            </Link>
        );
    });
}
