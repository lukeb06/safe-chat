import { getChannels, getUserFromAccessToken } from '@/lib/actions';
import { getCookies } from 'next-client-cookies/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import ConvoListSkeleton from './skeleton';
import { Link } from 'next-view-transitions';
import ChannelsClient from './client';

export default function ChannelList() {
    return <Suspense fallback={<ConvoListSkeleton />}>{<Channels />}</Suspense>;
}

async function Channels() {
    const cookies = await getCookies();
    const accessToken = cookies.get('accessToken');
    if (!accessToken) return redirect('/login');
    const user = await getUserFromAccessToken(accessToken);
    if (!user) return redirect('/login');

    const { myChannels, otherChannels } = await getChannels(accessToken);

    return <ChannelsClient myChannels={myChannels} otherChannels={otherChannels} />;
}
