import { getMessagesFromChannel, getUserFromAccessToken } from '@/lib/actions';
import { getCookies } from 'next-client-cookies/server';
import { redirect } from 'next/navigation';
import { MessagesClient } from './client';

export default async function MessagePage({ params }: { params: any }) {
    const cookies = await getCookies();
    const { channelName } = await params;
    const accessToken = cookies.get('accessToken');
    if (!accessToken) return redirect('/login');
    const myUser = await getUserFromAccessToken(accessToken);
    if (!myUser) return redirect('/login');

    const messages = await getMessagesFromChannel(channelName, accessToken);

    return <MessagesClient myUser={myUser} messages={messages} />;
}
