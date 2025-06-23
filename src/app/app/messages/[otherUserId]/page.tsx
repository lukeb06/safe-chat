import { getMessagesWithUser, getPublicUser, getUserFromAccessToken } from '@/lib/actions';
import { getCookies } from 'next-client-cookies/server';
import { redirect } from 'next/navigation';
import { MessagesClient } from './client';

export default async function MessagePage({ params }: { params: any }) {
    const { otherUserId } = await params;
    const cookies = await getCookies();
    const accessToken = cookies.get('accessToken');
    if (!accessToken) return redirect('/login');
    const myUser = await getUserFromAccessToken(accessToken);
    if (!myUser) return redirect('/login');
    if (isNaN(otherUserId)) return redirect('/app/messages');

    const _messages = await getMessagesWithUser(accessToken, parseInt(otherUserId));
    const messages = await Promise.all(
        _messages.map(async m => ({
            ...m,
            author: await getPublicUser(accessToken, m.authorId),
        })),
    );

    return <MessagesClient messages={messages} />;
}
